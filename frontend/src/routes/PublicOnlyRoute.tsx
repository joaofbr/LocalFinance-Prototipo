import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { FullScreenLoader } from '@/components/ui/FullScreenLoader'

export function PublicOnlyRoute() {
  const { status } = useAuth()

  if (status === 'initializing') return <FullScreenLoader />
  if (status === 'authenticated') return <Navigate to="/" replace />
  return <Outlet />
}
