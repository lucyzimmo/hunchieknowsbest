import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import { Onboarding } from './pages/Onboarding'
import { Dashboard } from './pages/Dashboard'
import { SessionSummary } from './pages/SessionSummary'
import { Trends } from './pages/Trends'

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const { onboardingComplete } = useApp()
  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/onboarding" element={<Onboarding />} />
      <Route
        path="/dashboard"
        element={
          <RequireOnboarding>
            <Dashboard />
          </RequireOnboarding>
        }
      />
      <Route
        path="/summary"
        element={
          <RequireOnboarding>
            <SessionSummary />
          </RequireOnboarding>
        }
      />
      <Route
        path="/trends"
        element={
          <RequireOnboarding>
            <Trends />
          </RequireOnboarding>
        }
      />
      <Route path="/" element={<Navigate to="/onboarding" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  )
}
