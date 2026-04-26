import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AuthFrame from '../components/AuthFrame.jsx'

export default function Login() {
  const { signIn, session, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session) return <Navigate to="/" replace />

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    const { error: signInError } = await signIn(email, password)
    setSubmitting(false)
    if (signInError) {
      setError(signInError.message)
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <AuthFrame>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <h2 className="heading text-2xl">Sign in</h2>

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
            Password
          </span>
          <input
            type="password"
            autoComplete="current-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="text-center text-sm text-sand">
          New here?{' '}
          <Link to="/signup" className="text-brick-red hover:text-ember">
            Create an account
          </Link>
        </p>
      </form>
    </AuthFrame>
  )
}
