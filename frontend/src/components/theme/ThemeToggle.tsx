import { Icon } from '@/components/ui/Icon'
import { useTheme } from './ThemeProvider'

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  return (
    <button
      type="button"
      onClick={toggleTheme}
      title="Alternar tema"
      aria-label="Alternar tema"
      className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-border bg-surface text-text-2"
    >
      <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={19} />
    </button>
  )
}
