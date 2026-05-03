import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase.js'
import { useAuth } from '../context/AuthContext.jsx'

// ─── Query keys ──────────────────────────────────────────────────────────────
export const EXERCISES_KEY = ['exercises']
export const TEMPLATES_KEY = ['templates']
export const WORKOUT_HISTORY_KEY = ['workout_history']
export const workoutKey = (id) => ['workout', id]
export const workoutSetsKey = (id) => ['workout_sets', id]
export const templateExercisesKey = (id) => ['template_exercises', id]

// ─── Exercises ────────────────────────────────────────────────────────────────

export function useExercises() {
  const { user } = useAuth()
  return useQuery({
    queryKey: EXERCISES_KEY,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('id, name, muscle_group, is_custom, user_id')
        .order('name', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useCreateCustomExercise() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({ name, muscle_group = 'Custom' }) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('exercises')
        .insert({ name: name.trim(), muscle_group, is_custom: true, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: EXERCISES_KEY }),
  })
}

// ─── Templates ────────────────────────────────────────────────────────────────

export function useWorkoutTemplates() {
  const { user } = useAuth()
  return useQuery({
    queryKey: TEMPLATES_KEY,
    enabled: !!user,
    queryFn: async () => {
      const { data: templates, error } = await supabase
        .from('workout_templates')
        .select('id, name, is_preset, user_id')
        .order('is_preset', { ascending: false })

      if (error) throw error
      if (!templates?.length) return []

      const { data: templateExercises, error: teErr } = await supabase
        .from('template_exercises')
        .select('id, template_id, order, exercises(id, name, muscle_group)')
        .in('template_id', templates.map((t) => t.id))
        .order('order', { ascending: true })

      if (teErr) throw teErr

      const exByTemplate = {}
      for (const te of templateExercises ?? []) {
        if (!exByTemplate[te.template_id]) exByTemplate[te.template_id] = []
        exByTemplate[te.template_id].push(te)
      }

      return templates.map((t) => ({
        ...t,
        exercises: exByTemplate[t.id] ?? [],
      }))
    },
  })
}

export function useCreateTemplate() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({ name, exercises }) => {
      if (!user) throw new Error('Not authenticated')

      const { data: template, error: tErr } = await supabase
        .from('workout_templates')
        .insert({ user_id: user.id, name: name.trim(), is_preset: false })
        .select()
        .single()
      if (tErr) throw tErr

      if (exercises.length > 0) {
        const { error: teErr } = await supabase
          .from('template_exercises')
          .insert(
            exercises.map((ex, i) => ({
              template_id: template.id,
              exercise_id: ex.id,
              order: i + 1,
            })),
          )
        if (teErr) throw teErr
      }

      return template
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TEMPLATES_KEY }),
  })
}

export function useDeleteTemplate() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('workout_templates')
        .delete()
        .eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: TEMPLATES_KEY }),
  })
}

// ─── Workouts ─────────────────────────────────────────────────────────────────

export function useStartWorkout() {
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (templateId) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('workouts')
        .insert({ user_id: user.id, template_id: templateId, started_at: new Date().toISOString() })
        .select()
        .single()
      if (error) throw error
      return data
    },
  })
}

export function useWorkout(workoutId) {
  const { user } = useAuth()
  return useQuery({
    queryKey: workoutKey(workoutId),
    enabled: !!user && !!workoutId,
    queryFn: async () => {
      const { data: workout, error } = await supabase
        .from('workouts')
        .select('id, started_at, ended_at, notes, template_id')
        .eq('id', workoutId)
        .single()
      if (error) throw error
      if (workout.template_id) {
        const { data: tmpl } = await supabase
          .from('workout_templates')
          .select('id, name')
          .eq('id', workout.template_id)
          .single()
        workout.workout_templates = tmpl ?? null
      }
      return workout
    },
  })
}

export function useTemplateExercises(templateId) {
  const { user } = useAuth()
  return useQuery({
    queryKey: templateExercisesKey(templateId),
    enabled: !!user && !!templateId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('template_exercises')
        .select('id, order, exercise_id, exercises(id, name, muscle_group)')
        .eq('template_id', templateId)
        .order('order', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useFinishWorkout() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (workoutId) => {
      const { data, error } = await supabase
        .from('workouts')
        .update({ ended_at: new Date().toISOString() })
        .eq('id', workoutId)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: workoutKey(data.id) })
      qc.invalidateQueries({ queryKey: WORKOUT_HISTORY_KEY })
      qc.invalidateQueries({ queryKey: ['finished_workouts'] })
    },
  })
}

// ─── Sets ─────────────────────────────────────────────────────────────────────

