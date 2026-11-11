import { useState } from 'react'
import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { QueryError } from '@/components/ui/QueryError'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/components/ui/ToastProvider'
import { useAuth } from '@/features/auth/useAuth'
import { getApiErrorMessage } from '@/lib/apiError'
import { formatDate, formatDaysAgo, plural } from '@/lib/format'
import { useAccountAction, usePlatformAccounts, usePlatformOverview } from '../hooks'
import type { Account, AccountAction } from '../types'

const SUCCESS_MESSAGE: Record<AccountAction, (name: string) => string> = {
  approve: (name) => `Acesso de ${name} liberado`,
  reject: (name) => `Cadastro de ${name} recusado`,
  suspend: (name) => `Conta de ${name} suspensa`,
  reactivate: (name) => `Conta de ${name} reativada`,
}

const AVATAR_COLOR = '#3987e5'

export function ConsolePage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const overviewQuery = usePlatformOverview()
  const accountsQuery = usePlatformAccounts()
  const action = useAccountAction()
  const [confirming, setConfirming] = useState<{
    account: Account
    action: 'reject' | 'suspend'
  } | null>(null)

  if (!user?.developer) return <Navigate to="/" replace />

  const accounts = accountsQuery.data ?? []
  const pending = accounts.filter((a) => a.status === 'pending')
  const others = accounts.filter((a) => a.status !== 'pending')
  const overview = overviewQuery.data

  const run = (account: Account, kind: AccountAction) =>
    action.mutate(
      { account, action: kind },
      {
        onSuccess: (result) => {
          setConfirming(null)
          const message = SUCCESS_MESSAGE[kind](account.ownerName.split(' ')[0])
          if (result?.emailSent === false) {
            showToast(
              `${message}, mas o e-mail para ${account.ownerEmail} não saiu. Avise a pessoa por outro meio.`,
              'warning',
            )
            return
          }
          showToast(message)
        },
        onError: (error) => {
          setConfirming(null)
          showToast(getApiErrorMessage(error, 'Não foi possível concluir a ação'), 'warning')
        },
      },
    )

  const busyId = action.isPending ? action.variables?.account.id : undefined

  return (
    <div>
      <p className="mb-4 text-[13.5px] text-text-2">
        Visão do sistema inteiro. Aqui aparecem só dados de conta, nunca lançamentos.
      </p>

      {overviewQuery.isError ? (
        <Card className="mb-5">
          <QueryError onRetry={() => void overviewQuery.refetch()} />
        </Card>
      ) : (
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Metric
            label="Aguardando aprovação"
            value={overview?.pendingAccounts}
            highlight
            className="col-span-2 sm:col-span-1"
          />
          <Metric label="Contas ativas" value={overview?.activeAccounts} />
          <Metric label="Plano família" value={overview?.familyAccounts} />
          <Metric label="Usuários ativos" value={overview?.users} />
          <Metric label="Novas em 30 dias" value={overview?.signupsLast30Days} />
        </div>
      )}

      {accountsQuery.isError ? (
        <Card>
          <QueryError onRetry={() => void accountsQuery.refetch()} />
        </Card>
      ) : (
        <>
          <Section
            title="Aguardando aprovação"
            count={accountsQuery.isLoading ? undefined : pending.length}
          >
            {accountsQuery.isLoading ? (
              <ListSkeleton rows={2} />
            ) : pending.length === 0 ? (
              <Empty>Nenhum cadastro aguardando aprovação.</Empty>
            ) : (
              pending.map((account) => (
                <AccountRow
                  key={account.id}
                  account={account}
                  meta={`Cadastrou-se ${formatDaysAgo(account.createdAt)}`}
                >
                  <button
                    type="button"
                    disabled={busyId === account.id}
                    onClick={() => setConfirming({ account, action: 'reject' })}
                    className="rounded-[10px] border border-border-strong px-3 py-2 text-[12.5px] font-semibold text-text-2 hover:bg-surface-2 disabled:opacity-60"
                  >
                    Recusar
                  </button>
                  <button
                    type="button"
                    disabled={busyId === account.id}
                    onClick={() => run(account, 'approve')}
                    className="rounded-[10px] bg-primary px-3.5 py-2 text-[12.5px] font-bold text-primary-fg hover:opacity-95 disabled:opacity-60"
                  >
                    {busyId === account.id && action.variables?.action === 'approve'
                      ? 'Aprovando...'
                      : 'Aprovar'}
                  </button>
                </AccountRow>
              ))
            )}
          </Section>

          <Section
            title="Contas"
            count={accountsQuery.isLoading ? undefined : others.length}
          >
            {accountsQuery.isLoading ? (
              <ListSkeleton rows={4} />
            ) : others.length === 0 ? (
              <Empty>Nenhuma conta liberada ainda.</Empty>
            ) : (
              others.map((account) => {
                const own = account.ownerEmail === user.email
                const suspended = account.status === 'suspended'
                return (
                  <AccountRow
                    key={account.id}
                    account={account}
                    muted={suspended}
                    badge={suspended ? 'Suspensa' : own ? 'Sua conta' : undefined}
                    meta={`${account.plan === 'family' ? 'Família' : 'Individual'} · ${plural(
                      account.memberCount,
                      'integrante',
                      'integrantes',
                    )} · desde ${formatDate(account.createdAt)}`}
                  >
                    {!own && (
                      <button
                        type="button"
                        disabled={busyId === account.id}
                        onClick={() =>
                          suspended
                            ? run(account, 'reactivate')
                            : setConfirming({ account, action: 'suspend' })
                        }
                        className="rounded-[10px] border border-border-strong px-3 py-2 text-[12.5px] font-semibold text-text-2 hover:bg-surface-2 disabled:opacity-60"
                      >
                        {suspended ? 'Reativar' : 'Suspender'}
                      </button>
                    )}
                  </AccountRow>
                )
              })
            )}
          </Section>
        </>
      )}

      {confirming?.action === 'reject' && (
        <ConfirmDialog
          title="Recusar cadastro"
          message={`O cadastro de ${confirming.account.ownerName} (${confirming.account.ownerEmail}) será apagado, e a pessoa recebe um e-mail avisando que o acesso não foi liberado.`}
          confirmLabel="Recusar"
          destructive
          busy={action.isPending}
          onConfirm={() => run(confirming.account, 'reject')}
          onCancel={() => setConfirming(null)}
        />
      )}

      {confirming?.action === 'suspend' && (
        <ConfirmDialog
          title="Suspender conta"
          message={`${confirming.account.ownerName} e os integrantes da conta perdem o acesso na hora. Os dados ficam guardados e dá para reativar depois.`}
          confirmLabel="Suspender"
          destructive
          busy={action.isPending}
          onConfirm={() => run(confirming.account, 'suspend')}
          onCancel={() => setConfirming(null)}
        />
      )}
    </div>
  )
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-2xl border border-border bg-surface shadow-card ${className}`}
    >
      {children}
    </div>
  )
}

function Metric({
  label,
  value,
  highlight = false,
  className = '',
}: {
  label: string
  value: number | undefined
  highlight?: boolean
  className?: string
}) {
  const active = highlight && (value ?? 0) > 0
  return (
    <div
      className={`rounded-2xl border bg-surface px-4 py-3.5 shadow-card ${
        active ? 'border-primary' : 'border-border'
      } ${className}`}
    >
      <div className="truncate text-[12.5px] font-semibold text-text-2">{label}</div>
      <div
        className={`mt-1 text-[24px] font-extrabold tracking-tight ${
          active ? 'text-primary' : 'text-text'
        }`}
      >
        {value ?? '–'}
      </div>
    </div>
  )
}

function Section({
  title,
  count,
  children,
}: {
  title: string
  count: number | undefined
  children: ReactNode
}) {
  return (
    <section className="mb-5">
      <div className="mb-2.5 flex items-baseline gap-2">
        <h2 className="text-[15px] font-bold">{title}</h2>
        {count !== undefined && (
          <span className="text-[13px] font-semibold tabular-nums text-text-3">{count}</span>
        )}
      </div>
      <Card>{children}</Card>
    </section>
  )
}

function AccountRow({
  account,
  meta,
  badge,
  muted = false,
  children,
}: {
  account: Account
  meta: string
  badge?: string
  muted?: boolean
  children: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-3 border-b border-border px-4 py-3.5 last:border-b-0">
      <div className="flex min-w-0 flex-1 basis-[240px] items-center gap-3">
        <Avatar name={account.ownerName} color={AVATAR_COLOR} size={40} muted={muted} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[14.5px] font-semibold">{account.ownerName}</span>
            {badge && (
              <span className="flex-shrink-0 rounded-full bg-neutral-bg px-2 py-[2px] text-[11px] font-semibold text-neutral">
                {badge}
              </span>
            )}
          </div>
          <div className="truncate text-[12.5px] text-text-3">{account.ownerEmail}</div>
          <div className="truncate text-[12px] text-text-3">{meta}</div>
        </div>
      </div>
      <div className="ml-auto flex flex-shrink-0 items-center gap-2">{children}</div>
    </div>
  )
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="px-4 py-8 text-center text-[13.5px] text-text-2">{children}</p>
}

function ListSkeleton({ rows }: { rows: number }) {
  return (
    <div className="flex flex-col gap-3 p-4">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} height={52} />
      ))}
    </div>
  )
}
