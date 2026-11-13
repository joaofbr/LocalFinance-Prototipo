import type { IconName } from '@/components/ui/Icon'
import type { HouseholdPlan } from '@/features/finance/types'

interface NavItem {
  to: string
  label: string
  icon: IconName
  adminOnly?: boolean
  developerOnly?: boolean
  plan?: HouseholdPlan
}

const MEMBERS_ITEM: NavItem = {
  to: '/members',
  label: 'Integrantes',
  icon: 'users',
  plan: 'family',
}

export const CONSOLE_PATH = '/console'

export const MORE_PATH = '/mais'

const CONSOLE_ITEM: NavItem = {
  to: CONSOLE_PATH,
  label: 'Console',
  icon: 'shield',
  developerOnly: true,
}

const FAMILY_MODE_ITEM: NavItem = {
  to: '/modo-familia',
  label: 'Modo família',
  icon: 'users',
  adminOnly: true,
  plan: 'individual',
}

const CATEGORIES_ITEM: NavItem = { to: '/categories', label: 'Categorias', icon: 'tag' }

const CARDS_ITEM: NavItem = { to: '/cards', label: 'Cartões', icon: 'creditCard' }

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: 'grid' },
  { to: '/transactions', label: 'Transações', icon: 'list' },
  { to: '/reports', label: 'Relatórios', icon: 'barChart' },
  CATEGORIES_ITEM,
  CARDS_ITEM,
  MEMBERS_ITEM,
  FAMILY_MODE_ITEM,
  { to: '/profile', label: 'Perfil', icon: 'user' },
  CONSOLE_ITEM,
]

export const MORE_NAV_ITEMS: NavItem[] = [
  CATEGORIES_ITEM,
  CARDS_ITEM,
  MEMBERS_ITEM,
  FAMILY_MODE_ITEM,
  { to: '/profile', label: 'Perfil', icon: 'user' },
  CONSOLE_ITEM,
]

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Início', icon: 'grid' },
  { to: '/transactions', label: 'Transações', icon: 'list' },
  { to: '/reports', label: 'Relatórios', icon: 'barChart' },
  { to: MORE_PATH, label: 'Mais', icon: 'more' },
]

export function visibleNavItems(
  items: NavItem[],
  {
    isAdmin,
    isDeveloper,
    plan,
  }: { isAdmin: boolean; isDeveloper: boolean; plan: HouseholdPlan | undefined },
): NavItem[] {
  return items.filter(
    (item) =>
      (!item.adminOnly || isAdmin) &&
      (!item.developerOnly || isDeveloper) &&
      (!item.plan || item.plan === plan),
  )
}

const TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/transactions': 'Transações',
  '/reports': 'Relatórios',
  '/categories': 'Categorias',
  '/cards': 'Cartões',
  '/members': 'Integrantes',
  '/modo-familia': 'Modo família',
  '/console': 'Console',
  '/profile': 'Perfil',
  [MORE_PATH]: 'Mais',
}

export function getPageTitle(pathname: string): string {
  return TITLES[pathname] ?? 'Poupi'
}
