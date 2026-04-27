import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase.js'
import { useAuth } from '../context/AuthContext.jsx'

export const BODY_LOGS_KEY = ['body_logs']

export function useBodyLogs() {
  const { user } = useAuth()
  return useQuery({
    queryKey: BODY_LOGS_KEY,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('body_logs')
        .select('id, logged_at, weight_kg, chest_cm, waist_cm, hips_cm')
        .order('logged_at', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}

// Upsert by (user_id, logged_at): one row per day.
// Caller passes one or more measurement fields plus the `logged_at` date string.
export function useUpsertBodyLog() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async ({ logged_at, weight_kg, chest_cm, waist_cm, hips_cm }) => {
      if (!user) throw new Error('Not authenticated')

      // Look up existing row for that day so we can patch instead of overwrite.
      const { data: existing, error: selErr } = await supabase
        .from('body_logs')
        .select('id, weight_kg, chest_cm, waist_cm, hips_cm')
        .eq('user_id', user.id)
        .eq('logged_at', logged_at)
        .maybeSingle()
      if (selErr) throw selErr

      const merged = {
        user_id: user.id,
        logged_at,
        weight_kg: weight_kg ?? existing?.weight_kg ?? null,
        chest_cm: chest_cm ?? existing?.chest_cm ?? null,
        waist_cm: waist_cm ?? existing?.waist_cm ?? null,
        hips_cm: hips_cm ?? existing?.hips_cm ?? null,
      }

      if (existing) {
        const { data, error } = await supabase
          .from('body_logs')
          .update(merged)
          .eq('id', existing.id)
          .select()
          .single()
        if (error) throw error
        return data
      }
      const { data, error } = await supabase
        .from('body_logs')
        .insert(merged)
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: BODY_LOGS_KEY }),
  })
}

export function useDeleteBodyLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('body_logs').delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: BODY_LOGS_KEY }),
  })
}
