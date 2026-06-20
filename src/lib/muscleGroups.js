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

// Color palette per muscle group, used for chips (template cards) and section
// headers (exercise library). Each entry is { bg, text }.
export const MUSCLE_STYLES = {
  Chest:     { bg: '#C8432B', text: '#F0EBE3' },
  Shoulders: { bg: '#D4724A', text: '#F0EBE3' },
  Back:      { bg: '#6B5A52', text: '#F0EBE3' },
  Arms:      { bg: '#8C7060', text: '#F0EBE3' },
  Legs:      { bg: '#8C8078', text: '#F0EBE3' },
  Glutes:    { bg: '#B08070', text: '#F0EBE3' },
  Core:      { bg: '#D4C9B8', text: '#1C1A18' },
  Cardio:    { bg: '#4A4540', text: '#F0EBE3' },
  Custom:    { bg: '#F0EBE3', text: '#1C1A18' },
}

// Neutral fallback for unknown / missing groups.
export const FALLBACK_STYLE = { bg: '#8C8078', text: '#F0EBE3' }

