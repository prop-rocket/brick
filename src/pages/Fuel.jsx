import { useMemo, useState } from 'react'
import { Plus, UtensilsCrossed } from 'lucide-react'
import { useFoodLogs, useDeleteFood } from '../lib/foodApi.js'
import { todayStr, toDateStr } from '../lib/streakUtils.js'
import SectionTabs from '../components/charts/SectionTabs.jsx'
import LogFoodSheet from '../components/LogFoodSheet.jsx'
import FoodLogRow from '../components/FoodLogRow.jsx'
import MacrosSummaryCard from '../components/MacrosSummaryCard.jsx'
import WaterTracker from '../components/WaterTracker.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

const SECTION_OPTIONS = [
  { value: 'food',  label: 'Food' },
  { value: 'water', label: 'Water' },
]

export default function Fuel() {
  const [section, setSection] = useState('food')

  return (
    <section className="flex flex-col gap-4">
      <h1 className="heading text-3xl">Fuel</h1>
      <SectionTabs value={section} onChange={setSection} options={SECTION_OPTIONS} />
      {section === 'food' ? <FoodView /> : <WaterTracker />}
    </section>
  )
}

function FoodView() {
  const { data: logs = [], isLoading } = useFoodLogs()
  const deleteFood = useDeleteFood()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const today = todayStr()

  const todaysLogs = useMemo(
    () => logs.filter((l) => toDateStr(l.logged_at) === today),
    [logs, today],
  )

  const totals = useMemo(() => {
    const acc = { calories: 0, protein: 0, carbs: 0, fat: 0 }
    for (const l of todaysLogs) {
      acc.calories += Number(l.calories) || 0
      acc.protein  += Number(l.protein_g) || 0
      acc.carbs    += Number(l.carbs_g) || 0
      acc.fat      += Number(l.fat_g) || 0
    }
    return acc
  }, [todaysLogs])

  const handleDelete = async () => {
    if (!pendingDelete) return
    const id = pendingDelete.id
    setPendingDelete(null)
    try {
      await deleteFood.mutateAsync(id)
    } catch (e) {
      console.error('Failed to delete', e)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <MacrosSummaryCard totals={totals} />

      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        className="heading min-h-tap inline-flex items-center justify-center gap-2 rounded-xl bg-brick-red text-base text-chalk hover:bg-ember active:scale-95"
      >
        <Plus size={18} strokeWidth={2.5} />
        Log Meal
      </button>

      {isLoading ? (
        <Loading />
      ) : todaysLogs.length === 0 ? (
        <EmptyFood />
      ) : (
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-iron">
            Today
          </p>
          <ul className="flex flex-col gap-2">
            {todaysLogs.map((log) => (
              <FoodLogRow key={log.id} log={log} onDelete={setPendingDelete} />
            ))}
          </ul>
        </div>
      )}

      <LogFoodSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete meal?"
        message={pendingDelete ? `"${pendingDelete.name}" will be removed.` : null}
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}

function EmptyFood() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-dust/40 bg-ash/40 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ash text-brick-red">
        <UtensilsCrossed size={26} />
      </div>
      <div>
        <h2 className="heading text-lg">No meals yet today</h2>
        <p className="mt-1 text-sm text-sand">
          Log a meal above to track your macros.
        </p>
      </div>
    </div>
  )
}

function Loading() {
  return (
    <div className="flex flex-col gap-2">
      <div className="h-12 animate-shimmer rounded-xl bg-ash/60" />
      <div className="h-12 animate-shimmer rounded-xl bg-ash/60" />
      <div className="h-12 animate-shimmer rounded-xl bg-ash/60" />
    </div>
  )
}
