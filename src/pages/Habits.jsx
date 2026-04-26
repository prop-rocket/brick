import { useMemo, useState } from 'react'
import { Plus, Repeat } from 'lucide-react'
import {
  useHabits,
  useHabitLogs,
  useCreateHabit,
  useUpdateHabit,
  useDeleteHabit,
} from '../lib/habitsApi.js'
import { currentStreak, thisWeekCount } from '../lib/streakUtils.js'
import CategoryPills, { ALL_CATEGORY } from '../components/CategoryPills.jsx'
import HabitCard from '../components/HabitCard.jsx'
import BottomSheet from '../components/BottomSheet.jsx'
import HabitForm from '../components/HabitForm.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

export default function Habits() {
  const habitsQuery = useHabits()
  const logsQuery = useHabitLogs()
  const createHabit = useCreateHabit()
  const updateHabit = useUpdateHabit()
  const deleteHabit = useDeleteHabit()

  const [filter, setFilter] = useState(ALL_CATEGORY)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [pendingDelete, setPendingDelete] = useState(null)

  const habits = habitsQuery.data ?? []
  const logs = logsQuery.data ?? []

  const datesByHabit = useMemo(() => {
    const m = new Map()
    for (const log of logs) {
      if (!m.has(log.habit_id)) m.set(log.habit_id, [])
      m.get(log.habit_id).push(log.completed_at)
    }
    return m
  }, [logs])

  const filtered = useMemo(() => {
    if (filter === ALL_CATEGORY) return habits
    return habits.filter((h) => (h.category ?? '').toLowerCase() === filter.toLowerCase())
  }, [habits, filter])

  const openNew = () => {
    setEditing(null)
    setSheetOpen(true)
  }

  const openEdit = (habit) => {
    setEditing(habit)
    setSheetOpen(true)
  }

  const closeSheet = () => {
    setSheetOpen(false)
    setEditing(null)
  }

  const handleSubmit = async (form) => {
    if (editing) {
      await updateHabit.mutateAsync({ id: editing.id, ...form })
    } else {
      await createHabit.mutateAsync(form)
    }
    closeSheet()
  }

  const requestDelete = (habit) => setPendingDelete(habit)
  const cancelDelete = () => setPendingDelete(null)
  const confirmDelete = async () => {
    if (!pendingDelete) return
    const id = pendingDelete.id
    setPendingDelete(null)
    await deleteHabit.mutateAsync(id)
  }

  const submitting = createHabit.isPending || updateHabit.isPending

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h1 className="heading text-3xl">Habits</h1>
        <button
          type="button"
          onClick={openNew}
          className="heading min-h-tap inline-flex items-center gap-1.5 rounded-full bg-brick-red px-4 text-sm text-chalk hover:bg-ember"
        >
          <Plus size={18} strokeWidth={3} />
          <span>New</span>
        </button>
      </header>

      <CategoryPills value={filter} onChange={setFilter} />

      {habitsQuery.isLoading ? (
        <ListLoading />
      ) : habitsQuery.isError ? (
        <ErrorState message={habitsQuery.error?.message} />
      ) : habits.length === 0 ? (
        <EmptyState onCreate={openNew} />
      ) : filtered.length === 0 ? (
        <p className="rounded-xl border border-dashed border-dust/50 bg-ash/40 px-4 py-8 text-center font-mono text-xs uppercase tracking-[0.18em] text-iron">
          No habits in {filter}
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((habit) => {
            const dates = datesByHabit.get(habit.id) ?? []
            const weekProgress =
              habit.frequency_type === 'weekly'
                ? { value: thisWeekCount(dates), goal: habit.weekly_goal ?? 1 }
                : null
            return (
              <HabitCard
                key={habit.id}
                habit={habit}
                streak={currentStreak(dates)}
                weekProgress={weekProgress}
                onEdit={openEdit}
                onDelete={requestDelete}
              />
            )
          })}
        </ul>
      )}

      <BottomSheet
        open={sheetOpen}
        onClose={closeSheet}
        title={editing ? 'Edit habit' : 'New habit'}
      >
        <HabitForm
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={closeSheet}
          submitting={submitting}
          submitLabel={editing ? 'Save' : 'Create'}
        />
      </BottomSheet>

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete habit?"
        message={
          pendingDelete
            ? `"${pendingDelete.name}" and all its logs will be removed.`
            : null
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </section>
  )
}

function ListLoading() {
  return (
    <div className="flex flex-col gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="min-h-[72px] animate-pulse rounded-xl bg-ash/60"
        />
      ))}
    </div>
  )
}

function ErrorState({ message }) {
  return (
    <p className="rounded-md border border-brick-red/40 bg-brick-red/10 px-3 py-3 text-sm text-brick-red">
      Failed to load habits{message ? `: ${message}` : ''}
    </p>
  )
}

function EmptyState({ onCreate }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-dust/40 bg-ash/40 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ash text-brick-red">
        <Repeat size={26} />
      </div>
      <div>
        <h2 className="heading text-xl">No habits yet</h2>
        <p className="mt-1 text-sm text-sand">
          Lay your first brick. One every day.
        </p>
      </div>
      <button
        type="button"
        onClick={onCreate}
        className="heading min-h-tap rounded-lg bg-brick-red px-5 text-sm text-chalk hover:bg-ember"
      >
        Create habit
      </button>
    </div>
  )
}
