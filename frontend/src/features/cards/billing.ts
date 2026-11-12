import { formatPeriodLabel } from '@/lib/format'
import type { SeriesKind } from '@/features/finance/types'
import type { Card } from './types'

export interface Month {
  year: number
  month: number
}

type BillingRule = Pick<Card, 'closingDay' | 'dueDay'>

function daysIn({ year, month }: Month): number {
  return new Date(year, month + 1, 0).getDate()
}

function addMonths({ year, month }: Month, delta: number): Month {
  const date = new Date(year, month + delta, 1)
  return { year: date.getFullYear(), month: date.getMonth() }
}

function dayOf(month: Month, day: number): string {
  const dd = String(Math.min(day, daysIn(month))).padStart(2, '0')
  const mm = String(month.month + 1).padStart(2, '0')
  return `${dd}/${mm}`
}

function parseIso(iso: string): Month & { day: number } {
  const [year, month, day] = iso.split('-').map(Number)
  return { year, month: month - 1, day }
}

export function monthOfIso(iso: string): Month {
  const { year, month } = parseIso(iso)
  return { year, month }
}

export function billMonth(card: BillingRule, purchaseIso: string): Month {
  const { day, ...purchase } = parseIso(purchaseIso)
  return billMonthOf(card, purchase, day)
}

function billMonthOf(card: BillingRule, purchase: Month, day: number): Month {
  const closing =
    day < Math.min(card.closingDay, daysIn(purchase)) ? purchase : addMonths(purchase, 1)
  return card.dueDay > card.closingDay ? closing : addMonths(closing, 1)
}

export function referenceMonth(
  card: BillingRule | null,
  dateIso: string,
  seriesKind: SeriesKind | null,
  seriesIndex: number | null,
): Month {
  if (!card) return monthOfIso(dateIso)
  if (seriesKind === 'installment' && seriesIndex && seriesIndex > 1) {
    const offset = seriesIndex - 1
    const { day, ...month } = parseIso(dateIso)
    const purchase = addMonths(month, -offset)
    const purchaseDay = Math.min(day, daysIn(purchase))
    return addMonths(billMonthOf(card, purchase, purchaseDay), offset)
  }
  return billMonth(card, dateIso)
}

export function billLabel(month: Month): string {
  return formatPeriodLabel(month.year, month.month).toLowerCase()
}

export function billDates(card: BillingRule, reference: Month) {
  const closingMonth =
    card.dueDay > card.closingDay ? reference : addMonths(reference, -1)
  return {
    closing: dayOf(closingMonth, card.closingDay),
    due: dayOf(reference, card.dueDay),
  }
}
