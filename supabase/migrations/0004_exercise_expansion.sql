-- 0004_exercise_expansion.sql
-- Reclassify existing 46 exercises from 5 groups (Push/Pull/Legs/Core/Cardio)
-- into 8 groups (Chest/Shoulders/Back/Arms/Legs/Glutes/Core/Cardio)
-- and add ~152 new exercises for a total of ~198.

-- ── Reclassify existing Push exercises ──────────────────────────────────────
UPDATE exercises SET muscle_group = 'Chest' WHERE id IN (
  '00000000-0000-0000-0000-000000000001', -- Bench Press
  '00000000-0000-0000-0000-000000000002', -- Incline Bench
  '00000000-0000-0000-0000-000000000008', -- Chest Fly
  '00000000-0000-0000-0000-000000000009', -- Dips
  '00000000-0000-0000-0000-00000000000a'  -- Push Up
) AND is_custom = false;

UPDATE exercises SET muscle_group = 'Shoulders' WHERE id IN (
  '00000000-0000-0000-0000-000000000003', -- Overhead Press
  '00000000-0000-0000-0000-000000000004', -- Dumbbell Shoulder Press
  '00000000-0000-0000-0000-000000000005'  -- Lateral Raise
) AND is_custom = false;

UPDATE exercises SET muscle_group = 'Arms' WHERE id IN (
  '00000000-0000-0000-0000-000000000006', -- Tricep Pushdown
  '00000000-0000-0000-0000-000000000007'  -- Skull Crushers
) AND is_custom = false;

-- ── Reclassify existing Pull exercises ──────────────────────────────────────
UPDATE exercises SET muscle_group = 'Back' WHERE id IN (
  '00000000-0000-0000-0000-00000000000b', -- Deadlift
  '00000000-0000-0000-0000-00000000000c', -- Barbell Row
  '00000000-0000-0000-0000-00000000000d', -- Pull Up
  '00000000-0000-0000-0000-00000000000e', -- Lat Pulldown
  '00000000-0000-0000-0000-00000000000f', -- Seated Cable Row
  '00000000-0000-0000-0000-000000000013', -- Single Arm Row
  '00000000-0000-0000-0000-000000000014'  -- Shrug
) AND is_custom = false;

UPDATE exercises SET muscle_group = 'Shoulders' WHERE id = '00000000-0000-0000-0000-000000000010' AND is_custom = false; -- Face Pull

UPDATE exercises SET muscle_group = 'Arms' WHERE id IN (
  '00000000-0000-0000-0000-000000000011', -- Bicep Curl
  '00000000-0000-0000-0000-000000000012'  -- Hammer Curl
) AND is_custom = false;

-- ── Reclassify existing Legs exercises (Glutes split-off) ───────────────────
UPDATE exercises SET muscle_group = 'Glutes' WHERE id IN (
  '00000000-0000-0000-0000-000000000018', -- Romanian Deadlift
  '00000000-0000-0000-0000-00000000001d', -- Lunges
  '00000000-0000-0000-0000-00000000001e'  -- Bulgarian Split Squat
) AND is_custom = false;

-- Core (001f-0026) and Cardio (0027-002e) stay unchanged.

