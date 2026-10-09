import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { PageLoader } from './components/ui'

const HomePage         = lazy(() => import('./pages/HomePage'))
const LoginPage        = lazy(() => import('./pages/LoginPage'))
const RegisterPage     = lazy(() => import('./pages/RegisterPage'))
const ClubsPage        = lazy(() => import('./pages/ClubsPage'))
const ClubDetailPage   = lazy(() => import('./pages/ClubDetailPage'))
const ComputerDetailPage = lazy(() => import('./pages/ComputerDetailPage'))
const BookingsPage     = lazy(() => import('./pages/BookingsPage'))
const ProfilePage      = lazy(() => import('./pages/ProfilePage'))
const AdminPage        = lazy(() => import('./pages/AdminPage'))
const NotFoundPage     = lazy(() => import('./pages/NotFoundPage'))

const App = () => {
  const location = useLocation()

  return (
    <Layout>
      <Suspense fallback={<PageLoader minHeight="60vh" />}>
        {/* keyed wrapper → short fade between pages */}
        <div key={location.pathname} className="cr-page">
          <Routes location={location}>
            <Route path="/"              element={<HomePage />} />
            <Route path="/login"         element={<LoginPage />} />
            <Route path="/register"      element={<RegisterPage />} />
            <Route path="/clubs"         element={<ClubsPage />} />
            <Route path="/clubs/:id"     element={<ClubDetailPage />} />
            <Route path="/computers/:id" element={<ComputerDetailPage />} />
            <Route path="/bookings"      element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
            <Route path="/profile"       element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/admin"         element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
            <Route path="*"              element={<NotFoundPage />} />
          </Routes>
        </div>
      </Suspense>
    </Layout>
  )
}

export default App
