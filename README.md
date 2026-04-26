# BRICK

> Lay one every day.

A mobile-first web app for tracking habits, lifts, and body — one brick at a time.

## Stack

- **Vite** + **React 18**
- **Tailwind CSS** (custom Brick palette + Barlow Condensed / Barlow / DM Mono)
- **Supabase** for auth + Postgres
- **TanStack React Query** for data fetching
- **Recharts** for charts (used in later phases)
- **lucide-react** for icons

## Getting started

### 1. Install

```bash
npm install
```

### 2. Configure Supabase

Create a Supabase project, then copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

### 3. Apply the database migration

The schema lives in [`supabase/migrations/0001_initial_schema.sql`](supabase/migrations/0001_initial_schema.sql) and creates 8 tables (`habits`, `habit_logs`, `exercises`, `workout_templates`, `template_exercises`, `workouts`, `workout_sets`, `body_logs`) with **Row Level Security** enabled and per-user policies.

Apply it via either:

- **Supabase CLI** — `supabase db push` (after `supabase link --project-ref <ref>`), or
- **Dashboard** — paste the contents of the SQL file into the Supabase SQL editor and run.

### 4. Run

```bash
npm run dev
```

Open http://localhost:5173.

## Phase 1 scope

This scaffold ships:

- Email + password auth (sign up, sign in, sign out)
- Bottom nav with 5 tabs: **Today · Habits · Gym · Body · Stats**
- Placeholder screens for each tab
- Dark / light theme toggle (defaults to dark; persisted to localStorage)
- The full Supabase schema + RLS policies

Real screens, charts, and data hooks land in later phases.

## Brand tokens

| Token        | Hex      | Use                          |
| ------------ | -------- | ---------------------------- |
| `brick-red`  | #C8432B  | Primary CTA, PRs, streaks    |
| `ember`      | #E85D3A  | Active states, rest timer    |
| `mortar`     | #1C1A18  | App background (dark)        |
| `ash`        | #2E2B28  | Card background (dark)       |
| `dust`       | #4A4540  | Borders                      |
| `iron`       | #8C8078  | Muted text                   |
| `sand`       | #D4C9B8  | Secondary text               |
| `chalk`      | #F0EBE3  | Primary text                 |

Fonts: **Barlow Condensed** (display + headings, uppercase), **Barlow** (body), **DM Mono** (numbers + labels).

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — production build
- `npm run preview` — preview the production build
