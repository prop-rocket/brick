// Date + streak math for habits.
// All dates are normalized to local "YYYY-MM-DD" strings to match the
// Postgres `date` column on habit_logs.

const DAY_MS = 86_400_000

export function toDateStr(date) {
  const d = date instanceof Date ? date : new Date(date)
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function todayStr() {
  return toDateStr(new Date())
}

// Monday of the week containing `date`, normalized to 00:00 local.
export function mondayOf(date = new Date()) {
  const d = date instanceof Date ? new Date(date) : new Date(date)
  const day = d.getDay() // 0=Sun, 1=Mon, ... 6=Sat
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

// Returns the 7 YYYY-MM-DD strings for the week (Mon..Sun) containing `date`.
export function weekDateStrs(date = new Date()) {
  const start = mondayOf(date)
  const out = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    out.push(toDateStr(d))
  }
  return out
}

// Count distinct logs (by date) that fall in the current Mon..Sun.
export function thisWeekCount(dates) {
  const week = new Set(weekDateStrs())
  const seen = new Set()
  for (const d of dates) {
    if (week.has(d)) seen.add(d)
  }
  return seen.size
}

// Current streak ending at today (or yesterday if today isn't logged yet).
// Returns 0 if neither today nor yesterday is logged.
export function currentStreak(dates) {
  if (!dates || dates.length === 0) return 0
  const set = new Set(dates)
  const cursor = new Date()
  cursor.setHours(0, 0, 0, 0)

  if (!set.has(toDateStr(cursor))) {
    cursor.setTime(cursor.getTime() - DAY_MS)
    if (!set.has(toDateStr(cursor))) return 0
  }

  let streak = 0
  while (set.has(toDateStr(cursor))) {
    streak++
    cursor.setTime(cursor.getTime() - DAY_MS)
  }
  return streak
}

// Longest consecutive run anywhere in history.
export function bestStreak(dates) {
  if (!dates || dates.length === 0) return 0
  const unique = Array.from(new Set(dates)).sort()
  let best = 1
  let run = 1
  for (let i = 1; i < unique.length; i++) {
    const prev = new Date(unique[i - 1])
    const curr = new Date(unique[i])
    const diffDays = Math.round((curr - prev) / DAY_MS)
    if (diffDays === 1) {
      run++
      if (run > best) best = run
    } else {
      run = 1
    }
  }
  return best
}