-- ── New exercises ────────────────────────────────────────────────────────────
INSERT INTO exercises (id, name, muscle_group, is_custom, user_id) VALUES
-- CHEST (+15)
('00000000-0000-0000-0000-00000000002f', 'Decline Bench Press',           'Chest',     false, null),
('00000000-0000-0000-0000-000000000030', 'Incline Dumbbell Press',        'Chest',     false, null),
('00000000-0000-0000-0000-000000000031', 'Cable Chest Fly',               'Chest',     false, null),
('00000000-0000-0000-0000-000000000032', 'Pec Deck',                      'Chest',     false, null),
('00000000-0000-0000-0000-000000000033', 'Close Grip Bench Press',        'Chest',     false, null),
('00000000-0000-0000-0000-000000000034', 'Chest Press Machine',           'Chest',     false, null),
('00000000-0000-0000-0000-000000000035', 'Decline Dumbbell Press',        'Chest',     false, null),
('00000000-0000-0000-0000-000000000036', 'Cable Crossover',               'Chest',     false, null),
('00000000-0000-0000-0000-000000000037', 'Dumbbell Fly',                  'Chest',     false, null),
('00000000-0000-0000-0000-000000000038', 'Incline Cable Fly',             'Chest',     false, null),
('00000000-0000-0000-0000-000000000039', 'Svend Press',                   'Chest',     false, null),
('00000000-0000-0000-0000-00000000003a', 'Diamond Push Up',               'Chest',     false, null),
('00000000-0000-0000-0000-00000000003b', 'Wide Push Up',                  'Chest',     false, null),
('00000000-0000-0000-0000-00000000003c', 'Floor Press',                   'Chest',     false, null),
('00000000-0000-0000-0000-00000000003d', 'Low Cable Fly',                 'Chest',     false, null),
-- SHOULDERS (+15)
('00000000-0000-0000-0000-00000000003e', 'Arnold Press',                  'Shoulders', false, null),
('00000000-0000-0000-0000-00000000003f', 'Cable Lateral Raise',           'Shoulders', false, null),
('00000000-0000-0000-0000-000000000040', 'Front Raise',                   'Shoulders', false, null),
('00000000-0000-0000-0000-000000000041', 'Upright Row',                   'Shoulders', false, null),
('00000000-0000-0000-0000-000000000042', 'Rear Delt Fly',                 'Shoulders', false, null),
('00000000-0000-0000-0000-000000000043', 'Machine Shoulder Press',        'Shoulders', false, null),
('00000000-0000-0000-0000-000000000044', 'Bent Over Lateral Raise',       'Shoulders', false, null),
('00000000-0000-0000-0000-000000000045', 'Cable Front Raise',             'Shoulders', false, null),
('00000000-0000-0000-0000-000000000046', 'Seated Lateral Raise',          'Shoulders', false, null),
('00000000-0000-0000-0000-000000000047', 'Dumbbell Face Pull',            'Shoulders', false, null),
('00000000-0000-0000-0000-000000000048', 'Bradford Press',                'Shoulders', false, null),
('00000000-0000-0000-0000-000000000049', 'Band Pull Apart',               'Shoulders', false, null),
('00000000-0000-0000-0000-00000000004a', 'Plate Front Raise',             'Shoulders', false, null),
('00000000-0000-0000-0000-00000000004b', 'Pike Push Up',                  'Shoulders', false, null),
('00000000-0000-0000-0000-00000000004c', 'Landmine Press',                'Shoulders', false, null),
-- BACK (+18)
('00000000-0000-0000-0000-00000000004d', 'T-Bar Row',                     'Back',      false, null),
('00000000-0000-0000-0000-00000000004e', 'Chest Supported Row',           'Back',      false, null),
('00000000-0000-0000-0000-00000000004f', 'Rack Pull',                     'Back',      false, null),
('00000000-0000-0000-0000-000000000050', 'Good Morning',                  'Back',      false, null),
('00000000-0000-0000-0000-000000000051', 'Inverted Row',                  'Back',      false, null),
('00000000-0000-0000-0000-000000000052', 'Pendlay Row',                   'Back',      false, null),
('00000000-0000-0000-0000-000000000053', 'Dumbbell Row',                  'Back',      false, null),
('00000000-0000-0000-0000-000000000054', 'Cable Row',                     'Back',      false, null),
('00000000-0000-0000-0000-000000000055', 'Straight Arm Pulldown',         'Back',      false, null),
('00000000-0000-0000-0000-000000000056', 'Meadows Row',                   'Back',      false, null),
('00000000-0000-0000-0000-000000000057', 'Seal Row',                      'Back',      false, null),
('00000000-0000-0000-0000-000000000058', 'Lat Pulldown Underhand',        'Back',      false, null),
('00000000-0000-0000-0000-000000000059', 'Neutral Grip Pull Up',          'Back',      false, null),
('00000000-0000-0000-0000-00000000005a', 'Wide Grip Pull Up',             'Back',      false, null),
('00000000-0000-0000-0000-00000000005b', 'Assisted Pull Up',              'Back',      false, null),
('00000000-0000-0000-0000-00000000005c', 'Cable Pullover',                'Back',      false, null),
('00000000-0000-0000-0000-00000000005d', 'Stiff Leg Deadlift',            'Back',      false, null),
('00000000-0000-0000-0000-00000000005e', 'Chin Up',                       'Back',      false, null),
-- ARMS (+16)
('00000000-0000-0000-0000-00000000005f', 'EZ Bar Curl',                   'Arms',      false, null),
('00000000-0000-0000-0000-000000000060', 'Preacher Curl',                 'Arms',      false, null),
('00000000-0000-0000-0000-000000000061', 'Cable Curl',                    'Arms',      false, null),
('00000000-0000-0000-0000-000000000062', 'Concentration Curl',            'Arms',      false, null),
('00000000-0000-0000-0000-000000000063', 'Incline Dumbbell Curl',         'Arms',      false, null),
('00000000-0000-0000-0000-000000000064', 'Zottman Curl',                  'Arms',      false, null),
('00000000-0000-0000-0000-000000000065', 'Spider Curl',                   'Arms',      false, null),
('00000000-0000-0000-0000-000000000066', 'Cable Overhead Tricep Extension','Arms',     false, null),
('00000000-0000-0000-0000-000000000067', 'Rope Tricep Pushdown',          'Arms',      false, null),
('00000000-0000-0000-0000-000000000068', 'Overhead Dumbbell Extension',   'Arms',      false, null),
('00000000-0000-0000-0000-000000000069', 'Close Grip Push Up',            'Arms',      false, null),
('00000000-0000-0000-0000-00000000006a', 'Reverse Curl',                  'Arms',      false, null),
('00000000-0000-0000-0000-00000000006b', 'Wrist Curl',                    'Arms',      false, null),
('00000000-0000-0000-0000-00000000006c', 'Seated Dumbbell Curl',          'Arms',      false, null),
('00000000-0000-0000-0000-00000000006d', 'Bayesian Curl',                 'Arms',      false, null),
('00000000-0000-0000-0000-00000000006e', 'Tricep Kickback',               'Arms',      false, null),
-- LEGS (+18)
('00000000-0000-0000-0000-00000000006f', 'Sumo Squat',                    'Legs',      false, null),
('00000000-0000-0000-0000-000000000070', 'Pause Squat',                   'Legs',      false, null),
('00000000-0000-0000-0000-000000000071', 'Box Squat',                     'Legs',      false, null),
('00000000-0000-0000-0000-000000000072', 'Goblet Squat',                  'Legs',      false, null),
('00000000-0000-0000-0000-000000000073', 'Trap Bar Deadlift',             'Legs',      false, null),
('00000000-0000-0000-0000-000000000074', 'Step Up',                       'Legs',      false, null),
('00000000-0000-0000-0000-000000000075', 'Single Leg Press',              'Legs',      false, null),
('00000000-0000-0000-0000-000000000076', 'Walking Lunge',                 'Legs',      false, null),
('00000000-0000-0000-0000-000000000077', 'Sissy Squat',                   'Legs',      false, null),
('00000000-0000-0000-0000-000000000078', 'Nordic Curl',                   'Legs',      false, null),
('00000000-0000-0000-0000-000000000079', 'Lying Leg Curl',                'Legs',      false, null),
('00000000-0000-0000-0000-00000000007a', 'Seated Leg Curl',               'Legs',      false, null),
('00000000-0000-0000-0000-00000000007b', 'Donkey Calf Raise',             'Legs',      false, null),
('00000000-0000-0000-0000-00000000007c', 'Standing Calf Raise',           'Legs',      false, null),
('00000000-0000-0000-0000-00000000007d', 'Sumo Deadlift',                 'Legs',      false, null),
('00000000-0000-0000-0000-00000000007e', 'Wall Sit',                      'Legs',      false, null),
('00000000-0000-0000-0000-00000000007f', 'Leg Press Calf Raise',          'Legs',      false, null),
('00000000-0000-0000-0000-000000000080', 'Safety Bar Squat',              'Legs',      false, null),
-- GLUTES (+12)
('00000000-0000-0000-0000-000000000081', 'Hip Thrust',                    'Glutes',    false, null),
('00000000-0000-0000-0000-000000000082', 'Glute Bridge',                  'Glutes',    false, null),
('00000000-0000-0000-0000-000000000083', 'Cable Kickback',                'Glutes',    false, null),
('00000000-0000-0000-0000-000000000084', 'Donkey Kick',                   'Glutes',    false, null),
('00000000-0000-0000-0000-000000000085', 'Fire Hydrant',                  'Glutes',    false, null),
('00000000-0000-0000-0000-000000000086', 'Hip Abduction',                 'Glutes',    false, null),
('00000000-0000-0000-0000-000000000087', 'Glute Ham Raise',               'Glutes',    false, null),
('00000000-0000-0000-0000-000000000088', 'Single Leg Romanian Deadlift',  'Glutes',    false, null),
('00000000-0000-0000-0000-000000000089', 'Banded Clamshell',              'Glutes',    false, null),
('00000000-0000-0000-0000-00000000008a', 'Curtsy Lunge',                  'Glutes',    false, null),
('00000000-0000-0000-0000-00000000008b', 'Frog Pump',                     'Glutes',    false, null),
('00000000-0000-0000-0000-00000000008c', 'Reverse Hyperextension',        'Glutes',    false, null),
-- CORE (+12)
('00000000-0000-0000-0000-00000000008d', 'Dead Bug',                      'Core',      false, null),
('00000000-0000-0000-0000-00000000008e', 'Hollow Body Hold',              'Core',      false, null),
('00000000-0000-0000-0000-00000000008f', 'Dragon Flag',                   'Core',      false, null),
('00000000-0000-0000-0000-000000000090', 'L-Sit',                         'Core',      false, null),
('00000000-0000-0000-0000-000000000091', 'Pallof Press',                  'Core',      false, null),
('00000000-0000-0000-0000-000000000092', 'Cable Woodchop',                'Core',      false, null),
('00000000-0000-0000-0000-000000000093', 'Bird Dog',                      'Core',      false, null),
('00000000-0000-0000-0000-000000000094', 'Flutter Kicks',                 'Core',      false, null),
('00000000-0000-0000-0000-000000000095', 'Bicycle Crunch',                'Core',      false, null),
('00000000-0000-0000-0000-000000000096', 'Side Plank',                    'Core',      false, null),
('00000000-0000-0000-0000-000000000097', 'V-Up',                          'Core',      false, null),
('00000000-0000-0000-0000-000000000098', 'Windmill',                      'Core',      false, null),
-- CARDIO (+12)
('00000000-0000-0000-0000-000000000099', 'Elliptical',                    'Cardio',    false, null),
('00000000-0000-0000-0000-00000000009a', 'Assault Bike',                  'Cardio',    false, null),
('00000000-0000-0000-0000-00000000009b', 'Swimming',                      'Cardio',    false, null),
('00000000-0000-0000-0000-00000000009c', 'Sprint Intervals',              'Cardio',    false, null),
('00000000-0000-0000-0000-00000000009d', 'Burpees',                       'Cardio',    false, null),
('00000000-0000-0000-0000-00000000009e', 'Mountain Climbers',             'Cardio',    false, null),
('00000000-0000-0000-0000-00000000009f', 'Jumping Jacks',                 'Cardio',    false, null),
('00000000-0000-0000-0000-0000000000a0', 'Kettlebell Swing',              'Cardio',    false, null),
('00000000-0000-0000-0000-0000000000a1', 'Farmer''s Walk',                'Cardio',    false, null),
('00000000-0000-0000-0000-0000000000a2', 'Ski Erg',                       'Cardio',    false, null),
('00000000-0000-0000-0000-0000000000a3', 'Running',                       'Cardio',    false, null),
('00000000-0000-0000-0000-0000000000a4', 'High Knees',                    'Cardio',    false, null),
-- CHEST additional (+5)
('00000000-0000-0000-0000-0000000000a5', 'Incline Push Up',               'Chest',     false, null),
('00000000-0000-0000-0000-0000000000a6', 'Decline Push Up',               'Chest',     false, null),
('00000000-0000-0000-0000-0000000000a7', 'Dumbbell Pullover',             'Chest',     false, null),
('00000000-0000-0000-0000-0000000000a8', 'Machine Fly',                   'Chest',     false, null),
('00000000-0000-0000-0000-0000000000a9', 'Reverse Grip Bench',            'Chest',     false, null),
-- SHOULDERS additional (+5)
('00000000-0000-0000-0000-0000000000aa', 'Behind Neck Press',             'Shoulders', false, null),
('00000000-0000-0000-0000-0000000000ab', 'Prone Delt Fly',                'Shoulders', false, null),
('00000000-0000-0000-0000-0000000000ac', 'Half Kneeling Press',           'Shoulders', false, null),
('00000000-0000-0000-0000-0000000000ad', 'Cable Y Raise',                 'Shoulders', false, null),
('00000000-0000-0000-0000-0000000000ae', 'Seated Arnold Press',           'Shoulders', false, null),
-- BACK additional (+5)
('00000000-0000-0000-0000-0000000000af', 'Jefferson Curl',                'Back',      false, null),
('00000000-0000-0000-0000-0000000000b0', 'Dumbbell Deadlift',             'Back',      false, null),
('00000000-0000-0000-0000-0000000000b1', 'Hex Bar Deadlift',              'Back',      false, null),
('00000000-0000-0000-0000-0000000000b2', 'Single Arm Cable Row',          'Back',      false, null),
('00000000-0000-0000-0000-0000000000b3', 'Kroc Row',                      'Back',      false, null),
-- ARMS additional (+5)
('00000000-0000-0000-0000-0000000000b4', 'Lying Tricep Extension',        'Arms',      false, null),
('00000000-0000-0000-0000-0000000000b5', 'JM Press',                      'Arms',      false, null),
('00000000-0000-0000-0000-0000000000b6', 'Cable Crossbody Curl',          'Arms',      false, null),
('00000000-0000-0000-0000-0000000000b7', 'Tate Press',                    'Arms',      false, null),
('00000000-0000-0000-0000-0000000000b8', 'Banded Tricep Extension',       'Arms',      false, null),
-- LEGS additional (+5)
('00000000-0000-0000-0000-0000000000b9', 'Zercher Squat',                 'Legs',      false, null),
('00000000-0000-0000-0000-0000000000ba', 'Leg Abduction Machine',         'Legs',      false, null),
('00000000-0000-0000-0000-0000000000bb', 'Leg Adduction Machine',         'Legs',      false, null),
('00000000-0000-0000-0000-0000000000bc', 'Reverse Lunge',                 'Legs',      false, null),
('00000000-0000-0000-0000-0000000000bd', 'Tibialis Raise',                'Legs',      false, null),
-- GLUTES additional (+3)
('00000000-0000-0000-0000-0000000000be', 'Monster Walk',                  'Glutes',    false, null),
('00000000-0000-0000-0000-0000000000bf', 'Banded Hip Thrust',             'Glutes',    false, null),
('00000000-0000-0000-0000-0000000000c0', 'Cable Glute Kickback',          'Glutes',    false, null),
-- CORE additional (+3)
('00000000-0000-0000-0000-0000000000c1', 'Toe Touch',                     'Core',      false, null),
('00000000-0000-0000-0000-0000000000c2', 'Knee to Elbow',                 'Core',      false, null),
('00000000-0000-0000-0000-0000000000c3', 'Farmer''s Carry',               'Core',      false, null),
-- CARDIO additional (+3)
('00000000-0000-0000-0000-0000000000c4', 'Stationary Bike',               'Cardio',    false, null),
('00000000-0000-0000-0000-0000000000c5', 'Outdoor Rowing',                'Cardio',    false, null),
('00000000-0000-0000-0000-0000000000c6', 'Jump Squat',                    'Cardio',    false, null)
ON CONFLICT (id) DO NOTHING;
