-- BRICK — exercise soft-delete
-- Adds an `archived` flag so custom exercises can be "deleted" without breaking
-- foreign-key references from template_exercises / workout_sets (which have no
-- ON DELETE clause). Archived exercises stay in the DB so historical workouts
-- and summaries can still resolve their names; they are hidden from all pickers.

ALTER TABLE exercises ADD COLUMN IF NOT EXISTS archived boolean NOT NULL DEFAULT false;

-- Existing RLS update policy (is_custom = true AND auth.uid() = user_id) already
-- governs the soft-delete UPDATE, so no policy changes are needed.
