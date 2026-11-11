import type { ComponentType } from 'react'
import {
  CategoriesPreview,
  FamilyPreview,
  SummaryPreview,
  TrendPreview,
} from './TourPreviews'

interface TourSlide {
  title: string
  text: string
  Preview: ComponentType
}

export const TOUR_SLIDES: TourSlide[] = [
  {
    title: 'O saldo do mês na hora',
    text: 'Receitas, despesas e os últimos lançamentos num só lugar.',
    Preview: SummaryPreview,
  },
  {
    title: 'Para onde vai o dinheiro',
    text: 'Veja quanto cada categoria pesa nos gastos do mês.',
    Preview: CategoriesPreview,
  },
  {
    title: 'Mês a mês',
    text: 'Compare receitas e despesas dos últimos seis meses.',
    Preview: TrendPreview,
  },
  {
    title: 'Contas divididas em família',
    text: 'Divida um lançamento entre integrantes e veja quem gastou o quê.',
    Preview: FamilyPreview,
  },
]
