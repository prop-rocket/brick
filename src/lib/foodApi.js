import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { lastNDays, toDateStr } from './streakUtils.js'

export const FOOD_LOGS_KEY = ['food_logs']

export function useFoodLogs() {
  const { user } = useAuth()
  return useQuery({
    queryKey: FOOD_LOGS_KEY,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_logs')
        .select('id, logged_at, meal_type, name, calories, protein_g, carbs_g, fat_g')
        .order('logged_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })
}

export function useCreateFood() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({ meal_type, name, calories, protein_g, carbs_g, fat_g }) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('food_logs')
        .insert({
          user_id: user.id,
          logged_at: new Date().toISOString(),
          meal_type,
          name: name.trim(),
          calories: calories ?? null,
          protein_g: protein_g ?? null,
          carbs_g: carbs_g ?? null,
          fat_g: fat_g ?? null,
        })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: FOOD_LOGS_KEY }),
  })
}

export function useDeleteFood() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('food_logs').delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: FOOD_LOGS_KEY }),
  })
}

// Daily calorie + macro totals for the last N days, oldest → newest.
export function useDailyCaloriesByWeek(n = 7) {
  const { user } = useAuth()
  return useQuery({
    queryKey: [...FOOD_LOGS_KEY, 'by_day', n],
    enabled: !!user,
    queryFn: async () => {
      const days = lastNDays(n)
      const oldest = toDateStr(days[0])
      const { data, error } = await supabase
        .from('food_logs')
        .select('logged_at, calories, protein_g, carbs_g, fat_g')
        .gte('logged_at', oldest + 'T00:00:00')
        .order('logged_at', { ascending: true })
      if (error) throw error

      const byDate = new Map()
      for (const row of data ?? []) {
        const date = toDateStr(row.logged_at)
        const acc = byDate.get(date) ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }
        acc.calories += Number(row.calories) || 0
        acc.protein  += Number(row.protein_g) || 0
        acc.carbs    += Number(row.carbs_g) || 0
        acc.fat      += Number(row.fat_g) || 0
        byDate.set(date, acc)
      }

      return days.map((d) => {
        const date = toDateStr(d)
        return { date, ...(byDate.get(date) ?? { calories: 0, protein: 0, carbs: 0, fat: 0 }) }
      })
    },
  })
}
