import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import SignUp from './pages/SignUp.jsx'
import Today from './pages/Today.jsx'
import Habits from './pages/Habits.jsx'
import Gym from './pages/Gym.jsx'
import Body from './pages/Body.jsx'
import Stats from './pages/Stats.jsx'
import WorkoutLog from './pages/WorkoutLog.jsx'
import WorkoutSummary from './pages/WorkoutSummary.jsx'
import PersonalRecords from './pages/PersonalRecords.jsx'
import AppShell from './components/AppShell.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />

      {/* Main app — with bottom nav */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route index element={<Today />} />
        <Route path="habits" element={<Habits />} />
        <Route path="gym" element={<Gym />} />
        <Route path="body" element={<Body />} />
        <Route path="stats" element={<Stats />} />
      </Route>

      {/* Full-screen gym screens — no AppShell, no bottom nav */}
      <Route
        path="/gym/log/:workoutId"
        element={
          <ProtectedRoute>
            <WorkoutLog />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gym/summary/:workoutId"
        element={
          <ProtectedRoute>
            <WorkoutSummary />
          </ProtectedRoute>
        }
      />
      <Route
        path="/gym/prs"
        element={
          <ProtectedRoute>
            <PersonalRecords />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
