import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AuthFrame from '../components/AuthFrame.jsx'

function sanitizeSignUpError(err) {
  const msg = err?.message?.toLowerCase() ?? ''
  if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('unique')) {
    return 'An account with this email already exists.'
  }
  if (msg.includes('password') && (msg.includes('weak') || msg.includes('short'))) {
    return 'Password is too weak. Use at least 6 characters.'
  }
  if (msg.includes('too many') || msg.includes('rate limit')) return 'Too many attempts. Try again later.'
  if (msg.includes('network') || msg.includes('fetch')) return 'Network error. Check your connection.'
  return 'Could not create account. Try again.'
}

export default function SignUp() {
  const { signUp, signOut, session, loading } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session) return <Navigate to="/" replace />

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Please enter your name.')
      return
    }
    if (!phone.trim()) {
      setError('Please enter your phone number.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)
    const { error: signUpError } = await signUp(email, password, {
      name: name.trim(),
      phone: phone.trim(),
    })

    if (signUpError) {
      setSubmitting(false)
      setError(sanitizeSignUpError(signUpError))
      return
    }

    // With email confirmation off, Supabase auto-creates a session. Clear it so
    // the user lands on a clean login page and signs in with their new credentials.
    await signOut()
    setSubmitting(false)
    navigate('/login', { replace: true, state: { signedUp: true } })
  }

  return (
    <AuthFrame>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <h2 className="heading text-2xl">Create account</h2>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-iron">
            Name
          </span>
          <input
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="min-h-tap rounded-lg border border-dust/40 bg-ash px-3 text-chalk placeholder-iron outline-none focus:border-brick-red"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-iron">
            Phone Number
          </span>
          <input
            type="tel"
            autoComplete="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 000 1234"
            className="min-h-tap rounded-lg border border-dust/40 bg-ash px-3 text-chalk placeholder-iron outline-none focus:border-brick-red"
          />
        </label>

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

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-iron">
            Set Password
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

        <label className="flex flex-col gap-1">
          <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-iron">
            Confirm Password
          </span>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
          {submitting ? 'Creating…' : 'Create account'}
        </button>

        <p className="text-center text-sm text-sand">
          Already have an account?{' '}
          <Link to="/login" className="text-brick-red hover:text-ember">
            Sign in
          </Link>
        </p>
      </form>
    </AuthFrame>
  )
}
