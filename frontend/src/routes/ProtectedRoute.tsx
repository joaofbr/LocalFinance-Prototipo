import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { FullScreenLoader } from '@/components/ui/FullScreenLoader'

export function ProtectedRoute() {
  const { status } = useAuth()

  if (status === 'initializing') return <FullScreenLoader />
  if (status === 'unauthenticated') return <Navigate to="/login" replace />
  return <Outlet />
}
