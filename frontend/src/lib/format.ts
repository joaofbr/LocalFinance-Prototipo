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
