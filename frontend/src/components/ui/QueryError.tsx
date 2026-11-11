import { Button } from './Button'
import { Icon } from './Icon'

interface QueryErrorProps {
  onRetry: () => void
  message?: string
}

export function QueryError({
  onRetry,
  message = 'Não foi possível carregar os dados.',
}: QueryErrorProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-expense-bg text-expense">
        <Icon name="alert" size={22} />
      </span>
      <p className="max-w-[280px] text-[14px] text-text-2">{message}</p>
      <Button type="button" variant="secondary" onClick={onRetry}>
        Tentar de novo
      </Button>
    </div>
  )
}
