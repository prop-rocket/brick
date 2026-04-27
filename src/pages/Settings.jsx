import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronRight, Download, Trash2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import { useWeightUnit } from '../context/WeightUnitContext.jsx'
import { supabase } from '../lib/supabase.js'
import StepperInput from '../components/StepperInput.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

const REST_LS_KEY = 'brick_rest_seconds'

export function getStoredRestSeconds() {
  try { return Number(localStorage.getItem(REST_LS_KEY)) || 90 } catch { return 90 }
}

function setStoredRestSeconds(v) {
  try { localStorage.setItem(REST_LS_KEY, String(v)) } catch {}
}

const WEEK_LS_KEY = 'brick_week_start'
export function getWeekStart() {
  try { return localStorage.getItem(WEEK_LS_KEY) === 'sunday' ? 'sunday' : 'monday' } catch { return 'monday' }
}

export default function Settings() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { unit, setUnit } = useWeightUnit()

  const [restSeconds, setRestSecondsState] = useState(getStoredRestSeconds)
  const [weekStart, setWeekStartState] = useState(getWeekStart)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleRestChange = (v) => {
    setRestSecondsState(v)
    setStoredRestSeconds(v)
  }

  const handleWeekStart = (v) => {
    setWeekStartState(v)
    try { localStorage.setItem(WEEK_LS_KEY, v) } catch {}
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const [habits, habitLogs, workouts, workoutSets, bodyLogs] = await Promise.all([
        supabase.from('habits').select('*'),
        supabase.from('habit_logs').select('*'),
        supabase.from('workouts').select('*'),
        supabase.from('workout_sets').select('*'),
        supabase.from('body_logs').select('*'),
      ])
      const payload = {
        exported_at: new Date().toISOString(),
        habits: habits.data ?? [],
        habit_logs: habitLogs.data ?? [],
        workouts: workouts.data ?? [],
        workout_sets: workoutSets.data ?? [],
        body_logs: bodyLogs.data ?? [],
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `brick-export-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Export failed', e)
    } finally {
      setExporting(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setConfirmDelete(false)
    try {
      // Delete user data in dependency order
      await supabase.from('workout_sets').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('workouts').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('template_exercises').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('workout_templates').delete().eq('is_preset', false)
      await supabase.from('habit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('habits').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('body_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await signOut()
    } catch (e) {
      console.error('Delete account failed', e)
      setDeleting(false)
    }
  }

  return (
    <div className="min-h-screen bg-mortar text-chalk">
      <header className="sticky top-0 z-20 border-b border-dust/30 bg-mortar/95 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Back"
            className="min-h-tap min-w-tap flex items-center justify-center text-iron hover:text-chalk"
          >
            <ArrowLeft size={22} />
          </button>
          <h1 className="heading text-2xl">Settings</h1>
        </div>
      </header>

      <div className="mx-auto w-full max-w-xl flex flex-col gap-6 px-4 py-5 pb-16">
        {/* ACCOUNT */}
        <SettingsSection label="Account">
          <SettingsRow label="Email">
            <span className="font-mono text-sm text-iron">{user?.email}</span>
          </SettingsRow>
          <button
            type="button"
            onClick={() => signOut()}
            className="flex min-h-tap w-full items-center justify-between rounded-xl border border-brick-red/40 px-4 text-left hover:bg-brick-red/10"
          >
            <span className="heading text-sm text-chalk">Sign Out</span>
            <ChevronRight size={18} className="text-iron" />
          </button>
        </SettingsSection>

        {/* PREFERENCES */}
        <SettingsSection label="Preferences">
          <SettingsRow label="Default rest timer">
            <StepperInput
              value={restSeconds}
              onChange={handleRestChange}
              step={15}
              min={30}
              max={300}
              unit="s"
            />
          </SettingsRow>
          <SettingsRow label="Weight unit">
            <div className="flex gap-1 rounded-full bg-mortar/60 p-1">
              {(['kg', 'lbs'] ).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`heading min-h-[36px] rounded-full px-4 text-sm transition-colors ${
                    unit === u ? 'bg-brick-red text-chalk' : 'text-iron hover:text-sand'
                  }`}
                >
                  {u.toUpperCase()}
                </button>
              ))}
            </div>
          </SettingsRow>
          <SettingsRow label="Week starts on">
            <div className="flex gap-1 rounded-full bg-mortar/60 p-1">
              {([['monday', 'Mon'], ['sunday', 'Sun']]).map(([val, lbl]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleWeekStart(val)}
                  className={`heading min-h-[36px] rounded-full px-4 text-sm transition-colors ${
                    weekStart === val ? 'bg-brick-red text-chalk' : 'text-iron hover:text-sand'
                  }`}
                >
                  {lbl}
                </button>
              ))}
            </div>
          </SettingsRow>
        </SettingsSection>

        {/* DATA */}
        <SettingsSection label="Data">
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="flex min-h-tap w-full items-center gap-3 rounded-xl bg-ash px-4 text-left hover:bg-dust/30 disabled:opacity-50"
          >
            <Download size={20} className="shrink-0 text-iron" />
            <span className="heading flex-1 text-sm text-chalk">
              {exporting ? 'Exporting…' : 'Export My Data'}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            disabled={deleting}
            className="flex min-h-tap w-full items-center gap-3 rounded-xl bg-ash px-4 text-left hover:bg-brick-red/10 disabled:opacity-50"
          >
            <Trash2 size={20} className="shrink-0 text-brick-red" />
            <span className="heading flex-1 text-sm text-brick-red">
              {deleting ? 'Deleting…' : 'Delete Account & Data'}
            </span>
          </button>
        </SettingsSection>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete account?"
        message="All your habits, workouts, and body data will be permanently removed. This cannot be undone."
        confirmLabel="Delete everything"
        cancelLabel="Keep my data"
        destructive
        onConfirm={handleDeleteAccount}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  )
}

function SettingsSection({ label, children }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-iron">{label}</p>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  )
}

function SettingsRow({ label, children }) {
  return (
    <div className="flex min-h-tap items-center justify-between gap-4 rounded-xl bg-ash px-4 py-3">
      <span className="heading text-sm text-chalk">{label}</span>
      {children}
    </div>
  )
}
