import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import AuthFrame from '../components/AuthFrame.jsx'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // detectSessionInUrl in the Supabase client handles the URL hash automatically.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true)
      } else {
        navigate('/login', { replace: true })
      }
    })
  }, [navigate])

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setSubmitting(false)
    if (updateError) {
      setError('Could not update password. The link may have expired — request a new one.')
      return
    }
    navigate('/', { replace: true })
  }

  if (!ready) return null

  return (
    <AuthFrame>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <h2 className="heading text-2xl">New password</h2>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-iron">
            New password
          </span>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-tap rounded-lg border border-dust/40 bg-ash px-3 text-chalk placeholder-iron outline-none focus:border-brick-red"
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-iron">
            min 6 characters
          </span>
        </label>

        {error && (
          <p className="rounded-md border border-brick-red/40 bg-brick-red/10 px-3 py-2 text-sm text-brick-red">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="heading min-h-tap rounded-lg bg-brick-red px-4 text-lg text-chalk transition-colors hover:bg-ember disabled:opacity-60"
        >
          {submitting ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </AuthFrame>
  )
}