export function useWorkoutSets(workoutId) {
  const { user } = useAuth()
  return useQuery({
    queryKey: workoutSetsKey(workoutId),
    enabled: !!user && !!workoutId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('workout_sets')
        .select('id, exercise_id, set_number, reps, weight_kg, logged_at')
        .eq('workout_id', workoutId)
        .order('logged_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
    refetchInterval: false,
  })
}

export function useLogSet() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({ workoutId, exerciseId, setNumber, reps, weightKg }) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('workout_sets')
        .insert({
          workout_id: workoutId,
          exercise_id: exerciseId,
          set_number: setNumber,
          reps,
          weight_kg: weightKg,
          logged_at: new Date().toISOString(),
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onMutate: async ({ workoutId, exerciseId, setNumber, reps, weightKg }) => {
      await qc.cancelQueries({ queryKey: workoutSetsKey(workoutId) })
      const previous = qc.getQueryData(workoutSetsKey(workoutId)) ?? []
      const optimistic = {
        id: `opt-${Date.now()}`,
        exercise_id: exerciseId,
        set_number: setNumber,
        reps,
        weight_kg: weightKg,
        logged_at: new Date().toISOString(),
        _optimistic: true,
      }
      qc.setQueryData(workoutSetsKey(workoutId), [...previous, optimistic])
      return { previous, workoutId }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous)
        qc.setQueryData(workoutSetsKey(ctx.workoutId), ctx.previous)
    },
    onSettled: (_data, _err, vars) => {
      qc.invalidateQueries({ queryKey: workoutSetsKey(vars.workoutId) })
      qc.invalidateQueries({ queryKey: ['all_user_sets'] })
    },
  })
}

export function useDeleteSet() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ setId, workoutId }) => {
      const { error } = await supabase
        .from('workout_sets')
        .delete()
        .eq('id', setId)
      if (error) throw error
      return { setId, workoutId }
    },
    onSuccess: ({ workoutId }) => {
      qc.invalidateQueries({ queryKey: workoutSetsKey(workoutId) })
      qc.invalidateQueries({ queryKey: ['all_user_sets'] })
    },
  })
}

// ─── History ──────────────────────────────────────────────────────────────────

export function useWorkoutHistory() {
  const { user } = useAuth()
  return useQuery({
    queryKey: WORKOUT_HISTORY_KEY,
    enabled: !!user,
    queryFn: async () => {
      const { data: workouts, error: wErr } = await supabase
        .from('workouts')
        .select('id, started_at, ended_at, template_id')
        .not('ended_at', 'is', null)
        .order('started_at', { ascending: false })
        .limit(30)

      if (wErr) throw wErr
      if (!workouts?.length) return []

      const templateIds = [...new Set(workouts.map((w) => w.template_id).filter(Boolean))]
      const { data: templates } = templateIds.length
        ? await supabase.from('workout_templates').select('id, name').in('id', templateIds)
        : { data: [] }
      const templateMap = {}
      for (const t of templates ?? []) templateMap[t.id] = t

      const ids = workouts.map((w) => w.id)
      const { data: sets, error: sErr } = await supabase
        .from('workout_sets')
        .select('workout_id, exercise_id, reps, weight_kg')
        .in('workout_id', ids)

      if (sErr) throw sErr

      const setsByWorkout = {}
      for (const s of sets ?? []) {
        if (!setsByWorkout[s.workout_id]) setsByWorkout[s.workout_id] = []
        setsByWorkout[s.workout_id].push(s)
      }

      return workouts.map((w) => {
        const ws = setsByWorkout[w.id] ?? []
        return {
          ...w,
          workout_templates: templateMap[w.template_id] ?? null,
          totalSets: ws.length,
          totalVolume: ws.reduce((sum, s) => sum + (s.reps ?? 0) * (s.weight_kg ?? 0), 0),
          exerciseCount: new Set(ws.map((s) => s.exercise_id)).size,
        }
      })
    },
  })
}

// Fetch one completed workout with all set details — used for summary view.
export function useWorkoutSummary(workoutId) {
  const { user } = useAuth()
  return useQuery({
    queryKey: ['workout_summary', workoutId],
    enabled: !!user && !!workoutId,
    queryFn: async () => {
      const { data: workout, error: wErr } = await supabase
        .from('workouts')
        .select('id, started_at, ended_at, notes, template_id')
        .eq('id', workoutId)
        .single()
      if (wErr) throw wErr

      if (workout.template_id) {
        const { data: tmpl } = await supabase
          .from('workout_templates')
          .select('id, name')
          .eq('id', workout.template_id)
          .single()
        workout.workout_templates = tmpl ?? null
      }

      const [{ data: templateEx, error: teErr }, { data: sets, error: sErr }] =
        await Promise.all([
          supabase
            .from('template_exercises')
            .select('order, exercise_id, exercises(id, name, muscle_group)')
            .eq('template_id', workout.template_id)
            .order('order', { ascending: true }),
          supabase
            .from('workout_sets')
            .select('id, exercise_id, set_number, reps, weight_kg')
            .eq('workout_id', workoutId)
            .order('set_number', { ascending: true }),
        ])

      if (teErr) throw teErr
      if (sErr) throw sErr

      const setsByExercise = {}
      for (const s of sets ?? []) {
        if (!setsByExercise[s.exercise_id]) setsByExercise[s.exercise_id] = []
        setsByExercise[s.exercise_id].push(s)
      }

      const totalVolume = (sets ?? []).reduce(
        (sum, s) => sum + (s.reps ?? 0) * (s.weight_kg ?? 0),
        0,
      )
      const durationMs =
        workout.ended_at && workout.started_at
          ? new Date(workout.ended_at) - new Date(workout.started_at)
          : 0

      return {
        workout,
        exercises: (templateEx ?? []).map((te) => ({
          ...te.exercises,
          sets: setsByExercise[te.exercise_id] ?? [],
        })),
        totalSets: (sets ?? []).length,
        totalVolume,
        durationMs,
      }
    },
  })
}
