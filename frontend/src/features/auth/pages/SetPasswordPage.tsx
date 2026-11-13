import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Icon } from '@/components/ui/Icon'
import { TextField } from '@/components/ui/TextField'
import { FormAlert } from '@/components/ui/FormAlert'
import { FullScreenLoader } from '@/components/ui/FullScreenLoader'
import { useToast } from '@/components/ui/ToastProvider'
import { getApiErrorMessage } from '@/lib/apiError'
import { useAuth } from '../useAuth'
import { setPasswordSchema } from '../schemas'
import type { SetPasswordFormValues } from '../schemas'
import { AuthLayout } from '../components/AuthLayout'
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter'
import type { InviteTarget } from '../types'

function inviterLabel(target: InviteTarget): string {
  return target.invitedByName
    ? `${target.invitedByName} (${target.invitedByEmail})`
    : 'Um administrador'
}

export function SetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { status, user, login, logout } = useAuth()

  const goTo = (path: string) => {
    logout()
    navigate(path, { replace: true })
  }

  const [target, setTarget] = useState<InviteTarget | null>(null)
  const [checking, setChecking] = useState(Boolean(token))
  const [inviteError, setInviteError] = useState(
    token ? '' : 'Link inválido. Verifique o endereço do e-mail.',
  )
  const [submitError, setSubmitError] = useState('')
  const [confirmingDecline, setConfirmingDecline] = useState(false)
  const [declining, setDeclining] = useState(false)
  const [declined, setDeclined] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  useEffect(() => {
    if (!token) return
    let cancelled = false
    void (async () => {
      try {
        const found = await authApi.validateInvite(token)
        if (!cancelled) setTarget(found)
      } catch (error) {
        if (!cancelled) {
          setInviteError(getApiErrorMessage(error, 'Este link não é mais válido.'))
        }
      } finally {
        if (!cancelled) setChecking(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  const passwordValue = useWatch({ control, name: 'password' })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError('')
    try {
      await authApi.setPassword(token, values.password)
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'Não foi possível definir a senha.'))
      return
    }

    logout()

    const email = target?.email
    if (!email) {
      showToast('Senha definida! Faça login para entrar.')
      navigate('/login', { replace: true })
      return
    }

    try {
      await login({ email, password: values.password })
      showToast(`Bem-vindo, ${target?.name ?? ''}!`)
      navigate('/', { replace: true })
    } catch {
      showToast('Senha definida! Faça login para entrar.')
      navigate('/login', { replace: true })
    }
  })

  const decline = async () => {
    setDeclining(true)
    try {
      await authApi.declineInvite(token)
      setConfirmingDecline(false)
      setDeclined(true)
    } catch (error) {
      setConfirmingDecline(false)
      setSubmitError(getApiErrorMessage(error, 'Não foi possível recusar o convite.'))
    } finally {
      setDeclining(false)
    }
  }

  if (checking) {
    return <FullScreenLoader />
  }

  if (declined) {
    return (
      <AuthLayout
        title="Convite recusado"
        subtitle="Você não entrou na família de quem te convidou."
      >
        <p className="mb-6 text-[13.5px] leading-relaxed text-text-2">
          O convite foi cancelado e o e-mail <strong className="text-text">{target?.email}</strong>{' '}
          ficou livre. Se quiser usar o Poupi com a sua própria conta, é só criar
          um cadastro.
        </p>
        <Button type="button" variant="strong" fullWidth onClick={() => goTo('/register')}>
          Criar minha conta
        </Button>
      </AuthLayout>
    )
  }

  if (inviteError || !target) {
    return (
      <AuthLayout
        title="Link indisponível"
        subtitle="Este link não pode mais ser usado."
        footer={
          <button
            type="button"
            onClick={() => goTo('/login')}
            className="font-semibold text-primary no-underline"
          >
            Ir para o login
          </button>
        }
      >
        <FormAlert message={inviteError || 'Este link não é mais válido.'} />
        <p className="text-[13.5px] text-text-2">
          Se era um convite, peça a quem te convidou para reenviar pela tela de
          Integrantes. Se era para trocar a senha, peça um novo link em "Esqueci minha
          senha".
        </p>
      </AuthLayout>
    )
  }

  const invite = target.isInvite

  return (
    <AuthLayout
      title={invite ? 'Aceitar convite' : 'Redefinir senha'}
      subtitle={
        invite
          ? `Olá, ${target.name}! Defina uma senha para entrar.`
          : `Olá, ${target.name}! Escolha uma nova senha para a sua conta.`
      }
      footer={
        invite ? (
          <>
            Não conhece quem te convidou?{' '}
            <button
              type="button"
              onClick={() => setConfirmingDecline(true)}
              className="font-semibold text-expense no-underline"
            >
              Recusar convite
            </button>
          </>
        ) : undefined
      }
    >
      {invite && (
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-border bg-surface-2 px-3.5 py-3">
          <span className="mt-0.5 flex-shrink-0 text-text-2">
            <Icon name="users" size={18} />
          </span>
          <p className="text-[13px] leading-relaxed text-text-2">
            <strong className="text-text">{inviterLabel(target)}</strong> convidou você
            para o controle financeiro da família. Ao aceitar, vocês passam a ver e
            registrar os mesmos lançamentos.
          </p>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate>
        {submitError && <FormAlert message={submitError} />}

        {status === 'authenticated' && user?.email !== target.email && (
          <p className="mb-4 rounded-xl bg-surface-2 px-3.5 py-3 text-[13px] text-text-2">
            Este aparelho está conectado como <strong>{user?.email}</strong>. Ao
            continuar, essa sessão será encerrada e você entrará como{' '}
            <strong>{target.email}</strong>.
          </p>
        )}

        <TextField label="E-mail" value={target.email} leadingIcon="mail" readOnly />

        <TextField
          label={invite ? 'Senha' : 'Nova senha'}
          autoComplete="new-password"
          leadingIcon="lock"
          passwordToggle
          placeholder="Crie uma senha"
          error={errors.password?.message}
          {...register('password')}
        />
        <PasswordStrengthMeter value={passwordValue} />

        <TextField
          label="Confirmar senha"
          autoComplete="new-password"
          leadingIcon="lock"
          passwordToggle
          placeholder="Repita a senha"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <Button
          type="submit"
          variant="strong"
          fullWidth
          loading={isSubmitting}
          loadingLabel="Salvando..."
        >
          {invite ? 'Aceitar convite e entrar' : 'Salvar nova senha'}
        </Button>
      </form>

      {confirmingDecline && (
        <ConfirmDialog
          title="Recusar convite"
          message={`Você não vai entrar na família de ${target.invitedByName ?? 'quem te convidou'}. O convite é cancelado e este e-mail fica livre para você criar sua própria conta.`}
          confirmLabel="Recusar convite"
          destructive
          busy={declining}
          onConfirm={() => void decline()}
          onCancel={() => setConfirmingDecline(false)}
        />
      )}
    </AuthLayout>
  )
}
