import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import { DemoBanner } from './components/DemoBanner'
import { Onboarding } from './pages/Onboarding'
import { Dashboard } from './pages/Dashboard'
import { SessionSummary } from './pages/SessionSummary'
import { Settings } from './pages/Settings'
import { Trends } from './pages/Trends'

function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const { onboardingComplete } = useApp()
  if (!onboardingComplete) {
    return <Navigate to="/onboarding" replace />
  }
  return <>{children}</>
}

function AppRoutes() {
  const { isDemo, deviceName } = useApp()

  return (
    <>
      {isDemo && <DemoBanner deviceName={deviceName} />}
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
        <Route
          path="/settings"
          element={
            <RequireOnboarding>
              <Settings />
            </RequireOnboarding>
          }
        />
        <Route path="/" element={<RequireOnboarding><Navigate to="/dashboard" replace /></RequireOnboarding>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  )
}
