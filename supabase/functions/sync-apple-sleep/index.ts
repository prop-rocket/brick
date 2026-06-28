// BRICK — sync-apple-sleep Edge Function
//
// Receives one night of Apple Health sleep data from an iOS Shortcut and upserts
// it into `sleep_logs`. The Shortcut can't hold a fresh Supabase JWT, so instead
// it sends a long-lived opaque token (created by the web app) in the
// `x-sync-token` header. We resolve that token to a user with the SERVICE ROLE
// key (server-side only — never shipped to the client or the Shortcut), then
// upsert on the user's behalf.
//
// Deploy:
//   supabase functions deploy sync-apple-sleep --no-verify-jwt
// (verify_jwt is also disabled in supabase/config.toml.)
//
// Required secrets (auto-injected by Supabase for deployed functions):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

import { createClient } from 'jsr:@supabase/supabase-js@2'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-sync-token, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

// Coerce to a non-negative integer, or null if absent/invalid.
function int(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null
  const n = Math.round(Number(v))
  return Number.isFinite(n) && n >= 0 ? n : null
}

// Coerce to an ISO timestamp string, or null.
function ts(v: unknown): string | null {
  if (!v) return null
  const d = new Date(String(v))
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

// Build the row to upsert, or null if the payload is missing a usable date.
function normalize(body: Record<string, unknown>, userId: string) {
  const sleepStart = ts(body.sleep_start)
  const sleepEnd = ts(body.sleep_end)

  // logged_date: explicit field wins; else derive from sleep_end (wake day).
  let loggedDate = typeof body.logged_date === 'string' ? body.logged_date.slice(0, 10) : null
  if (!loggedDate && sleepEnd) loggedDate = sleepEnd.slice(0, 10)
  if (!loggedDate || !/^\d{4}-\d{2}-\d{2}$/.test(loggedDate)) return null

  // duration: explicit field wins; else compute from start/end.
  let duration = int(body.duration_minutes)
  if (duration === null && sleepStart && sleepEnd) {
    duration = Math.max(
      0,
      Math.round((new Date(sleepEnd).getTime() - new Date(sleepStart).getTime()) / 60000),
    )
  }

  let score = int(body.sleep_score)
  if (score !== null) score = Math.min(100, score)

  return {
    user_id: userId,
    logged_date: loggedDate,
    sleep_start: sleepStart,
    sleep_end: sleepEnd,
    duration_minutes: duration,
    sleep_score: score,
    deep_minutes: int(body.deep_minutes),
    rem_minutes: int(body.rem_minutes),
    light_minutes: int(body.light_minutes),
    awake_minutes: int(body.awake_minutes),
    source: typeof body.source === 'string' ? body.source : 'apple_health',
    raw: body,
    updated_at: new Date().toISOString(),
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405)

  const token = req.headers.get('x-sync-token')?.trim()
  if (!token) return json({ error: 'Missing x-sync-token header' }, 401)

  const admin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  // Resolve the opaque token to a user.
  const { data: tokenRow, error: tokenErr } = await admin
    .from('sleep_sync_tokens')
    .select('user_id')
    .eq('token', token)
    .maybeSingle()
  if (tokenErr) return json({ error: 'Token lookup failed' }, 500)
  if (!tokenRow) return json({ error: 'Invalid sync token' }, 401)

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Body must be valid JSON' }, 400)
  }

  const row = normalize(body, tokenRow.user_id)
  if (!row) {
    return json({ error: 'Could not determine logged_date (send logged_date or sleep_end)' }, 400)
  }

  const { error: upsertErr } = await admin
    .from('sleep_logs')
    .upsert(row, { onConflict: 'user_id,logged_date' })
  if (upsertErr) return json({ error: upsertErr.message }, 500)

  // Best-effort heartbeat so the web app can show "last synced".
  await admin
    .from('sleep_sync_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('token', token)

  return json({ ok: true, logged_date: row.logged_date, duration_minutes: row.duration_minutes })
})
