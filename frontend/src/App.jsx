import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/ProtectedRoute'

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

const PageLoader = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
    <CircularProgress sx={{ color: '#a855f7' }} />
  </Box>
)

const App = () => (
  <Layout>
    <Suspense fallback={<PageLoader />}>
      <Routes>
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
    </Suspense>
  </Layout>
)

export default App
