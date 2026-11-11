import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { QueryError } from '@/components/ui/QueryError'
import { Skeleton } from '@/components/ui/Skeleton'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/ToastProvider'
import { getApiErrorMessage } from '@/lib/apiError'
import { useAuth } from '@/features/auth/useAuth'
import type { Member, MemberInput } from '@/features/finance/types'
import {
  useCreateMember,
  useDeleteMember,
  useHousehold,
  useMembers,
  useResendMemberInvite,
  useSetMemberActive,
  useUpdateMember,
} from '@/features/finance/hooks'
import { useChangePlan } from '@/features/household/useChangePlan'
import { MemberFormModal } from '../components/MemberFormModal'

export function MembersPage() {
  const { showToast } = useToast()
  const householdQuery = useHousehold()
  const changePlan = useChangePlan()
  const [confirmingIndividual, setConfirmingIndividual] = useState(false)
  const membersQuery = useMembers()
  const createMutation = useCreateMember()
  const updateMutation = useUpdateMember()
  const setActiveMutation = useSetMemberActive()
  const resendMutation = useResendMemberInvite()
  const deleteMutation = useDeleteMember()
  const { user } = useAuth()

  const [modal, setModal] = useState<{ editing: Member | null } | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState<Member | null>(null)

  const members = membersQuery.data ?? []
  const saving = createMutation.isPending || updateMutation.isPending
  const isAdmin = user?.role !== 'Member'

  const showError = (fallback: string) => (error: unknown) =>
    showToast(getApiErrorMessage(error, fallback), 'warning')

  const handleSubmit = (input: MemberInput) => {
    if (modal?.editing) {
      updateMutation.mutate(
        { id: modal.editing.id, input },
        {
          onSuccess: () => {
            setModal(null)
            showToast('Integrante atualizado')
          },
          onError: showError('Não foi possível atualizar o integrante'),
        },
      )
    } else {
      createMutation.mutate(input, {
        onError: showError('Não foi possível cadastrar o integrante'),
        onSuccess: (member) => {
          setModal(null)
          if (member.inviteSent === false) {
            showToast(
              `${member.name} foi cadastrado, mas o convite não pôde ser enviado. Use "Reenviar convite" para tentar de novo.`,
              'warning',
            )
          } else {
            showToast(`${member.name} cadastrado, convite enviado por e-mail`)
          }
        },
      })
    }
  }

  const handleToggle = (member: Member) => {
    setActiveMutation.mutate(
      { id: member.id, active: !member.active },
      {
        onSuccess: () =>
          showToast(
            member.active ? 'Integrante desativado' : 'Integrante reativado',
            'neutral',
          ),
        onError: showError('Não foi possível alterar o integrante'),
      },
    )
  }

  const handleResend = (member: Member) => {
    resendMutation.mutate(member.id, {
      onSuccess: () => showToast(`Convite reenviado para ${member.email}`),
      onError: () =>
        showToast(
          `Não foi possível reenviar o convite para ${member.email}. O e-mail não saiu.`,
          'warning',
        ),
    })
  }

  const otherActiveMembers = members.filter(
    (m) => m.active && m.id !== user?.id,
  ).length

  const switchToIndividual = () =>
    changePlan.mutate('individual', {
      onError: () => setConfirmingIndividual(false),
    })

  if (householdQuery.data?.plan === 'individual') {
    return <Navigate to="/modo-familia" replace />
  }

  const handleDelete = () => {
    const target = confirmingDelete
    if (!target) return
    deleteMutation.mutate(target.id, {
      onSuccess: () => {
        setConfirmingDelete(null)
        showToast(`${target.name} foi excluído`, 'neutral')
      },
      onError: (error) => {
        setConfirmingDelete(null)
        showToast(
          getApiErrorMessage(error, 'Não foi possível excluir o integrante'),
          'warning',
        )
      },
    })
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[13.5px] text-text-2">
          {isAdmin
            ? 'Quem tem acesso ao seu painel.'
            : 'Quem tem acesso ao painel. Só um administrador pode fazer alterações.'}
        </p>
        {isAdmin && (
          <Button
            type="button"
            className="flex-shrink-0"
            onClick={() => setModal({ editing: null })}
          >
            <Icon name="plus" size={18} />
            Cadastrar
          </Button>
        )}
      </div>

      {isAdmin && !membersQuery.isLoading && members.length === 1 && (
        <div className="mb-3.5 flex items-start gap-3 rounded-2xl border border-border bg-primary-weak p-4">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-surface text-primary">
            <Icon name="users" size={18} />
          </span>
          <p className="text-[13.5px] leading-relaxed text-text-2">
            <strong className="text-text">Modo família ativado.</strong>{' '}
            Cadastre quem divide as contas com você: a pessoa recebe um convite
            por e-mail para criar a senha e passa a ver os mesmos lançamentos.
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        {membersQuery.isError ? (
          <QueryError onRetry={() => void membersQuery.refetch()} />
        ) : membersQuery.isLoading ? (
          <div className="flex flex-col gap-3 p-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} height={56} />
            ))}
          </div>
        ) : (
          members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              onEdit={() => setModal({ editing: member })}
              onToggle={() => handleToggle(member)}
              onResend={() => handleResend(member)}
              onDelete={() => setConfirmingDelete(member)}
              canManage={isAdmin}
              canToggle={isAdmin && member.id !== user?.id}
              canDelete={isAdmin && member.id !== user?.id}
              resending={
                resendMutation.isPending &&
                resendMutation.variables === member.id
              }
            />
          ))
        )}
      </div>

      {isAdmin && !membersQuery.isLoading && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-surface p-4 shadow-card">
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-semibold">
              Voltar ao modo individual
            </div>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-text-3">
              {otherActiveMembers > 0
                ? 'Desative os outros integrantes antes de voltar.'
                : 'Só você continua com acesso. O histórico dos outros integrantes é mantido.'}
            </p>
          </div>
          <button
            type="button"
            disabled={otherActiveMembers > 0}
            onClick={() => setConfirmingIndividual(true)}
            className="whitespace-nowrap rounded-[10px] border border-border-strong px-[13px] py-2 text-[12.5px] font-semibold text-text-2 hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Voltar ao individual
          </button>
        </div>
      )}

      {confirmingIndividual && (
        <ConfirmDialog
          title="Voltar ao modo individual"
          message="A tela de Integrantes deixa de aparecer e não será possível cadastrar outras pessoas. Seus lançamentos e categorias continuam como estão."
          confirmLabel="Voltar ao individual"
          busy={changePlan.isPending}
          onConfirm={switchToIndividual}
          onCancel={() => setConfirmingIndividual(false)}
        />
      )}

      {confirmingDelete && (
        <ConfirmDialog
          title="Excluir integrante"
          message={`${confirmingDelete.name} perderá o acesso e será removido definitivamente. Integrantes com lançamentos não podem ser excluídos — nesse caso use "Desativar".`}
          confirmLabel="Excluir"
          destructive
          busy={deleteMutation.isPending}
          onConfirm={handleDelete}
          onCancel={() => setConfirmingDelete(null)}
        />
      )}

      {modal && (
        <MemberFormModal
          editing={modal.editing}
          lockRole={modal.editing?.id === user?.id}
          saving={saving}
          onClose={() => setModal(null)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  )
}

interface MemberRowProps {
  member: Member
  onEdit: () => void
  onToggle: () => void
  onResend: () => void
  onDelete: () => void
  canManage: boolean
  canToggle: boolean
  canDelete: boolean
  resending: boolean
}

function MemberRow({
  member,
  onEdit,
  onToggle,
  onResend,
  onDelete,
  canManage,
  canToggle,
  canDelete,
  resending,
}: MemberRowProps) {
  const pending = member.passwordPending && member.active
  return (
    <div className="flex flex-wrap items-center gap-x-3.5 gap-y-3 border-b border-border px-4 py-3.5 last:border-b-0">
      <div className="flex min-w-0 flex-1 basis-[220px] items-center gap-3.5">
        <Avatar
          name={member.name}
          color={member.color}
          size={44}
          muted={!member.active}
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[14.5px] font-semibold">
              {member.name}
            </span>
            {pending && (
              <span
                className="flex-shrink-0 rounded-full bg-neutral-bg px-2 py-[2px] text-[11px] font-semibold text-neutral"
                title="Ainda não definiu a senha pelo e-mail de convite"
              >
                Convite pendente
              </span>
            )}
            {!member.active && (
              <span className="flex-shrink-0 rounded-full bg-neutral-bg px-2 py-[2px] text-[11px] font-semibold text-text-3">
                Inativo
              </span>
            )}
          </div>
          <div className="truncate text-[12.5px] text-text-3">
            {member.role === 'Admin' ? 'Administrador' : 'Membro'} · {member.email}
          </div>
        </div>
      </div>

      {canManage && (
        <div className="ml-auto flex flex-shrink-0 items-center gap-2">
          {pending && (
            <button
              type="button"
              onClick={onResend}
              disabled={resending}
              title="Reenviar convite por e-mail"
              className="whitespace-nowrap rounded-[10px] border border-border-strong px-3 py-2 text-[12.5px] font-semibold text-text-2 hover:bg-surface-2 disabled:opacity-60"
            >
              {resending ? 'Enviando...' : 'Reenviar convite'}
            </button>
          )}
          {canToggle && (
            <button
              type="button"
              onClick={onToggle}
              className="whitespace-nowrap rounded-[10px] border border-border-strong px-3 py-2 text-[12.5px] font-semibold text-text-2 hover:bg-surface-2"
            >
              {member.active ? 'Desativar' : 'Reativar'}
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            title="Editar"
            aria-label={`Editar ${member.name}`}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] border border-border text-text-2 hover:bg-surface-2"
          >
            <Icon name="pencil" size={16} />
          </button>
          {canDelete && (
            <button
              type="button"
              onClick={onDelete}
              title="Excluir integrante"
              aria-label={`Excluir ${member.name}`}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] border border-border text-text-3 hover:border-expense hover:bg-expense-bg hover:text-expense"
            >
              <Icon name="trash" size={16} />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
