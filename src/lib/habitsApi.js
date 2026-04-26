import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { todayStr } from './streakUtils.js'

export const HABITS_KEY = ['habits']
export const HABIT_LOGS_KEY = ['habit_logs']

export function useHabits() {
  const { user } = useAuth()
  return useQuery({
    queryKey: HABITS_KEY,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habits')
        .select('id, name, category, color, frequency_type, weekly_goal, created_at')
        .order('created_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useHabitLogs() {
  const { user } = useAuth()
  return useQuery({
    queryKey: HABIT_LOGS_KEY,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habit_logs')
        .select('id, habit_id, completed_at')
      if (error) throw error
      return data ?? []
    },
  })
}

export function useCreateHabit() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (habit) => {
      if (!user) throw new Error('Not authenticated')
      const payload = {
        user_id: user.id,
        name: habit.name.trim(),
        category: habit.category?.trim() || null,
        color: habit.color || null,
        frequency_type: habit.frequency_type,
        weekly_goal: habit.frequency_type === 'weekly' ? habit.weekly_goal : null,
      }
      const { data, error } = await supabase
        .from('habits')
        .insert(payload)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: HABITS_KEY }),
  })
}

export function useUpdateHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...patch }) => {
      const payload = {
        name: patch.name?.trim(),
        category: patch.category?.trim() || null,
        color: patch.color || null,
        frequency_type: patch.frequency_type,
        weekly_goal: patch.frequency_type === 'weekly' ? patch.weekly_goal : null,
      }
      const { data, error } = await supabase
        .from('habits')
        .update(payload)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: HABITS_KEY }),
  })
}

export function useDeleteHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('habits').delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: HABITS_KEY })
      qc.invalidateQueries({ queryKey: HABIT_LOGS_KEY })
    },
  })
}

// Toggle: if a log exists for (habit, today), delete it; otherwise insert one.
// Optimistic update so the checkbox flips instantly.
export function useToggleHabitLog() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async (habitId) => {
      if (!user) throw new Error('Not authenticated')
      const today = todayStr()
      const { data: existing, error: selectError } = await supabase
        .from('habit_logs')
        .select('id')
        .eq('habit_id', habitId)
        .eq('completed_at', today)
        .maybeSingle()
      if (selectError) throw selectError

      if (existing) {
        const { error } = await supabase
          .from('habit_logs')
          .delete()
          .eq('id', existing.id)
        if (error) throw error
        return { habitId, action: 'remove', logId: existing.id }
      }
      const { data, error } = await supabase
        .from('habit_logs')
        .insert({ habit_id: habitId, user_id: user.id, completed_at: today })
        .select('id, habit_id, completed_at')
        .single()
      if (error) throw error
      return { habitId, action: 'add', log: data }
    },
    onMutate: async (habitId) => {
      await qc.cancelQueries({ queryKey: HABIT_LOGS_KEY })
      const previous = qc.getQueryData(HABIT_LOGS_KEY) ?? []
      const today = todayStr()
      const existing = previous.find(
        (l) => l.habit_id === habitId && l.completed_at === today,
      )
      const next = existing
        ? previous.filter((l) => l.id !== existing.id)
        : [
            ...previous,
            {
              id: `optimistic-${habitId}-${today}`,
              habit_id: habitId,
              completed_at: today,
              _optimistic: true,
            },
          ]
      qc.setQueryData(HABIT_LOGS_KEY, next)
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(HABIT_LOGS_KEY, ctx.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: HABIT_LOGS_KEY })
    },
  })
}
