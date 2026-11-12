export interface Card {
  id: string
  name: string
  closingDay: number
  dueDay: number
  ownerId: string | null
  active: boolean
}

export interface CardInput {
  name: string
  closingDay: number
  dueDay: number
  ownerId: string | null
}
