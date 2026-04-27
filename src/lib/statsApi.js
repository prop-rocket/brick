import { useQuery } from '@tanstack/react-query'
import { supabase } from './supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { toDateStr, weekKey, lastNWeeks, lastNDays } from './streakUtils.js'

// ─── Query keys ──────────────────────────────────────────────────────────────
export const ALL_SETS_KEY = ['all_user_sets']
export const FINISHED_WORKOUTS_KEY = ['finished_workouts']

// All sets the current user has logged. Used to derive volume, PRs, frequency.
export function useAllUserSets() {
  const { user } = useAuth()
  return useQuery({
    queryKey: ALL_SETS_KEY,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_sets')
        .select('id, exercise_id, set_number, reps, weight_kg, logged_at, workout_id')
        .order('logged_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}

// All finished workouts (ended_at not null) — used for frequency heatmap.
export function useFinishedWorkouts() {
  const { user } = useAuth()
  return useQuery({
    queryKey: FINISHED_WORKOUTS_KEY,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workouts')
        .select('id, started_at, ended_at, template_id, workout_templates(id, name)')
        .not('ended_at', 'is', null)
        .order('started_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}

// Direct DB check (bypasses cache) — has any prior set been logged at higher
// weight than `weightKg` for this exercise? Returns { isPR, previousMax }.
export async function checkIsPR({ exerciseId, weightKg }) {
  const { data, error } = await supabase
    .from('workout_sets')
    .select('weight_kg')
    .eq('exercise_id', exerciseId)
    .order('weight_kg', { ascending: false })
    .limit(1)
  if (error) return { isPR: false, previousMax: 0 }
  const previousMax = data?.[0]?.weight_kg ?? 0
  // Only flag a PR if there's something to beat AND new weight is greater.
  const isPR = previousMax > 0 && weightKg > previousMax
  return { isPR, previousMax }
}

// Returns weekly volume for the last `weeks` weeks, including empty weeks.
// Each entry: { key, label, volume, mondayDate }.
export function useVolumeByWeek(weeks = 12) {
  const { data: sets = [], ...rest } = useAllUserSets()

  const weekMondays = lastNWeeks(weeks)
  const volumeMap = new Map()

  for (const m of weekMondays) {
    volumeMap.set(weekKey(m), { volume: 0 })
  }

  for (const s of sets) {
    const k = weekKey(new Date(s.logged_at))
    if (!volumeMap.has(k)) continue // older than window
    const v = (s.reps ?? 0) * (s.weight_kg ?? 0)
    volumeMap.get(k).volume += v
  }

  const series = weekMondays.map((m) => {
    const k = weekKey(m)
    return {
      key: k,
      label: m.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      volume: Math.round(volumeMap.get(k)?.volume ?? 0),
      mondayDate: m,
    }
  })

  const totalVolume = sets.reduce(
    (sum, s) => sum + (s.reps ?? 0) * (s.weight_kg ?? 0),
    0,
  )

  const nonEmptyWeeks = series.filter((w) => w.volume > 0)
  const bestWeek = series.reduce(
    (best, w) => (w.volume > (best?.volume ?? 0) ? w : best),
    null,
  )
  const avgWeekly =
    nonEmptyWeeks.length > 0
      ? nonEmptyWeeks.reduce((a, b) => a + b.volume, 0) / nonEmptyWeeks.length
      : 0

  return {
    series,
    bestWeek,
    avgWeekly: Math.round(avgWeekly),
    totalVolume: Math.round(totalVolume),
    ...rest,
  }
}

// Returns daily-max-weight history for one exercise, with PR markers.
// Each entry: { date, label, weightKg, isPR }.
export function useExerciseProgress(exerciseId) {
  const { data: sets = [], ...rest } = useAllUserSets()

  if (!exerciseId) {
    return { series: [], currentPR: null, firstWeight: null, ...rest }
  }

  const filtered = sets.filter((s) => s.exercise_id === exerciseId)

  // Group by date → max weight that day
  const byDate = new Map()
  for (const s of filtered) {
    const d = toDateStr(new Date(s.logged_at))
    const w = s.weight_kg ?? 0
    if (!byDate.has(d) || byDate.get(d) < w) byDate.set(d, w)
  }

  const sortedDates = Array.from(byDate.keys()).sort()
  const series = []
  let runningMax = 0
  for (const d of sortedDates) {
    const w = byDate.get(d)
    const isPR = w > runningMax
    if (isPR) runningMax = w
    series.push({
      date: d,
      label: new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      weightKg: w,
      isPR,
    })
  }

  const currentPR = series.length > 0 ? Math.max(...series.map((p) => p.weightKg)) : null
  const firstWeight = series.length > 0 ? series[0].weightKg : null
  const improvement =
    currentPR != null && firstWeight != null ? currentPR - firstWeight : 0
  const improvementPct =
    firstWeight && firstWeight > 0 ? (improvement / firstWeight) * 100 : 0

  return {
    series,
    currentPR,
    firstWeight,
    improvement: Math.round(improvement * 10) / 10,
    improvementPct: Math.round(improvementPct),
    ...rest,
  }
}

// Workout frequency cells for a heatmap covering `days` days.
// Returns array of { date: 'YYYY-MM-DD', count, workouts: [...] }.
export function useFrequencyCells(days = 91) {
  const { data: workouts = [], ...rest } = useFinishedWorkouts()

  const dates = lastNDays(days)
  const map = new Map()
  for (const d of dates) map.set(toDateStr(d), { count: 0, workouts: [] })

  for (const w of workouts) {
    const k = toDateStr(new Date(w.started_at))
    if (!map.has(k)) continue
    const cell = map.get(k)
    cell.count += 1
    cell.workouts.push(w)
  }

  return {
    cells: dates.map((d) => {
      const k = toDateStr(d)
      return { date: k, ...map.get(k), dateObj: d }
    }),
    ...rest,
  }
}

// Personal records: max weight per exercise + when achieved.
export function usePersonalRecords(exercises) {
  const { data: sets = [], ...rest } = useAllUserSets()

  const map = new Map()
  for (const s of sets) {
    const w = s.weight_kg ?? 0
    if (w <= 0) continue
    const ex = s.exercise_id
    const existing = map.get(ex)
    if (!existing || w > existing.weightKg) {
      map.set(ex, { exerciseId: ex, weightKg: w, achievedAt: s.logged_at })
    }
  }

  const exMap = new Map((exercises ?? []).map((e) => [e.id, e]))
  const records = Array.from(map.values())
    .map((r) => ({
      ...r,
      exercise: exMap.get(r.exerciseId) ?? null,
    }))
    .filter((r) => r.exercise != null)
    .sort((a, b) => new Date(b.achievedAt) - new Date(a.achievedAt))

  return { records, ...rest }
}

// Previous workout for the same template, before `currentWorkoutId`.
// Returns { workout, sets } or null.
export function usePreviousTemplateRun(currentWorkoutId, templateId, startedAt) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['previous_template_run', currentWorkoutId, templateId],
    enabled: !!user && !!currentWorkoutId && !!templateId && !!startedAt,
    queryFn: async () => {
      const { data: prev, error } = await supabase
        .from('workouts')
        .select('id, started_at, ended_at, template_id')
        .eq('template_id', templateId)
        .lt('started_at', startedAt)
        .not('ended_at', 'is', null)
        .neq('id', currentWorkoutId)
        .order('started_at', { ascending: false })
        .limit(1)
      if (error) throw error
      const previous = prev?.[0]
      if (!previous) return null

      const { data: sets, error: sErr } = await supabase
        .from('workout_sets')
        .select('exercise_id, reps, weight_kg')
        .eq('workout_id', previous.id)
      if (sErr) throw sErr

      // Aggregate volume per exercise
      const volumeByExercise = {}
      let totalVolume = 0
      for (const s of sets ?? []) {
        const v = (s.reps ?? 0) * (s.weight_kg ?? 0)
        volumeByExercise[s.exercise_id] = (volumeByExercise[s.exercise_id] ?? 0) + v
        totalVolume += v
      }

      return { workout: previous, volumeByExercise, totalVolume }
    },
  })
}
