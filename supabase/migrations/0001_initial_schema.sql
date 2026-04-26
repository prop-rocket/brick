-- BRICK — initial schema
-- Tables for habits, habit logs, exercises, workout templates, workouts, sets, and body logs.
-- Row Level Security is enabled on every table so each user can only access their own rows.

CREATE TABLE habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  name text,
  category text,
  color text,
  frequency_type text CHECK (frequency_type IN ('daily','weekly')),
  weekly_goal int,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid REFERENCES habits(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users,
  completed_at date DEFAULT CURRENT_DATE
);

CREATE TABLE exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text,
  muscle_group text,
  is_custom bool DEFAULT false,
  user_id uuid
);

CREATE TABLE workout_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  name text,
  is_preset bool DEFAULT false
);

CREATE TABLE template_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid REFERENCES workout_templates(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES exercises(id),
  "order" int
);

CREATE TABLE workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  template_id uuid,
  started_at timestamptz DEFAULT now(),
  ended_at timestamptz,
  notes text
);

CREATE TABLE workout_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id uuid REFERENCES exercises(id),
  set_number int,
  reps int,
  weight_kg numeric,
  logged_at timestamptz DEFAULT now()
);

CREATE TABLE body_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users,
  logged_at date DEFAULT CURRENT_DATE,
  weight_kg numeric,
  chest_cm numeric,
  waist_cm numeric,
  hips_cm numeric
);

-- Enable Row Level Security on every table
ALTER TABLE habits             ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises          ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_templates  ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_logs          ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Direct-ownership policies (user_id column on the table)
-- ============================================================

-- habits
CREATE POLICY "habits_select" ON habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "habits_insert" ON habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habits_update" ON habits FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habits_delete" ON habits FOR DELETE USING (auth.uid() = user_id);

-- habit_logs
CREATE POLICY "habit_logs_select" ON habit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "habit_logs_insert" ON habit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habit_logs_update" ON habit_logs FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "habit_logs_delete" ON habit_logs FOR DELETE USING (auth.uid() = user_id);

-- workout_templates
CREATE POLICY "workout_templates_select" ON workout_templates FOR SELECT USING (auth.uid() = user_id OR is_preset = true);
CREATE POLICY "workout_templates_insert" ON workout_templates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workout_templates_update" ON workout_templates FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workout_templates_delete" ON workout_templates FOR DELETE USING (auth.uid() = user_id);

-- workouts
CREATE POLICY "workouts_select" ON workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "workouts_insert" ON workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workouts_update" ON workouts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workouts_delete" ON workouts FOR DELETE USING (auth.uid() = user_id);

-- body_logs
CREATE POLICY "body_logs_select" ON body_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "body_logs_insert" ON body_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "body_logs_update" ON body_logs FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "body_logs_delete" ON body_logs FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- exercises: presets visible to all authed users; custom rows owned per user
-- ============================================================
CREATE POLICY "exercises_select" ON exercises FOR SELECT
  USING (is_custom = false OR auth.uid() = user_id);
CREATE POLICY "exercises_insert" ON exercises FOR INSERT
  WITH CHECK (is_custom = true AND auth.uid() = user_id);
CREATE POLICY "exercises_update" ON exercises FOR UPDATE
  USING (is_custom = true AND auth.uid() = user_id)
  WITH CHECK (is_custom = true AND auth.uid() = user_id);
CREATE POLICY "exercises_delete" ON exercises FOR DELETE
  USING (is_custom = true AND auth.uid() = user_id);

-- ============================================================
-- Indirect ownership: template_exercises (via workout_templates)
-- ============================================================
CREATE POLICY "template_exercises_select" ON template_exercises FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM workout_templates wt
    WHERE wt.id = template_exercises.template_id
      AND (wt.user_id = auth.uid() OR wt.is_preset = true)
  )
);
CREATE POLICY "template_exercises_insert" ON template_exercises FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM workout_templates wt
    WHERE wt.id = template_exercises.template_id
      AND wt.user_id = auth.uid()
  )
);
CREATE POLICY "template_exercises_update" ON template_exercises FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM workout_templates wt
    WHERE wt.id = template_exercises.template_id
      AND wt.user_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM workout_templates wt
    WHERE wt.id = template_exercises.template_id
      AND wt.user_id = auth.uid()
  )
);
CREATE POLICY "template_exercises_delete" ON template_exercises FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM workout_templates wt
    WHERE wt.id = template_exercises.template_id
      AND wt.user_id = auth.uid()
  )
);

-- ============================================================
-- Indirect ownership: workout_sets (via workouts)
-- ============================================================
CREATE POLICY "workout_sets_select" ON workout_sets FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM workouts w
    WHERE w.id = workout_sets.workout_id AND w.user_id = auth.uid()
  )
);
CREATE POLICY "workout_sets_insert" ON workout_sets FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM workouts w
    WHERE w.id = workout_sets.workout_id AND w.user_id = auth.uid()
  )
);
CREATE POLICY "workout_sets_update" ON workout_sets FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM workouts w
    WHERE w.id = workout_sets.workout_id AND w.user_id = auth.uid()
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM workouts w
    WHERE w.id = workout_sets.workout_id AND w.user_id = auth.uid()
  )
);
CREATE POLICY "workout_sets_delete" ON workout_sets FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM workouts w
    WHERE w.id = workout_sets.workout_id AND w.user_id = auth.uid()
  )
);
