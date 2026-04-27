-- BRICK — gym seed
-- 46 exercises across 5 muscle groups + 4 preset workout templates.
-- Uses fixed deterministic UUIDs so re-running is fully idempotent.

-- ─── Exercises ───────────────────────────────────────────────────────────────

INSERT INTO exercises (id, name, muscle_group, is_custom, user_id) VALUES
  -- PUSH (01–0a)
  ('00000000-0000-0000-0000-000000000001', 'Bench Press',             'Push', false, null),
  ('00000000-0000-0000-0000-000000000002', 'Incline Bench',           'Push', false, null),
  ('00000000-0000-0000-0000-000000000003', 'Overhead Press',          'Push', false, null),
  ('00000000-0000-0000-0000-000000000004', 'Dumbbell Shoulder Press', 'Push', false, null),
  ('00000000-0000-0000-0000-000000000005', 'Lateral Raise',           'Push', false, null),
  ('00000000-0000-0000-0000-000000000006', 'Tricep Pushdown',         'Push', false, null),
  ('00000000-0000-0000-0000-000000000007', 'Skull Crushers',          'Push', false, null),
  ('00000000-0000-0000-0000-000000000008', 'Chest Fly',               'Push', false, null),
  ('00000000-0000-0000-0000-000000000009', 'Dips',                    'Push', false, null),
  ('00000000-0000-0000-0000-00000000000a', 'Push Up',                 'Push', false, null),
  -- PULL (0b–14)
  ('00000000-0000-0000-0000-00000000000b', 'Deadlift',                'Pull', false, null),
  ('00000000-0000-0000-0000-00000000000c', 'Barbell Row',             'Pull', false, null),
  ('00000000-0000-0000-0000-00000000000d', 'Pull Up',                 'Pull', false, null),
  ('00000000-0000-0000-0000-00000000000e', 'Lat Pulldown',            'Pull', false, null),
  ('00000000-0000-0000-0000-00000000000f', 'Seated Cable Row',        'Pull', false, null),
  ('00000000-0000-0000-0000-000000000010', 'Face Pull',               'Pull', false, null),
  ('00000000-0000-0000-0000-000000000011', 'Bicep Curl',              'Pull', false, null),
  ('00000000-0000-0000-0000-000000000012', 'Hammer Curl',             'Pull', false, null),
  ('00000000-0000-0000-0000-000000000013', 'Single Arm Row',          'Pull', false, null),
  ('00000000-0000-0000-0000-000000000014', 'Shrug',                   'Pull', false, null),
  -- LEGS (15–1e)
  ('00000000-0000-0000-0000-000000000015', 'Squat',                   'Legs', false, null),
  ('00000000-0000-0000-0000-000000000016', 'Front Squat',             'Legs', false, null),
  ('00000000-0000-0000-0000-000000000017', 'Leg Press',               'Legs', false, null),
  ('00000000-0000-0000-0000-000000000018', 'Romanian Deadlift',       'Legs', false, null),
  ('00000000-0000-0000-0000-000000000019', 'Leg Curl',                'Legs', false, null),
  ('00000000-0000-0000-0000-00000000001a', 'Leg Extension',           'Legs', false, null),
  ('00000000-0000-0000-0000-00000000001b', 'Calf Raise',              'Legs', false, null),
  ('00000000-0000-0000-0000-00000000001c', 'Hack Squat',              'Legs', false, null),
  ('00000000-0000-0000-0000-00000000001d', 'Lunges',                  'Legs', false, null),
  ('00000000-0000-0000-0000-00000000001e', 'Bulgarian Split Squat',   'Legs', false, null),
  -- CORE (1f–26)
  ('00000000-0000-0000-0000-00000000001f', 'Plank',                   'Core', false, null),
  ('00000000-0000-0000-0000-000000000020', 'Crunch',                  'Core', false, null),
  ('00000000-0000-0000-0000-000000000021', 'Cable Crunch',            'Core', false, null),
  ('00000000-0000-0000-0000-000000000022', 'Hanging Leg Raise',       'Core', false, null),
  ('00000000-0000-0000-0000-000000000023', 'Ab Wheel',                'Core', false, null),
  ('00000000-0000-0000-0000-000000000024', 'Russian Twist',           'Core', false, null),
  ('00000000-0000-0000-0000-000000000025', 'Decline Sit Up',          'Core', false, null),
  ('00000000-0000-0000-0000-000000000026', 'Oblique Crunch',          'Core', false, null),
  -- CARDIO (27–2e)
  ('00000000-0000-0000-0000-000000000027', 'Treadmill Run',           'Cardio', false, null),
  ('00000000-0000-0000-0000-000000000028', 'Cycling',                 'Cardio', false, null),
  ('00000000-0000-0000-0000-000000000029', 'Rowing Machine',          'Cardio', false, null),
  ('00000000-0000-0000-0000-00000000002a', 'Jump Rope',               'Cardio', false, null),
  ('00000000-0000-0000-0000-00000000002b', 'Stair Climber',           'Cardio', false, null),
  ('00000000-0000-0000-0000-00000000002c', 'Battle Ropes',            'Cardio', false, null),
  ('00000000-0000-0000-0000-00000000002d', 'Box Jump',                'Cardio', false, null),
  ('00000000-0000-0000-0000-00000000002e', 'Sled Push',               'Cardio', false, null)
