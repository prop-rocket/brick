# Apple Watch → Brick sleep sync

Brick pulls your Apple Watch sleep data through a small **iOS Shortcut** that runs
every morning and POSTs last night's sleep to a Supabase **Edge Function**. No
native app, no third-party service — your data goes straight from Apple Health to
your own Brick database.

```
Apple Watch ──▶ Apple Health ──▶ iOS Shortcut (daily 10:30 AM)
                                      │  POST JSON + x-sync-token
                                      ▼
                       Supabase Edge Function (sync-apple-sleep)
                                      │  upsert (service role)
                                      ▼
                              sleep_logs table ──▶ Brick › Body › Sleep
```

## How auth works (and why it's safe)

A Shortcut can't hold a fresh Supabase login token (they expire hourly). Instead,
Brick gives you a **per-user sync token** — a random secret you paste into the
Shortcut once. The Edge Function looks that token up with the service-role key
(which stays on the server, never in the Shortcut) to find which user the data
belongs to. If the token ever leaks, tap **Regenerate** in Brick and the old one
stops working immediately.

---

## One-time setup

### 1. Deploy the database + function (developer, once)

Apply the migration (adds `sleep_logs` + `sleep_sync_tokens`):

```bash
supabase db push
# or paste supabase/migrations/0007_sleep_tracking.sql into the SQL editor
```

Deploy the Edge Function with JWT verification off (the Shortcut authenticates
with the custom token, not a Supabase JWT):

```bash
supabase functions deploy sync-apple-sleep --no-verify-jwt
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected automatically for
deployed functions — no manual secrets needed.

### 2. Generate your sync token (in Brick)

Open **Brick → Body → Sleep → Generate sync token**. Copy the two values shown:

- **Endpoint URL** — `https://<project>.supabase.co/functions/v1/sync-apple-sleep`
- **Sync token** — your personal secret

### 3. Build the Shortcut (on iPhone)

Open the **Shortcuts** app → **Automation** tab → **+** → **Create Personal
Automation**.

**Trigger**

- **Time of Day** → **10:30 AM**
- Repeat **Daily**
- Turn **off** “Ask Before Running” (so it runs silently)

**Actions**

1. **Find Health Samples**
   - Sample type: **Sleep** (use *Sleep Analysis* / *Time Asleep*)
   - Sort by **End Date**, **Latest first**
   - Limit: enough to cover one night (e.g. 1–50 samples)

2. **Calculate** the values you want to send. At minimum compute total time
   asleep in **minutes**. If you're on iOS 26+ you can also read **Sleep Score**
   and the per-stage totals (Deep / REM / Core/Light / Awake).

3. **Text** action — build the JSON body (insert your computed values as
   Shortcut variables where shown):

   ```json
   {
     "logged_date": "2026-06-28",
     "sleep_start": "2026-06-27T23:10:00",
     "sleep_end": "2026-06-28T07:05:00",
     "duration_minutes": 415,
     "sleep_score": 82,
     "deep_minutes": 78,
     "rem_minutes": 96,
     "light_minutes": 220,
     "awake_minutes": 21
   }
   ```

   Only `logged_date` (or `sleep_end`, which Brick falls back to) is required —
   every other field is optional. Send what your device reports.

4. **Get Contents of URL**
   - URL: your **Endpoint URL**
   - Method: **POST**
   - Headers:
     - `x-sync-token` → your **Sync token**
     - `Content-Type` → `application/json`
   - Request Body: **File** → the **Text** from step 3

5. *(optional)* **Show Notification** with the response so you can confirm it
   worked the first few mornings.

### 4. Test it

Run the automation manually once. iOS will prompt to allow Health access — accept
it. A successful response looks like:

```json
{ "ok": true, "logged_date": "2026-06-28", "duration_minutes": 415 }
```

Brick → Body → Sleep will show **Last synced …** and the night appears in the
chart and history.

---

## JSON field reference

| Field              | Type    | Required | Notes                                            |
| ------------------ | ------- | -------- | ------------------------------------------------ |
| `logged_date`      | `YYYY-MM-DD` | ✅*  | The night's wake-up date. *Falls back to `sleep_end`'s date if omitted. |
| `sleep_start`      | ISO 8601 | –       | When you fell asleep.                            |
| `sleep_end`        | ISO 8601 | –       | When you woke up.                                |
| `duration_minutes` | integer | –        | Total time asleep. Computed from start/end if omitted. |
| `sleep_score`      | 0–100   | –        | Apple Sleep Score (iOS 26+) if available.        |
| `deep_minutes`     | integer | –        | Deep-sleep total.                                |
| `rem_minutes`      | integer | –        | REM total.                                       |
| `light_minutes`    | integer | –        | Core/Light total.                                |
| `awake_minutes`    | integer | –        | Time awake in bed.                               |

The whole payload is also stored in `sleep_logs.raw` (jsonb) for debugging.

## Behavior notes

- **Idempotent:** one row per `(user, logged_date)`. Re-running the Shortcut for
  the same night overwrites that night — safe to retry.
- **Missed a morning?** Just run the automation manually; it sends whatever
  Health has for last night.
- **Regenerating the token** invalidates the old one — update the Shortcut's
  `x-sync-token` header afterward.

## Troubleshooting

| Response | Meaning | Fix |
| -------- | ------- | --- |
| `401 Missing x-sync-token header` | Header not set | Add the `x-sync-token` header in *Get Contents of URL*. |
| `401 Invalid sync token` | Token wrong/regenerated | Copy a fresh token from Brick into the Shortcut. |
| `400 Body must be valid JSON` | Malformed body | Check the Text action; ensure it's valid JSON. |
| `400 Could not determine logged_date` | No date sent | Include `logged_date` or `sleep_end`. |
