import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { authApi } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { FormAlert } from '@/components/ui/FormAlert'
import { Icon } from '@/components/ui/Icon'
import { getApiErrorMessage } from '@/lib/apiError'
import { tokenStorage } from '@/lib/tokenStorage'
import { changePasswordSchema } from '@/features/auth/schemas'
import type { ChangePasswordFormValues } from '@/features/auth/schemas'
import { useState } from 'react'

interface ChangePasswordModalProps {
  onClose: () => void
  onSuccess: () => void
}

export function ChangePasswordModal({
  onClose,
  onSuccess,
}: ChangePasswordModalProps) {
  const [submitError, setSubmitError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError('')
    try {
      const session = await authApi.changePassword(
        values.currentPassword,
        values.newPassword,
      )
      await tokenStorage.set(session.token, session.refreshToken)
      onSuccess()
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, 'Não foi possível trocar a senha.'),
      )
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--overlay)] p-[18px]">
      <div className="w-full max-w-[420px] rounded-[20px] border border-border bg-surface p-[22px] shadow-card-lg">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-[17px] font-extrabold tracking-tight">
              Trocar senha
            </h2>
            <p className="mt-[3px] text-[13px] text-text-2">
              Você segue conectado aqui. As sessões nos outros aparelhos serão
              encerradas.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-text-3 hover:bg-surface-2"
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        <form onSubmit={onSubmit} noValidate>
          {submitError && <FormAlert message={submitError} />}

          <TextField
            label="Senha atual"
            autoComplete="current-password"
            leadingIcon="lock"
            passwordToggle
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />

          <TextField
            label="Nova senha"
            autoComplete="new-password"
            leadingIcon="lock"
            passwordToggle
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />

          <TextField
            label="Confirmar nova senha"
            autoComplete="new-password"
            leadingIcon="lock"
            passwordToggle
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          <Button
            type="submit"
            fullWidth
            loading={isSubmitting}
            loadingLabel="Salvando..."
          >
            Salvar nova senha
          </Button>
        </form>
      </div>
    </div>
  )
}
