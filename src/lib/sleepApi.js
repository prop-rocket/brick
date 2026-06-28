import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase.js'
import { useAuth } from '../context/AuthContext.jsx'

export const SLEEP_LOGS_KEY = ['sleep_logs']
export const SLEEP_TOKEN_KEY = ['sleep_sync_token']

// All synced nights, oldest → newest (so charts read left-to-right).
export function useSleepLogs() {
  const { user } = useAuth()
  return useQuery({
    queryKey: SLEEP_LOGS_KEY,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sleep_logs')
        .select(
          'id, logged_date, sleep_start, sleep_end, duration_minutes, sleep_score, deep_minutes, rem_minutes, light_minutes, awake_minutes, source',
        )
        .order('logged_date', { ascending: true })
      if (error) throw error
      return data ?? []
    },
  })
}

// The user's sync token row ({ token, last_used_at, created_at }) or null if
// they haven't connected Apple Watch yet.
export function useSleepSyncToken() {
  const { user } = useAuth()
  return useQuery({
    queryKey: SLEEP_TOKEN_KEY,
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sleep_sync_tokens')
        .select('token, created_at, last_used_at')
        .maybeSingle()
      if (error) throw error
      return data ?? null
    },
  })
}

// Create the sync token (first connect) or replace it with a fresh value
// (regenerate). One row per user — `onConflict: 'user_id'` overwrites in place,
// which instantly invalidates any token baked into an old Shortcut.
export function useSetSyncToken() {
  const qc = useQueryClient()
  const { user } = useAuth()
  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')
      const token = crypto.randomUUID()
      const { data, error } = await supabase
        .from('sleep_sync_tokens')
        .upsert({ user_id: user.id, token }, { onConflict: 'user_id' })
        .select('token, created_at, last_used_at')
        .single()
      if (error) throw error
      return data
    },
    onSuccess: (data) => qc.setQueryData(SLEEP_TOKEN_KEY, data),
  })
}

export function useDeleteSleepLog() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('sleep_logs').delete().eq('id', id)
      if (error) throw error
      return id
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: SLEEP_LOGS_KEY }),
  })
}
