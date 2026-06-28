import { useState } from 'react'
import { Copy, Check, RefreshCw, Watch, ChevronDown } from 'lucide-react'
import { useToast } from '../context/ToastContext.jsx'

const ENDPOINT = `${import.meta.env.VITE_SUPABASE_URL ?? ''}/functions/v1/sync-apple-sleep`

function CopyRow({ label, value }) {
  const { addToast, showError } = useToast()
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      addToast(`${label} copied`)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      showError('Could not copy. Long-press to copy manually.')
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-iron">
        {label}
      </span>
      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded-lg bg-mortar/60 px-3 py-2 font-mono text-[11px] text-sand">
          {value}
        </code>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy ${label}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-mortar/60 text-iron hover:text-chalk"
        >
          {copied ? <Check size={15} className="text-brick-red" /> : <Copy size={15} />}
        </button>
      </div>
    </div>
  )
}

export default function SleepSyncCard({ token, lastUsedAt, onGenerate, generating }) {
  const [showSteps, setShowSteps] = useState(!token)

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-ash p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-mortar/60 text-brick-red">
          <Watch size={20} />
        </div>
        <div className="flex-1">
          <h2 className="heading text-lg text-chalk">Apple Watch sync</h2>
          <p className="mt-0.5 text-sm text-sand">
            {token
              ? 'A daily iOS Shortcut posts last night’s sleep to Brick.'
              : 'Connect a daily iOS Shortcut to pull sleep from Apple Health.'}
          </p>
        </div>
      </div>

      {!token ? (
        <button
          type="button"
          onClick={onGenerate}
          disabled={generating}
          className="heading min-h-tap inline-flex items-center justify-center gap-1.5 rounded-full bg-brick-red px-4 text-sm text-chalk hover:bg-ember disabled:opacity-60"
        >
          <Watch size={16} strokeWidth={2.5} />
          {generating ? 'Generating…' : 'Generate sync token'}
        </button>
      ) : (
        <div className="flex flex-col gap-3">
          <CopyRow label="Endpoint URL" value={ENDPOINT} />
          <CopyRow label="Sync token" value={token} />

          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-iron">
              {lastUsedAt
                ? `Last synced ${new Date(lastUsedAt).toLocaleString()}`
                : 'Not synced yet'}
            </span>
            <button
              type="button"
              onClick={onGenerate}
              disabled={generating}
              className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-[0.14em] text-iron hover:text-brick-red disabled:opacity-60"
            >
              <RefreshCw size={12} />
              Regenerate
            </button>
          </div>
        </div>
      )}

      <div className="border-t border-dust/30 pt-3">
        <button
          type="button"
          onClick={() => setShowSteps((s) => !s)}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="heading text-sm text-chalk">Set up the Shortcut</span>
          <ChevronDown
            size={16}
            className={`text-iron transition-transform ${showSteps ? 'rotate-180' : ''}`}
          />
        </button>

        {showSteps && (
          <ol className="mt-3 flex flex-col gap-2 text-sm text-sand">
            <Step n={1}>
              In the <b>Shortcuts</b> app, create a new Personal Automation →{' '}
              <b>Time of Day</b> → <b>10:30 AM</b>, repeat <b>Daily</b>, and turn
              off “Ask Before Running”.
            </Step>
            <Step n={2}>
              Add a <b>Find Health Samples</b> action: type <b>Sleep</b>, sorted by{' '}
              <b>End Date</b>, limited to last night.
            </Step>
            <Step n={3}>
              Add a <b>Get Contents of URL</b> action. Set Method <b>POST</b>, URL
              to the <b>Endpoint URL</b> above, add a header{' '}
              <code className="rounded bg-mortar/60 px-1 text-[11px]">x-sync-token</code>{' '}
              with the <b>Sync token</b>, and a JSON request body (see the guide).
            </Step>
            <Step n={4}>
              Run it once to grant Health access. Brick will show “Last synced”
              when data arrives.
            </Step>
            <li className="pt-1">
              <a
                href="https://github.com/prop-rocket/brick/blob/main/docs/apple-watch-sleep-sync.md"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-brick-red hover:text-ember"
              >
                Full step-by-step guide →
              </a>
            </li>
          </ol>
        )}
      </div>
    </div>
  )
}

function Step({ n, children }) {
  return (
    <li className="flex gap-2.5">
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brick-red/15 font-mono text-[11px] text-brick-red">
        {n}
      </span>
      <span className="flex-1 leading-snug">{children}</span>
    </li>
  )
}
