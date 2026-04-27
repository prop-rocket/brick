import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

const LS_KEY = 'brick_install_dismissed'

export default function InstallBanner() {
  const [prompt, setPrompt] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Already dismissed or installed
    if (localStorage.getItem(LS_KEY)) {
      setDismissed(true)
      return
    }
    // Already in standalone mode = already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstalled(true))
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    dismiss()
  }

  const dismiss = () => {
    setDismissed(true)
    try { localStorage.setItem(LS_KEY, '1') } catch {}
  }

  if (dismissed || installed || !prompt) return null

  return (
    <div className="flex items-center gap-3 border-b border-dust/30 bg-ash px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brick-red">
        <span className="heading text-xs text-chalk">BR</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="heading text-sm text-chalk">Add Brick to Home Screen</p>
        <p className="font-sans text-[11px] text-iron">Install for the best experience</p>
      </div>
      <button
        type="button"
        onClick={handleInstall}
        className="heading min-h-[36px] shrink-0 rounded-full bg-brick-red px-3 text-xs text-chalk hover:bg-ember"
      >
        Install
      </button>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="min-h-tap min-w-tap flex shrink-0 items-center justify-center rounded-full text-iron hover:text-chalk"
      >
        <X size={18} />
      </button>
    </div>
  )
}
