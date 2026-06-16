import { describe, it, expect } from 'vitest'
import {
  toDateStr,
  todayStr,
  mondayOf,
  weekDateStrs,
  currentStreak,
  bestStreak,
  weekKey,
  lastNWeeks,
  lastNDays,
} from '../lib/streakUtils.js'

describe('toDateStr', () => {
  it('formats a Date as YYYY-MM-DD', () => {
    const d = new Date(2024, 0, 15) // Jan 15, 2024 local time
    expect(toDateStr(d)).toBe('2024-01-15')
  })

  it('accepts an ISO string', () => {
    expect(toDateStr('2024-06-01')).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('todayStr', () => {
  it('returns a YYYY-MM-DD string', () => {
    expect(todayStr()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('matches today', () => {
    const now = new Date()
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    expect(todayStr()).toBe(expected)
  })
})

describe('mondayOf', () => {
  it('returns Monday when given a Friday', () => {
    const friday = new Date(2024, 2, 15) // March 15, 2024 = Friday
    expect(mondayOf(friday).getDay()).toBe(1)
  })

  it('returns the same Monday when given a Monday', () => {
    const monday = new Date(2024, 2, 11) // March 11, 2024 = Monday
    expect(mondayOf(monday).getDay()).toBe(1)
    expect(mondayOf(monday).getDate()).toBe(11)
  })

  it('returns the prior Monday when given a Sunday', () => {
    const sunday = new Date(2024, 2, 17) // March 17, 2024 = Sunday
    expect(mondayOf(sunday).getDay()).toBe(1)
    expect(mondayOf(sunday).getDate()).toBe(11) // prior Monday
  })
})

describe('weekDateStrs', () => {
  it('returns exactly 7 date strings', () => {
    expect(weekDateStrs(new Date(2024, 2, 15))).toHaveLength(7)
  })

  it('starts on Monday and ends on Sunday', () => {
    const days = weekDateStrs(new Date(2024, 2, 15)) // Friday, week = Mon Mar 11 – Sun Mar 17
    expect(days[0]).toBe('2024-03-11')
    expect(days[6]).toBe('2024-03-17')
  })
})

describe('bestStreak', () => {
  it('returns 0 for empty or null input', () => {
    expect(bestStreak([])).toBe(0)
    expect(bestStreak(null)).toBe(0)
  })

  it('counts a consecutive run', () => {
    expect(bestStreak(['2024-01-01', '2024-01-02', '2024-01-03'])).toBe(3)
  })

  it('ignores gaps', () => {
    expect(bestStreak(['2024-01-01', '2024-01-03'])).toBe(1)
  })

  it('finds the longest run across multiple runs', () => {
    const dates = [
      '2024-01-01',
      '2024-01-02', // run of 2
      '2024-01-10',
      '2024-01-11',
      '2024-01-12',
      '2024-01-13', // run of 4
    ]
    expect(bestStreak(dates)).toBe(4)
  })

  it('handles a single date', () => {
    expect(bestStreak(['2024-01-01'])).toBe(1)
  })

  it('deduplicates dates', () => {
    expect(bestStreak(['2024-01-01', '2024-01-01', '2024-01-02'])).toBe(2)
  })
})

describe('currentStreak', () => {
  it('returns 0 for empty or null input', () => {
    expect(currentStreak([])).toBe(0)
    expect(currentStreak(null)).toBe(0)
  })

  it('returns 0 when neither today nor yesterday is logged', () => {
    expect(currentStreak(['2020-01-01'])).toBe(0)
  })
})

describe('weekKey', () => {
  it('returns a YYYY-MM-DD Monday string', () => {
    const key = weekKey(new Date(2024, 2, 15))
    expect(key).toBe('2024-03-11')
  })
})

describe('lastNWeeks', () => {
  it('returns N Date objects oldest to newest', () => {
    const weeks = lastNWeeks(4)
    expect(weeks).toHaveLength(4)
    expect(weeks[0].getTime()).toBeLessThan(weeks[3].getTime())
  })
})

describe('lastNDays', () => {
  it('returns N Date objects oldest to newest', () => {
    const days = lastNDays(7)
    expect(days).toHaveLength(7)
    expect(days[0].getTime()).toBeLessThan(days[6].getTime())
  })
})