ON CONFLICT (id) DO NOTHING;

-- ─── Preset Templates ─────────────────────────────────────────────────────────

INSERT INTO workout_templates (id, user_id, name, is_preset) VALUES
  ('00000000-0000-0000-ffff-000000000001', null, 'Push Day',  true),
  ('00000000-0000-0000-ffff-000000000002', null, 'Pull Day',  true),
  ('00000000-0000-0000-ffff-000000000003', null, 'Leg Day',   true),
  ('00000000-0000-0000-ffff-000000000004', null, 'Full Body', true)
ON CONFLICT (id) DO NOTHING;

-- ─── Template Exercises ───────────────────────────────────────────────────────
-- Delete + re-insert preset template exercises for idempotency.
-- Safe because users cannot modify preset templates (RLS blocks it).

DELETE FROM template_exercises
WHERE template_id IN (
  '00000000-0000-0000-ffff-000000000001',
  '00000000-0000-0000-ffff-000000000002',
  '00000000-0000-0000-ffff-000000000003',
  '00000000-0000-0000-ffff-000000000004'
);

-- Push Day: Bench Press, Overhead Press, Incline Bench, Lateral Raise, Tricep Pushdown, Chest Fly
INSERT INTO template_exercises (template_id, exercise_id, "order") VALUES
  ('00000000-0000-0000-ffff-000000000001', '00000000-0000-0000-0000-000000000001', 1),
  ('00000000-0000-0000-ffff-000000000001', '00000000-0000-0000-0000-000000000003', 2),
  ('00000000-0000-0000-ffff-000000000001', '00000000-0000-0000-0000-000000000002', 3),
  ('00000000-0000-0000-ffff-000000000001', '00000000-0000-0000-0000-000000000005', 4),
  ('00000000-0000-0000-ffff-000000000001', '00000000-0000-0000-0000-000000000006', 5),
  ('00000000-0000-0000-ffff-000000000001', '00000000-0000-0000-0000-000000000008', 6);

-- Pull Day: Deadlift, Barbell Row, Pull Up, Lat Pulldown, Bicep Curl, Face Pull
INSERT INTO template_exercises (template_id, exercise_id, "order") VALUES
  ('00000000-0000-0000-ffff-000000000002', '00000000-0000-0000-0000-00000000000b', 1),
  ('00000000-0000-0000-ffff-000000000002', '00000000-0000-0000-0000-00000000000c', 2),
  ('00000000-0000-0000-ffff-000000000002', '00000000-0000-0000-0000-00000000000d', 3),
  ('00000000-0000-0000-ffff-000000000002', '00000000-0000-0000-0000-00000000000e', 4),
  ('00000000-0000-0000-ffff-000000000002', '00000000-0000-0000-0000-000000000011', 5),
  ('00000000-0000-0000-ffff-000000000002', '00000000-0000-0000-0000-000000000010', 6);

-- Leg Day: Squat, Romanian Deadlift, Leg Press, Leg Curl, Calf Raise, Leg Extension
INSERT INTO template_exercises (template_id, exercise_id, "order") VALUES
  ('00000000-0000-0000-ffff-000000000003', '00000000-0000-0000-0000-000000000015', 1),
  ('00000000-0000-0000-ffff-000000000003', '00000000-0000-0000-0000-000000000018', 2),
  ('00000000-0000-0000-ffff-000000000003', '00000000-0000-0000-0000-000000000017', 3),
  ('00000000-0000-0000-ffff-000000000003', '00000000-0000-0000-0000-000000000019', 4),
  ('00000000-0000-0000-ffff-000000000003', '00000000-0000-0000-0000-00000000001b', 5),
  ('00000000-0000-0000-ffff-000000000003', '00000000-0000-0000-0000-00000000001a', 6);

-- Full Body: Squat, Bench Press, Barbell Row, Overhead Press, Deadlift, Pull Up
INSERT INTO template_exercises (template_id, exercise_id, "order") VALUES
  ('00000000-0000-0000-ffff-000000000004', '00000000-0000-0000-0000-000000000015', 1),
  ('00000000-0000-0000-ffff-000000000004', '00000000-0000-0000-0000-000000000001', 2),
  ('00000000-0000-0000-ffff-000000000004', '00000000-0000-0000-0000-00000000000c', 3),
  ('00000000-0000-0000-ffff-000000000004', '00000000-0000-0000-0000-000000000003', 4),
  ('00000000-0000-0000-ffff-000000000004', '00000000-0000-0000-0000-00000000000b', 5),
  ('00000000-0000-0000-ffff-000000000004', '00000000-0000-0000-0000-00000000000d', 6);
