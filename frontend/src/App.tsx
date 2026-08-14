import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/features/auth/pages/LoginPage'
import { RegisterPage } from '@/features/auth/pages/RegisterPage'
import { SetPasswordPage } from '@/features/auth/pages/SetPasswordPage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { PublicOnlyRoute } from '@/routes/PublicOnlyRoute'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage'
import { TransactionsPage } from '@/features/transactions/pages/TransactionsPage'
import { CategoriesPage } from '@/features/categories/pages/CategoriesPage'
import { MembersPage } from '@/features/members/pages/MembersPage'
import { ReportsPage } from '@/features/reports/pages/ReportsPage'
import { ProfilePage } from '@/features/profile/pages/ProfilePage'

export default function App() {
  return (
    <Routes>
      <Route path="/definir-senha" element={<SetPasswordPage />} />

      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/members" element={<MembersPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
