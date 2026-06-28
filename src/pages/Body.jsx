import { useMemo, useState } from 'react'
import { Activity, Moon, Plus, Trash2 } from 'lucide-react'
import { useBodyLogs, useDeleteBodyLog } from '../lib/bodyApi.js'
import {
  useSleepLogs,
  useSleepSyncToken,
  useSetSyncToken,
  useDeleteSleepLog,
} from '../lib/sleepApi.js'
import SectionTabs from '../components/charts/SectionTabs.jsx'
import ChartCard from '../components/charts/ChartCard.jsx'
import StatPill from '../components/charts/StatPill.jsx'
import WeightChart from '../components/charts/WeightChart.jsx'
import MeasurementsChart from '../components/charts/MeasurementsChart.jsx'
import SleepChart from '../components/charts/SleepChart.jsx'
import SleepSyncCard from '../components/SleepSyncCard.jsx'
import LogWeightSheet from '../components/LogWeightSheet.jsx'
import LogMeasurementsSheet from '../components/LogMeasurementsSheet.jsx'
import BodyLogRow from '../components/BodyLogRow.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'

const SECTION_OPTIONS = [
  { value: 'weight', label: 'Weight' },
  { value: 'measurements', label: 'Measurements' },
  { value: 'sleep', label: 'Sleep' },
]

const CHART_DAYS = 84 // 12 weeks

function shortLabel(iso) {
  const d = new Date(iso)
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// 7-day moving average over chronological values, ignoring nulls.
function movingAverage(values, window = 7) {
  return values.map((_, i) => {
    const start = Math.max(0, i - window + 1)
    const slice = values.slice(start, i + 1).filter((v) => v != null)
    if (!slice.length) return null
    return slice.reduce((sum, v) => sum + v, 0) / slice.length
  })
}

export default function Body() {
  const [view, setView] = useState('weight')
  const [weightSheetOpen, setWeightSheetOpen] = useState(false)
  const [measSheetOpen, setMeasSheetOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

  const { data: logs = [], isLoading } = useBodyLogs()
  const deleteLog = useDeleteBodyLog()

  const cutoffMs = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - CHART_DAYS)
    return d.getTime()
  }, [])

  const weightLogs = useMemo(
    () => logs.filter((l) => l.weight_kg != null),
    [logs],
  )
  const measLogs = useMemo(
    () =>
      logs.filter(
        (l) => l.chest_cm != null || l.waist_cm != null || l.hips_cm != null,
      ),
    [logs],
  )

  const weightChartData = useMemo(() => {
    const recent = weightLogs.filter(
      (l) => new Date(l.logged_at).getTime() >= cutoffMs,
    )
    const weights = recent.map((l) => Number(l.weight_kg))
    const ma = movingAverage(weights, 7)
    return recent.map((l, i) => ({
      label: shortLabel(l.logged_at),
      weight: weights[i],
      ma7: ma[i] != null ? Math.round(ma[i] * 10) / 10 : null,
    }))
  }, [weightLogs, cutoffMs])

  const measChartData = useMemo(() => {
    const recent = measLogs.filter(
      (l) => new Date(l.logged_at).getTime() >= cutoffMs,
    )
    return recent.map((l) => ({
      label: shortLabel(l.logged_at),
      chest: l.chest_cm != null ? Number(l.chest_cm) : null,
      waist: l.waist_cm != null ? Number(l.waist_cm) : null,
      hips: l.hips_cm != null ? Number(l.hips_cm) : null,
    }))
  }, [measLogs, cutoffMs])

  const weightSummary = useMemo(() => {
    if (!weightLogs.length) return null
    const first = Number(weightLogs[0].weight_kg)
    const last = Number(weightLogs[weightLogs.length - 1].weight_kg)
    const lowest = Math.min(...weightLogs.map((l) => Number(l.weight_kg)))
    return {
      starting: first,
      current: last,
      change: last - first,
      lowest,
    }
  }, [weightLogs])

  const measSummary = useMemo(() => {
    if (!measLogs.length) return null
    const last = measLogs[measLogs.length - 1]
    const first = measLogs[0]
    const waistChange =
      last.waist_cm != null && first.waist_cm != null
        ? Number(last.waist_cm) - Number(first.waist_cm)
        : null
    return {
      currentChest: last.chest_cm,
      currentWaist: last.waist_cm,
      currentHips: last.hips_cm,
      waistChange,
    }
  }, [measLogs])

  const initialMeas = measLogs[measLogs.length - 1] ?? null
  const latestWeight = weightLogs[weightLogs.length - 1]?.weight_kg ?? 75

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return
    const id = pendingDelete.id
    setPendingDelete(null)
    await deleteLog.mutateAsync(id)
  }

  const historyEntries = useMemo(() => {
    const source = view === 'weight' ? weightLogs : measLogs
    return [...source].reverse()
  }, [view, weightLogs, measLogs])

  return (
    <section className="flex flex-col gap-4">
      <h1 className="heading text-3xl">Body</h1>

      <SectionTabs value={view} onChange={setView} options={SECTION_OPTIONS} />

      {view === 'weight' && (
        <WeightView
          chartData={weightChartData}
          summary={weightSummary}
          loading={isLoading}
          onLog={() => setWeightSheetOpen(true)}
        />
      )}
      {view === 'measurements' && (
        <MeasurementsView
          chartData={measChartData}
          summary={measSummary}
          loading={isLoading}
          onLog={() => setMeasSheetOpen(true)}
        />
      )}
      {view === 'sleep' && <SleepView />}

      {view !== 'sleep' && !isLoading && historyEntries.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-iron">
            History
          </p>
          <ul className="flex flex-col gap-2">
            {historyEntries.map((log) => (
              <BodyLogRow
                key={log.id}
                log={log}
                view={view}
                onDelete={setPendingDelete}
              />
            ))}
          </ul>
        </div>
      )}

      <LogWeightSheet
        open={weightSheetOpen}
        onClose={() => setWeightSheetOpen(false)}
        initialWeight={Number(latestWeight) || 75}
      />
      <LogMeasurementsSheet
        open={measSheetOpen}
        onClose={() => setMeasSheetOpen(false)}
        initial={initialMeas}
      />
      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete entry?"
        message={
          pendingDelete
            ? `Entry from ${new Date(pendingDelete.logged_at).toLocaleDateString()} will be removed.`
            : null
        }
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDelete(null)}
      />
    </section>
  )
}

