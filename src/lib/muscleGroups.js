// Canonical muscle-group taxonomy shared across the exercise library, picker,
// template builder, and custom-exercise form.

// The 8 real groups a user can assign when creating/editing a custom exercise.
export const MUSCLE_GROUPS = [
  'Chest',
  'Shoulders',
  'Back',
  'Arms',
  'Legs',
  'Glutes',
  'Core',
  'Cardio',
]

// Group buckets for rendering/filtering lists. 'Custom' catches legacy custom
// exercises that were created before the group selector existed.
export const GROUPS = [...MUSCLE_GROUPS, 'Custom']

// Filter options for dropdowns (includes an "All" passthrough).
export const GROUP_FILTERS = ['All', ...GROUPS]
