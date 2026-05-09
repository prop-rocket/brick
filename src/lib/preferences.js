import { useEffect, useState } from 'react'

// Reactive localStorage hook. Returns the current value and stays in sync
// if Settings (or any other tab) writes to the same key.
//
// Usage:
//   const goal = usePreference('brick_water_goal_glasses', 8)
//   const goals = usePreference('brick_macro_goals', DEFAULT_GOALS)
//
// Important: pass a stable reference for defaultValue (module-level const,
// not an inline object literal) to avoid infinite re-subscription.
export function usePreference(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      if (raw === null) return defaultValue
      try { return JSON.parse(raw) } catch { return raw }
    } catch {
      return defaultValue
    }
  })

  useEffect(() => {
    const handler = (e) => {
      if (e.key !== key) return
      try {
        const raw = e.newValue
        if (raw === null) { setValue(defaultValue); return }
        try { setValue(JSON.parse(raw)) } catch { setValue(raw) }
      } catch {
        setValue(defaultValue)
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [key, defaultValue])

  return value
}
