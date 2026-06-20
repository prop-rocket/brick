// Pure helper for deriving the list of exercises to display in an active workout.
//
// The displayed list is the union, in order, of:
//   1. the workout template's exercises,
//   2. exercises the user added on-the-fly this session (extras), and
//   3. exercises referenced by already-logged sets (so on-the-fly additions
//      survive a page reload, reconstructed from the persisted sets).
//
// Each source is normalized to a plain exercise object: { id, name, muscle_group }.
// Duplicates (by exercise id) are removed, keeping first occurrence / template order.

export function mergeWorkoutExercises({
  templateExercises = [],
  extras = [],
  sets = [],
  exerciseMap = {},
}) {
  const result = []
  const seen = new Set()

  const push = (ex) => {
    if (!ex || !ex.id || seen.has(ex.id)) return
    seen.add(ex.id)
    result.push(ex)
  }

  // 1. Template exercises (template_exercises rows carry a nested `exercises`).
  for (const te of templateExercises) {
    const ex = te?.exercises ?? te
    push(ex)
  }

  // 2. Locally-added extras (plain exercise objects).
  for (const ex of extras) push(ex)

  // 3. Exercises referenced by logged sets but not yet included.
  for (const s of sets) {
    const id = s?.exercise_id
    if (!id || seen.has(id)) continue
    const ex = exerciseMap[id]
    if (ex) push(ex)
  }

  return result
}
