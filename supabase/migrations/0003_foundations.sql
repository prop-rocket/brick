-- Phase 8: Foundations — FK fix + performance indexes
-- Apply via Supabase Dashboard → SQL Editor

-- 1. Null-out any workouts whose template_id references a deleted template
--    (prevents constraint violation on non-empty databases)
UPDATE workouts
SET template_id = NULL
WHERE template_id IS NOT NULL
  AND template_id NOT IN (SELECT id FROM workout_templates);

-- 2. Add the missing FK (SET NULL so workout history survives template deletion)
ALTER TABLE workouts
  ADD CONSTRAINT workouts_template_id_fk
  FOREIGN KEY (template_id)
  REFERENCES workout_templates(id)
  ON DELETE SET NULL;

-- 3. Date-range composite indexes (Stats and Body history queries)
CREATE INDEX IF NOT EXISTS body_logs_user_logged_at_idx
  ON body_logs (user_id, logged_at DESC);

CREATE INDEX IF NOT EXISTS habit_logs_user_completed_at_idx
  ON habit_logs (user_id, completed_at DESC);

CREATE INDEX IF NOT EXISTS workouts_user_started_at_idx
  ON workouts (user_id, started_at DESC);

CREATE INDEX IF NOT EXISTS workout_sets_workout_id_idx
  ON workout_sets (workout_id, logged_at);
