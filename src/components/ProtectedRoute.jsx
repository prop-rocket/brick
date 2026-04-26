import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div
          className="h-10 w-10 animate-spin rounded-full border-2 border-dust border-t-brick-red"
          aria-label="Loading"
        />
      </div>
    )
  }

  if (!session) return <Navigate to="/login" replace />

  return children
}
