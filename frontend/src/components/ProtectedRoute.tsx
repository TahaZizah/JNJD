import { Navigate } from 'react-router-dom'

interface Props { children: React.ReactNode }

export default function ProtectedRoute({ children }: Props) {
  const token = localStorage.getItem('admin_token')
  if (!token) return <Navigate to="/admin" replace />
  return <>{children}</>
}
