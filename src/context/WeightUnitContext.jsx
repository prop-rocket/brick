import { createContext, useCallback, useContext, useState } from 'react'

const LS_KEY = 'brick_weight_unit'

const WeightUnitContext = createContext(null)

export function WeightUnitProvider({ children }) {
  const [unit, setUnitState] = useState(() => {
    try { return localStorage.getItem(LS_KEY) === 'lbs' ? 'lbs' : 'kg' } catch { return 'kg' }
  })

  const setUnit = useCallback((u) => {
    setUnitState(u)
    try { localStorage.setItem(LS_KEY, u) } catch {}
  }, [])

  return (
    <WeightUnitContext.Provider value={{ unit, setUnit }}>
      {children}
    </WeightUnitContext.Provider>
  )
}

export function useWeightUnit() {
  const ctx = useContext(WeightUnitContext)
  if (!ctx) throw new Error('useWeightUnit must be inside WeightUnitProvider')
  return ctx
}

const KG_TO_LBS = 2.20462

export function useWeightDisplay() {
  const { unit } = useWeightUnit()

  const fmt = useCallback(
    (kg, decimals = 1) => {
      if (kg == null) return '—'
      const v = unit === 'lbs' ? kg * KG_TO_LBS : kg
      return `${Number(v.toFixed(decimals))} ${unit}`
    },
    [unit],
  )

  const fmtRaw = useCallback(
    (kg, decimals = 1) => {
      if (kg == null) return null
      const v = unit === 'lbs' ? kg * KG_TO_LBS : kg
      return Math.round(v * Math.pow(10, decimals)) / Math.pow(10, decimals)
    },
    [unit],
  )

  return { fmt, fmtRaw, unit }
}
