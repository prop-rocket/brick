import { describe, it, expect } from 'vitest'
import { mergeWorkoutExercises } from '../lib/workoutExercises.js'

const ex = (id, name, group = 'Chest') => ({ id, name, muscle_group: group })

describe('mergeWorkoutExercises', () => {
  it('returns template exercises in order', () => {
    const templateExercises = [
      { exercises: ex('a', 'Bench') },
      { exercises: ex('b', 'Fly') },
    ]
    const result = mergeWorkoutExercises({ templateExercises })
    expect(result.map((e) => e.id)).toEqual(['a', 'b'])
  })

  it('appends extras after template exercises', () => {
    const templateExercises = [{ exercises: ex('a', 'Bench') }]
    const extras = [ex('z', 'Curl', 'Arms')]
    const result = mergeWorkoutExercises({ templateExercises, extras })
    expect(result.map((e) => e.id)).toEqual(['a', 'z'])
  })

  it('reconstructs set-referenced exercises not in template or extras', () => {
    const sets = [{ exercise_id: 'q' }]
    const exerciseMap = { q: ex('q', 'Plank', 'Core') }
    const result = mergeWorkoutExercises({ sets, exerciseMap })
    expect(result.map((e) => e.id)).toEqual(['q'])
    expect(result[0].name).toBe('Plank')
  })

  it('de-duplicates by id across all sources', () => {
    const templateExercises = [{ exercises: ex('a', 'Bench') }]
    const extras = [ex('a', 'Bench'), ex('b', 'Row', 'Back')]
    const sets = [{ exercise_id: 'a' }, { exercise_id: 'b' }]
    const exerciseMap = { a: ex('a', 'Bench'), b: ex('b', 'Row', 'Back') }
    const result = mergeWorkoutExercises({ templateExercises, extras, sets, exerciseMap })
    expect(result.map((e) => e.id)).toEqual(['a', 'b'])
  })

  it('ignores set ids missing from the exercise map', () => {
    const sets = [{ exercise_id: 'missing' }]
    const result = mergeWorkoutExercises({ sets, exerciseMap: {} })
    expect(result).toEqual([])
  })

  it('handles empty input', () => {
    expect(mergeWorkoutExercises({})).toEqual([])
  })

  it('accepts plain exercise objects in templateExercises (no nested .exercises)', () => {
    const templateExercises = [ex('a', 'Bench')]
    const result = mergeWorkoutExercises({ templateExercises })
    expect(result.map((e) => e.id)).toEqual(['a'])
  })

  it('preserves template order then extras then set-only exercises', () => {
    const templateExercises = [{ exercises: ex('a', 'Bench') }]
    const extras = [ex('b', 'Row', 'Back')]
    const sets = [{ exercise_id: 'c' }]
    const exerciseMap = { c: ex('c', 'Plank', 'Core') }
    const result = mergeWorkoutExercises({ templateExercises, extras, sets, exerciseMap })
    expect(result.map((e) => e.id)).toEqual(['a', 'b', 'c'])
  })
})
