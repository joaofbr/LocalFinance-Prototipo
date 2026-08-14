import { useState } from 'react'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
import { Skeleton } from '@/components/ui/Skeleton'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/components/ui/ToastProvider'
import { getApiErrorMessage } from '@/lib/apiError'
import { useAuth } from '@/features/auth/useAuth'
import type { Member, MemberInput } from '@/features/finance/types'
import {
  useCreateMember,
  useDeleteMember,
  useMembers,
  useResendMemberInvite,
  useSetMemberActive,
  useUpdateMember,
} from '@/features/finance/hooks'
import { MemberFormModal } from '../components/MemberFormModal'

export function MembersPage() {
  const { showToast } = useToast()
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

  const handleSubmit = (input: MemberInput) => {
    if (modal?.editing) {
      updateMutation.mutate(
        { id: modal.editing.id, input },
        {
          onSuccess: () => {
            setModal(null)
            showToast('Integrante atualizado')
          },
        },
      )
    } else {
      createMutation.mutate(input, {
        onSuccess: (member) => {
          setModal(null)
          showToast(`${member.name} cadastrado — convite enviado por e-mail`)
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
      },
    )
  }

  const handleResend = (member: Member) => {
    resendMutation.mutate(member.id, {
      onSuccess: () => showToast(`Convite reenviado para ${member.email}`),
      onError: () =>
        showToast('Não foi possível reenviar o convite', 'neutral'),
    })
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
          'neutral',
        )
      },
    })
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-[18px] font-extrabold tracking-tight">
              Integrantes
            </h2>
            <span className="flex items-center gap-1 rounded-full bg-primary-weak px-2 py-[3px] text-[11px] font-semibold text-primary">
              <Icon name="shield" size={12} />
              Somente Admin
            </span>
          </div>
          <p className="mt-[3px] text-[13.5px] text-text-2">
            Gerencie quem tem acesso ao painel da família.
          </p>
        </div>
        <Button
          type="button"
          className="flex-shrink-0"
          onClick={() => setModal({ editing: null })}
        >
          <Icon name="plus" size={18} />
          Cadastrar
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        {membersQuery.isLoading ? (
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
              canDelete={member.id !== user?.id}
              resending={
                resendMutation.isPending &&
                resendMutation.variables === member.id
              }
            />
          ))
        )}
      </div>

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
  canDelete: boolean
  resending: boolean
}

function MemberRow({
  member,
  onEdit,
  onToggle,
  onResend,
  onDelete,
  canDelete,
  resending,
}: MemberRowProps) {
  return (
    <div className="flex items-center gap-3.5 border-b border-border px-4 py-3.5 last:border-b-0">
      <Avatar
        name={member.name}
        color={member.color}
        size={46}
        muted={!member.active}
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14.5px] font-semibold">
          {member.name}
        </div>
        <div className="truncate text-[12.5px] text-text-3">{member.email}</div>
      </div>
      <span
        className={`hidden rounded-full px-2 py-[3px] text-[11px] font-semibold sm:inline-flex ${
          member.role === 'Admin'
            ? 'bg-primary-weak text-primary'
            : 'bg-neutral-bg text-neutral'
        }`}
      >
        {member.role === 'Admin' ? 'Admin' : 'Membro'}
      </span>
      {member.passwordPending && (
        <span
          className="hidden rounded-full bg-expense-bg px-2 py-[3px] text-[11px] font-semibold text-expense sm:inline-flex"
          title="Ainda não definiu a senha pelo e-mail de convite"
        >
          Convite pendente
        </span>
      )}
      <span
        className={`rounded-full px-2 py-[3px] text-[11px] font-semibold ${
          member.active ? 'bg-income-bg text-income' : 'bg-neutral-bg text-text-3'
        }`}
      >
        {member.active ? 'Ativo' : 'Inativo'}
      </span>
      {member.passwordPending && member.active && (
        <button
          type="button"
          onClick={onResend}
          disabled={resending}
          title="Reenviar convite por e-mail"
          className="whitespace-nowrap rounded-[10px] border border-border-strong px-[13px] py-2 text-[12.5px] font-semibold text-text-2 hover:bg-surface-2 disabled:opacity-60"
        >
          {resending ? 'Enviando...' : 'Reenviar convite'}
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
      <button
        type="button"
        onClick={onToggle}
        className="whitespace-nowrap rounded-[10px] border border-border-strong px-[13px] py-2 text-[12.5px] font-semibold text-text-2 hover:bg-surface-2"
      >
        {member.active ? 'Desativar' : 'Reativar'}
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
  )
}
