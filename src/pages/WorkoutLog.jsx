import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { X } from 'lucide-react'
import {
  useWorkout,
  useTemplateExercises,
  useWorkoutSets,
  useLogSet,
  useFinishWorkout,
} from '../lib/gymApi.js'
import ExerciseLogCard from '../components/ExerciseLogCard.jsx'
import RestTimer from '../components/RestTimer.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

const REST_SECONDS = 90
const DEFAULT_REPS = 8
const DEFAULT_WEIGHT = 60

function formatElapsed(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function WorkoutLog() {
  const { workoutId } = useParams()
  const navigate = useNavigate()

  const workoutQuery = useWorkout(workoutId)
  const workout = workoutQuery.data

  const templateExQuery = useTemplateExercises(workout?.template_id)
  const templateExercises = templateExQuery.data ?? []

  const setsQuery = useWorkoutSets(workoutId)
  const allSets = setsQuery.data ?? []

  const logSet = useLogSet()
  const finishWorkout = useFinishWorkout()

  // Elapsed timer
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!workout?.started_at) return
    const startMs = new Date(workout.started_at).getTime()
    const tick = () => setElapsed(Math.floor((Date.now() - startMs) / 1000))
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [workout?.started_at])

  // Rest timer
  const [restSeconds, setRestSeconds] = useState(0)
  const restIntervalRef = useRef(null)

  const startRest = () => {
    clearInterval(restIntervalRef.current)
    setRestSeconds(REST_SECONDS)
    restIntervalRef.current = setInterval(() => {
      setRestSeconds((s) => {
        if (s <= 1) {
          clearInterval(restIntervalRef.current)
          try { navigator.vibrate?.([200, 100, 200]) } catch {}
          return 0
        }
        return s - 1
      })
    }, 1000)
  }

  const skipRest = () => {
    clearInterval(restIntervalRef.current)
    setRestSeconds(0)
  }

  useEffect(() => () => clearInterval(restIntervalRef.current), [])

  // Per-exercise staging sets: { [exerciseId]: { reps, weightKg } | null }
  const [staging, setStaging] = useState({})

  // Grouped sets by exercise
  const setsByExercise = useMemo(() => {
    const m = {}
    for (const s of allSets) {
      if (!m[s.exercise_id]) m[s.exercise_id] = []
      m[s.exercise_id].push(s)
    }
    return m
  }, [allSets])

  const activateStaging = (exerciseId) => {
    const existing = setsByExercise[exerciseId] ?? []
    const last = existing[existing.length - 1]
    setStaging((prev) => ({
      ...prev,
      [exerciseId]: {
        reps: last?.reps ?? DEFAULT_REPS,
        weightKg: last?.weight_kg ?? DEFAULT_WEIGHT,
      },
    }))
  }

  const handleConfirmSet = async (exerciseId) => {
    const s = staging[exerciseId]
    if (!s) return
    const existing = setsByExercise[exerciseId] ?? []
    try {
      await logSet.mutateAsync({
        workoutId,
        exerciseId,
        setNumber: existing.length + 1,
        reps: s.reps,
        weightKg: s.weightKg,
      })
      // Keep values for next set (pre-filled)
      setStaging((prev) => ({ ...prev, [exerciseId]: { ...s } }))
      startRest()
    } catch (e) {
      console.error('Failed to log set', e)
    }
  }

  // Finish workout
  const [confirmFinish, setConfirmFinish] = useState(false)

  const handleFinish = async () => {
    setConfirmFinish(false)
    try {
      await finishWorkout.mutateAsync(workoutId)
      navigate(`/gym/summary/${workoutId}`, { replace: true })
    } catch (e) {
      console.error('Failed to finish workout', e)
    }
  }

  const templateName = workout?.workout_templates?.name ?? 'Workout'

  if (workoutQuery.isLoading || templateExQuery.isLoading) {
    return <LoadingScreen />
  }

  return (
    <div className="flex min-h-screen flex-col bg-mortar text-chalk">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-dust/30 bg-mortar/95 backdrop-blur">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
          <div>
            <p className="heading text-xl leading-tight">{templateName}</p>
            <p className="font-mono text-[13px] text-ember">{formatElapsed(elapsed)}</p>
          </div>
          <button
            type="button"
            onClick={() => setConfirmFinish(true)}
            className="heading min-h-tap rounded-lg bg-brick-red px-4 text-sm text-chalk hover:bg-ember"
          >
            Finish
          </button>
        </div>
      </header>

      {/* Exercise cards */}
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-4 px-4 py-4 pb-32">
        {templateExercises.length === 0 ? (
          <p className="mt-10 text-center font-mono text-sm text-iron">
            No exercises in this template
          </p>
        ) : (
          templateExercises.map((te) => {
            const exercise = te.exercises
            if (!exercise) return null
            const logged = setsByExercise[exercise.id] ?? []
            const stg = staging[exercise.id] ?? null
            return (
              <ExerciseLogCard
                key={te.exercise_id}
                exercise={exercise}
                loggedSets={logged}
                staging={stg}
                onStagingChange={(v) =>
                  setStaging((prev) => ({ ...prev, [exercise.id]: v }))
                }
                onActivateStaging={() => activateStaging(exercise.id)}
                onConfirmSet={() => handleConfirmSet(exercise.id)}
                logPending={logSet.isPending}
              />
            )
          })
        )}
      </main>

      {/* Rest timer — slides up from bottom */}
      <RestTimer seconds={restSeconds} onSkip={skipRest} />

      {/* Finish confirm */}
      <ConfirmDialog
        open={confirmFinish}
        title="Finish workout?"
        message="Your session will end and you'll see your summary."
        confirmLabel="Finish"
        cancelLabel="Keep going"
        destructive={false}
        onConfirm={handleFinish}
        onCancel={() => setConfirmFinish(false)}
      />
    </div>
  )
}

function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-mortar">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-dust border-t-brick-red" />
    </div>
  )
}