function WeightView({ chartData, summary, loading, onLog }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-2xl bg-ash px-4 py-4">
        <div className="flex flex-col">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-iron">
            Latest
          </span>
          <span className="mt-0.5 font-mono text-3xl text-chalk">
            {summary?.current != null
              ? `${Number(summary.current).toFixed(1)} kg`
              : '—'}
          </span>
        </div>
        <button
          type="button"
          onClick={onLog}
          className="heading min-h-tap inline-flex items-center gap-1.5 rounded-full bg-brick-red px-4 text-sm text-chalk hover:bg-ember"
        >
          <Plus size={16} strokeWidth={2.5} />
          Log Weight
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : chartData.length === 0 ? (
        <EmptyCard
          title="No weight data yet"
          message="Log your weight to start seeing trends."
        />
      ) : (
        <ChartCard title="Weight — last 12 weeks">
          <WeightChart data={chartData} />
          {summary && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <StatPill
                label="Starting"
                value={`${Number(summary.starting).toFixed(1)} kg`}
              />
              <StatPill
                label="Lowest"
                value={`${Number(summary.lowest).toFixed(1)} kg`}
              />
              <StatPill
                label="Current"
                value={`${Number(summary.current).toFixed(1)} kg`}
                accent
              />
              <StatPill
                label="Change"
                value={
                  summary.change === 0
                    ? '—'
                    : `${summary.change > 0 ? '+' : ''}${summary.change.toFixed(1)} kg`
                }
              />
            </div>
          )}
        </ChartCard>
      )}
    </div>
  )
}

function MeasurementsView({ chartData, summary, loading, onLog }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded-2xl bg-ash px-4 py-4">
        <div className="flex flex-1 gap-4">
          <Latest label="Chest" value={summary?.currentChest} />
          <Latest label="Waist" value={summary?.currentWaist} />
          <Latest label="Hips" value={summary?.currentHips} />
        </div>
        <button
          type="button"
          onClick={onLog}
          aria-label="Log measurements"
          className="heading min-h-tap shrink-0 inline-flex items-center gap-1.5 rounded-full bg-brick-red px-4 text-sm text-chalk hover:bg-ember"
        >
          <Plus size={16} strokeWidth={2.5} />
          Log
        </button>
      </div>

      {loading ? (
        <Loading />
      ) : chartData.length === 0 ? (
        <EmptyCard
          title="No measurements yet"
          message="Log chest, waist, and hips to track your shape."
        />
      ) : (
        <ChartCard title="Measurements — last 12 weeks">
          <MeasurementsChart data={chartData} />
          {summary && summary.waistChange != null && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <StatPill
                label="Waist now"
                value={
                  summary.currentWaist != null
                    ? `${Number(summary.currentWaist).toFixed(1)} cm`
                    : '—'
                }
                accent
              />
              <StatPill
                label="Waist Δ"
                value={
                  summary.waistChange === 0
                    ? '—'
                    : `${summary.waistChange > 0 ? '+' : ''}${summary.waistChange.toFixed(1)} cm`
                }
              />
            </div>
          )}
        </ChartCard>
      )}
    </div>
  )
}

function Latest({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-iron">
        {label}
      </span>
      <span className="mt-0.5 font-mono text-lg text-chalk">
        {value != null ? `${Number(value).toFixed(1)}` : '—'}
      </span>
    </div>
  )
}

