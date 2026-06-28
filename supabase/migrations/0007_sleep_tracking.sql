-- ============================================================
-- BRICK — Sleep tracking (Apple Watch via Shortcuts)
--
-- Adds two tables:
--   • sleep_logs        — one row per user per night, fed by an iOS Shortcut
--                         that POSTs Apple Health sleep data to the
--                         `sync-apple-sleep` Edge Function.
--   • sleep_sync_tokens — one opaque per-user secret the Shortcut sends so the
--                         Edge Function can resolve the owning user WITHOUT the
--                         user's Supabase JWT (Shortcuts can't hold a fresh JWT).
--                         The Edge Function reads this table with the service
--                         role; the web app reads/creates its own token via RLS.
--
-- Apply via Supabase Dashboard → SQL Editor (paste this whole file)
-- or via the Supabase CLI: `supabase db push`.
-- ============================================================

-- One aggregate row per night per user. `logged_date` is the calendar date the
-- sleep is attributed to (typically the morning you woke up). Stage minutes and
-- sleep_score are optional — not every device/iOS version reports them.
CREATE TABLE sleep_logs (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid REFERENCES auth.users NOT NULL,
  logged_date      date NOT NULL,
  sleep_start      timestamptz,
  sleep_end        timestamptz,
  duration_minutes integer CHECK (duration_minutes IS NULL OR duration_minutes >= 0),
  sleep_score      integer CHECK (sleep_score IS NULL OR sleep_score BETWEEN 0 AND 100),
  deep_minutes     integer CHECK (deep_minutes  IS NULL OR deep_minutes  >= 0),
  rem_minutes      integer CHECK (rem_minutes   IS NULL OR rem_minutes   >= 0),
  light_minutes    integer CHECK (light_minutes IS NULL OR light_minutes >= 0),
  awake_minutes    integer CHECK (awake_minutes IS NULL OR awake_minutes >= 0),
  source           text DEFAULT 'apple_health' NOT NULL,
  raw              jsonb,
  created_at       timestamptz DEFAULT now() NOT NULL,
  updated_at       timestamptz DEFAULT now() NOT NULL,
  UNIQUE (user_id, logged_date)
);

CREATE INDEX sleep_logs_user_date_idx ON sleep_logs (user_id, logged_date DESC);

-- One token per user. Regenerating = overwrite the row's token value.
CREATE TABLE sleep_sync_tokens (
  token        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid REFERENCES auth.users NOT NULL UNIQUE,
  created_at   timestamptz DEFAULT now() NOT NULL,
  last_used_at timestamptz
);

-- ============================================================
-- Row-level security
-- ============================================================
ALTER TABLE sleep_logs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE sleep_sync_tokens ENABLE ROW LEVEL SECURITY;

-- sleep_logs: a user can read and delete their own nights. Inserts/updates flow
-- through the Edge Function (service role, bypasses RLS); the insert/update
-- policies below also allow manual entry from the authenticated client.
CREATE POLICY "sleep_logs_select" ON sleep_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sleep_logs_insert" ON sleep_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sleep_logs_update" ON sleep_logs FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sleep_logs_delete" ON sleep_logs FOR DELETE USING (auth.uid() = user_id);

-- sleep_sync_tokens: a user manages only their own token. The Edge Function
-- looks tokens up with the service role, which bypasses these policies.
CREATE POLICY "sleep_sync_tokens_select" ON sleep_sync_tokens FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sleep_sync_tokens_insert" ON sleep_sync_tokens FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sleep_sync_tokens_update" ON sleep_sync_tokens FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sleep_sync_tokens_delete" ON sleep_sync_tokens FOR DELETE USING (auth.uid() = user_id);
