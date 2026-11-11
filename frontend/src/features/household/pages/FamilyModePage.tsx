import { Navigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { useAuth } from '@/features/auth/useAuth'
import { useHousehold } from '@/features/finance/hooks'
import { useChangePlan } from '../useChangePlan'

const BENEFITS = [
  'Convide pessoas por e-mail, cada uma com o próprio login',
  'Divida um lançamento entre integrantes, com o valor repartido automaticamente',
  'Filtre por integrante e veja o relatório de quem gastou o quê',
]

export function FamilyModePage() {
  const { user } = useAuth()
  const householdQuery = useHousehold()
  const changePlan = useChangePlan()

  if (user?.role === 'Member') return <Navigate to="/" replace />
  if (householdQuery.data?.plan === 'family') {
    return <Navigate to="/members" replace />
  }

  return (
    <div className="max-w-[560px]">
      <div className="rounded-[20px] border border-border bg-surface p-6 shadow-card">
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-weak text-primary">
          <Icon name="users" size={24} />
        </span>
        <h2 className="text-[19px] font-extrabold tracking-tight">
          Use em família
        </h2>
        <p className="mt-1.5 text-[14px] leading-relaxed text-text-2">
          Hoje sua conta é individual: só você registra e vê os lançamentos. No
          modo família, quem divide as contas com você entra no mesmo painel.
        </p>

        <ul className="my-5 flex flex-col gap-3">
          {BENEFITS.map((benefit) => (
            <li
              key={benefit}
              className="flex items-start gap-2.5 text-[14px] leading-snug"
            >
              <span className="mt-[1px] flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-income-bg text-income">
                <Icon name="check" size={13} />
              </span>
              {benefit}
            </li>
          ))}
        </ul>

        <Button
          type="button"
          fullWidth
          disabled={householdQuery.isLoading}
          loading={changePlan.isPending}
          loadingLabel="Ativando..."
          onClick={() => changePlan.mutate('family')}
        >
          Ativar modo família
        </Button>
        <p className="mt-3 text-center text-[12px] leading-relaxed text-text-3">
          Seus lançamentos e categorias continuam como estão, e dá para voltar
          ao modo individual depois.
        </p>
      </div>
    </div>
  )
}
