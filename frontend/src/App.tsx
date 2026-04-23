import { Routes, Route, Navigate } from 'react-router-dom'
import Landing from './pages/Landing'
import ConfirmationPage from './pages/ConfirmationPage'
import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboard from './pages/AdminDashboard'
import SponsoringPage from './pages/SponsoringPage'
import ProtectedRoute from './components/ProtectedRoute'
import PublicLayout from './ui/PublicLayout'

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Landing />} />
        <Route path="/sponsoring" element={<SponsoringPage />} />
      </Route>
      <Route path="/confirmation/:id" element={<ConfirmationPage />} />
      <Route path="/admin" element={<AdminLoginPage />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
