import type { IconName } from '@/components/ui/Icon'
import type { HouseholdPlan } from '@/features/finance/types'

interface NavItem {
  to: string
  label: string
  icon: IconName
  adminOnly?: boolean
  plan?: HouseholdPlan
}

const MEMBERS_ITEM: NavItem = {
  to: '/members',
  label: 'Integrantes',
  icon: 'users',
  plan: 'family',
}

const FAMILY_MODE_ITEM: NavItem = {
  to: '/modo-familia',
  label: 'Modo família',
  icon: 'users',
  adminOnly: true,
  plan: 'individual',
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: 'grid' },
  { to: '/transactions', label: 'Transações', icon: 'list' },
  { to: '/reports', label: 'Relatórios', icon: 'barChart' },
  { to: '/categories', label: 'Categorias', icon: 'tag' },
  MEMBERS_ITEM,
  FAMILY_MODE_ITEM,
  { to: '/profile', label: 'Perfil', icon: 'user' },
]

export const MORE_NAV_ITEMS: NavItem[] = [
  { to: '/categories', label: 'Categorias', icon: 'tag' },
  MEMBERS_ITEM,
  FAMILY_MODE_ITEM,
  { to: '/profile', label: 'Perfil', icon: 'user' },
]

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Início', icon: 'grid' },
  { to: '/transactions', label: 'Transações', icon: 'list' },
  { to: '/reports', label: 'Relatórios', icon: 'barChart' },
  { to: '/mais', label: 'Mais', icon: 'more' },
]

export function visibleNavItems(
  items: NavItem[],
  { isAdmin, plan }: { isAdmin: boolean; plan: HouseholdPlan | undefined },
): NavItem[] {
  return items.filter(
    (item) =>
      (!item.adminOnly || isAdmin) && (!item.plan || item.plan === plan),
  )
}

const TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transações',
  '/reports': 'Relatórios',
  '/categories': 'Categorias',
  '/members': 'Integrantes',
  '/modo-familia': 'Modo família',
  '/profile': 'Perfil',
  '/mais': 'Mais',
}

export function getPageTitle(pathname: string): string {
  return TITLES[pathname] ?? 'LocalFinance'
}
