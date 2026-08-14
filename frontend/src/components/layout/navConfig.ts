import type { IconName } from '@/components/ui/Icon'

interface NavItem {
  to: string
  label: string
  icon: IconName
  adminOnly?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: 'grid' },
  { to: '/transactions', label: 'Transações', icon: 'list' },
  { to: '/reports', label: 'Relatórios', icon: 'barChart' },
  { to: '/categories', label: 'Categorias', icon: 'tag' },
  { to: '/members', label: 'Integrantes', icon: 'users', adminOnly: true },
  { to: '/profile', label: 'Perfil', icon: 'user' },
]

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Início', icon: 'grid' },
  { to: '/transactions', label: 'Transações', icon: 'list' },
  { to: '/reports', label: 'Relatórios', icon: 'barChart' },
  { to: '/profile', label: 'Mais', icon: 'more' },
]

const TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transações',
  '/reports': 'Relatórios',
  '/categories': 'Categorias',
  '/members': 'Integrantes',
  '/profile': 'Perfil',
}

export function getPageTitle(pathname: string): string {
  return TITLES[pathname] ?? 'LocalFinance'
}
