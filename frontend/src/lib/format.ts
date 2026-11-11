const MONTHS_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
]

export function formatMoney(value: number): string {
  return (
    'R$ ' +
    Math.abs(value).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  )
}

export function formatSignedMoney(value: number): string {
  return (value < 0 ? '- ' : '') + formatMoney(value)
}

export function formatPeriodLabel(year: number, month: number): string {
  return `${MONTHS_PT[month]} ${year}`
}

export function formatMonthShort(month: number): string {
  return MONTHS_PT[month].slice(0, 3)
}

export function formatDateShort(iso: string): string {
  const [, mm, dd] = iso.split('-')
  return `${dd}/${mm}`
}

function toIsoDate(date: Date): string {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function defaultDateInPeriod(year: number, month: number): string {
  const today = new Date()
  const lastDay = new Date(year, month + 1, 0).getDate()
  return toIsoDate(new Date(year, month, Math.min(today.getDate(), lastDay)))
}

export function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? ''
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function formatCents(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export function parseDigitsToCents(text: string): number {
  const digits = text.replace(/\D/g, '')
  return digits ? parseInt(digits, 10) : 0
}

export function hexToRgba(hex: string, alpha: number): string {
  const value = hex.replace('#', '')
  const r = parseInt(value.substring(0, 2), 16)
  const g = parseInt(value.substring(2, 4), 16)
  const b = parseInt(value.substring(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}
