import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import AuthFrame from '../components/AuthFrame.jsx'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    setSubmitting(false)
    if (resetError) {
      setError('Could not send reset email. Check your address and try again.')
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <AuthFrame>
        <div className="flex flex-col gap-4">
          <h2 className="heading text-2xl">Check your email</h2>
          <p className="text-sm text-sand">
            We sent a password reset link to{' '}
            <strong className="text-chalk">{email}</strong>. Follow the link to set a new
            password.
          </p>
          <Link
            to="/login"
            className="heading min-h-tap flex items-center justify-center rounded-lg bg-ash text-base text-chalk hover:bg-dust/40"
          >
            Back to sign in
          </Link>
        </div>
      </AuthFrame>
    )
  }

  return (
    <AuthFrame>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <h2 className="heading text-2xl">Reset password</h2>
        <p className="text-sm text-sand">Enter your email and we'll send you a reset link.</p>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-iron">
            Email
          </span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="min-h-tap rounded-lg border border-dust/40 bg-ash px-3 text-chalk placeholder-iron outline-none focus:border-brick-red"
          />
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
          {submitting ? 'Sending…' : 'Send reset link'}
        </button>

        <Link to="/login" className="text-center text-sm text-iron hover:text-sand">
          Back to sign in
        </Link>
      </form>
    </AuthFrame>
  )
}
