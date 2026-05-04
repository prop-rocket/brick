import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from './supabase.js'
import { useAuth } from '../context/AuthContext.jsx'
import { todayStr, lastNDays, toDateStr } from './streakUtils.js'

export const WATER_LOGS_KEY = ['water_logs']
export const todayWaterKey = (date) => ['water_logs', 'day', date]

// Fetches today's water row. Returns { glasses: 0 } if none exists yet
// (avoids creating an empty row on read).
export function useTodayWater() {
  const { user } = useAuth()
  const date = todayStr()
  return useQuery({
    queryKey: todayWaterKey(date),
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('water_logs')
        .select('id, logged_at, glasses')
        .eq('user_id', user.id)
        .eq('logged_at', date)
        .maybeSingle()
      if (error) throw error
      return data ?? { id: null, logged_at: date, glasses: 0 }
    },
  })
}

// Upsert today's row to a specific glass count (clamped to 0).
export function useSetWaterGlasses() {
  const qc = useQueryClient()
  const { user } = useAuth()
  const date = todayStr()

  return useMutation({
    mutationFn: async (glasses) => {
      if (!user) throw new Error('Not authenticated')
      const safe = Math.max(0, Math.floor(glasses))

      const { data: existing, error: selErr } = await supabase
        .from('water_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('logged_at', date)
        .maybeSingle()
      if (selErr) throw selErr

      if (existing) {
        const { data, error } = await supabase
          .from('water_logs')
          .update({ glasses: safe })
          .eq('id', existing.id)
          .select()
          .single()
        if (error) throw error
        return data
      }
      const { data, error } = await supabase
        .from('water_logs')
        .insert({ user_id: user.id, logged_at: date, glasses: safe })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onMutate: async (glasses) => {
      await qc.cancelQueries({ queryKey: todayWaterKey(date) })
      const previous = qc.getQueryData(todayWaterKey(date))
      qc.setQueryData(todayWaterKey(date), (old) => ({
        ...(old ?? { id: null, logged_at: date }),
        glasses: Math.max(0, Math.floor(glasses)),
      }))
      return { previous }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(todayWaterKey(date), ctx.previous)
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: todayWaterKey(date) })
      qc.invalidateQueries({ queryKey: WATER_LOGS_KEY })
    },
  })
}

// Last 7 days of water counts, oldest → newest, suitable for a bar chart.
export function useWeekWater() {
  const { user } = useAuth()
  return useQuery({
    queryKey: [...WATER_LOGS_KEY, 'week'],
    enabled: !!user,
    queryFn: async () => {
      const days = lastNDays(7)
      const oldest = toDateStr(days[0])
      const { data, error } = await supabase
        .from('water_logs')
        .select('logged_at, glasses')
        .eq('user_id', user.id)
        .gte('logged_at', oldest)
      if (error) throw error
      const byDate = new Map()
      for (const row of data ?? []) byDate.set(row.logged_at, row.glasses)
      return days.map((d) => {
        const date = toDateStr(d)
        return { date, glasses: byDate.get(date) ?? 0 }
      })
    },
  })
}
