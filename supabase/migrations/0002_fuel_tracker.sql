-- ============================================================
-- BRICK — Phase 7: Fuel tracker (food + water)
--
-- Apply via Supabase Dashboard → SQL Editor (paste this whole file)
-- or via the Supabase CLI: `supabase db push`.
-- ============================================================

-- Multiple meals per day, each with its own row.
CREATE TABLE food_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  logged_at   timestamptz DEFAULT now() NOT NULL,
  meal_type   text NOT NULL CHECK (meal_type IN ('breakfast','lunch','dinner','snack')),
  name        text NOT NULL,
  calories    numeric,
  protein_g   numeric,
  carbs_g     numeric,
  fat_g       numeric
);

CREATE INDEX food_logs_user_logged_at_idx ON food_logs (user_id, logged_at DESC);

-- One aggregate row per day per user (water glasses count).
CREATE TABLE water_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  logged_at   date DEFAULT CURRENT_DATE NOT NULL,
  glasses     integer DEFAULT 0 NOT NULL CHECK (glasses >= 0),
  UNIQUE(user_id, logged_at)
);

CREATE INDEX water_logs_user_logged_at_idx ON water_logs (user_id, logged_at DESC);

-- ============================================================
-- Row-level security
-- ============================================================
ALTER TABLE food_logs  ENABLE ROW LEVEL SECURITY;
ALTER TABLE water_logs ENABLE ROW LEVEL SECURITY;

-- food_logs
CREATE POLICY "food_logs_select" ON food_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "food_logs_insert" ON food_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "food_logs_update" ON food_logs FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "food_logs_delete" ON food_logs FOR DELETE USING (auth.uid() = user_id);

-- water_logs
CREATE POLICY "water_logs_select" ON water_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "water_logs_insert" ON water_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "water_logs_update" ON water_logs FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "water_logs_delete" ON water_logs FOR DELETE USING (auth.uid() = user_id);
