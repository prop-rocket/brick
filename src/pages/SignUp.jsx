import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import AuthFrame from '../components/AuthFrame.jsx'

export default function SignUp() {
  const { signUp, session, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  if (!loading && session) return <Navigate to="/" replace />

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setSubmitting(true)
    const { data, error: signUpError } = await signUp(email, password)
    setSubmitting(false)
    if (signUpError) {
      setError(signUpError.message)
      return
    }
    if (data.session) {
      navigate('/', { replace: true })
    } else {
      setInfo('Check your email to confirm your account, then sign in.')
    }
  }

  return (
    <AuthFrame>
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <h2 className="heading text-2xl">Create account</h2>

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
        {info && (
          <p className="rounded-md border border-ember/40 bg-ember/10 px-3 py-2 text-sm text-ember">
            {info}
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