const SLEEP_CHART_NIGHTS = 30

function fmtDuration(min) {
  if (min == null) return '—'
  return `${Math.floor(min / 60)}h ${Math.round(min % 60)}m`
}

function sleepDayLabel(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })
}

function SleepView() {
  const { data: logs = [], isLoading } = useSleepLogs()
  const { data: tokenRow } = useSleepSyncToken()
  const setToken = useSetSyncToken()
  const deleteLog = useDeleteSleepLog()
  const [pendingDelete, setPendingDelete] = useState(null)

  const chartData = useMemo(
    () =>
      logs.slice(-SLEEP_CHART_NIGHTS).map((l) => ({
        label: sleepDayLabel(l.logged_date),
        hours:
          l.duration_minutes != null
            ? Math.round((l.duration_minutes / 60) * 10) / 10
            : null,
        score: l.sleep_score,
      })),
    [logs],
  )

  const latest = logs[logs.length - 1] ?? null
  const history = useMemo(() => [...logs].reverse(), [logs])

  const handleGenerate = async () => {
    try {
      await setToken.mutateAsync()
    } catch (e) {
      console.error('Failed to set sync token', e)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!pendingDelete) return
    const id = pendingDelete.id
    setPendingDelete(null)
    await deleteLog.mutateAsync(id)
  }

  return (
    <div className="flex flex-col gap-4">
      <SleepSyncCard
        token={tokenRow?.token ?? null}
        lastUsedAt={tokenRow?.last_used_at ?? null}
        onGenerate={handleGenerate}
        generating={setToken.isPending}
      />

      {isLoading ? (
        <Loading />
      ) : logs.length === 0 ? (
        <EmptyCard
          title="No sleep data yet"
          message="Once your Shortcut runs, last night’s sleep shows up here."
          icon={Moon}
        />
      ) : (
        <>
          <div className="flex items-center justify-between rounded-2xl bg-ash px-4 py-4">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-iron">
                Last night
              </span>
              <span className="mt-0.5 font-mono text-3xl text-chalk">
                {fmtDuration(latest?.duration_minutes)}
              </span>
            </div>
            {latest?.sleep_score != null && (
              <div className="flex flex-col items-end">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-iron">
                  Score
                </span>
                <span className="mt-0.5 font-mono text-3xl text-brick-red">
                  {latest.sleep_score}
                </span>
              </div>
            )}
          </div>

          <ChartCard title="Sleep — last 30 nights">
            <SleepChart data={chartData} />
            {latest && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <StatPill label="Deep" value={fmtDuration(latest.deep_minutes)} />
                <StatPill label="REM" value={fmtDuration(latest.rem_minutes)} />
                <StatPill label="Light" value={fmtDuration(latest.light_minutes)} />
                <StatPill label="Awake" value={fmtDuration(latest.awake_minutes)} />
              </div>
            )}
          </ChartCard>

          <div className="flex flex-col gap-2">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-iron">
              History
            </p>
            <ul className="flex flex-col gap-2">
              {history.map((log) => (
                <SleepLogRow key={log.id} log={log} onDelete={setPendingDelete} />
              ))}
            </ul>
          </div>
        </>
      )}

      <ConfirmDialog
        open={!!pendingDelete}
        title="Delete sleep entry?"
        message={
          pendingDelete
            ? `Sleep from ${new Date(pendingDelete.logged_date).toLocaleDateString()} will be removed.`
            : null
        }
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  )
}

function SleepLogRow({ log, onDelete }) {
  return (
    <li className="flex items-center gap-3 rounded-xl bg-ash px-4 py-3">
      <div className="flex flex-1 flex-col">
        <span className="font-mono text-sm text-chalk">
          {sleepDayLabel(log.logged_date)}
        </span>
        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-iron">
          {fmtDuration(log.duration_minutes)}
          {log.sleep_score != null ? ` · score ${log.sleep_score}` : ''}
        </span>
      </div>
      <button
        type="button"
        onClick={() => onDelete(log)}
        aria-label="Delete sleep entry"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-iron hover:text-brick-red"
      >
        <Trash2 size={16} />
      </button>
    </li>
  )
}

function EmptyCard({ title, message, icon: Icon = Activity }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-dust/40 bg-ash/40 px-6 py-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-ash text-brick-red">
        <Icon size={26} />
      </div>
      <div>
        <h2 className="heading text-lg">{title}</h2>
        <p className="mt-1 text-sm text-sand">{message}</p>
      </div>
    </div>
  )
}

function Loading() {
  return (
    <div className="flex flex-col gap-3">
      <div className="h-72 animate-shimmer rounded-2xl bg-ash/60" />
      <div className="h-20 animate-shimmer rounded-2xl bg-ash/60" />
    </div>
  )
}
