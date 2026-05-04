import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase.js'
import { useAuth } from '../context/AuthContext.jsx'

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
