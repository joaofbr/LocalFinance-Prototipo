import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { FormAlert } from '@/components/ui/FormAlert'
import { FullScreenLoader } from '@/components/ui/FullScreenLoader'
import { useToast } from '@/components/ui/ToastProvider'
import { getApiErrorMessage } from '@/lib/apiError'
import { useAuth } from '../useAuth'
import { setPasswordSchema } from '../schemas'
import type { SetPasswordFormValues } from '../schemas'
import { AuthLayout } from '../components/AuthLayout'
import type { InviteTarget } from '../types'

export function SetPasswordPage() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { status, user, login, logout } = useAuth()

  const goToLogin = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const [target, setTarget] = useState<InviteTarget | null>(null)
  const [checking, setChecking] = useState(Boolean(token))
  const [inviteError, setInviteError] = useState(
    token ? '' : 'Link de convite inválido. Verifique o endereço do e-mail.',
  )
  const [submitError, setSubmitError] = useState('')

  const {
    register,
    handleSubmit,
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
          setInviteError(
            getApiErrorMessage(error, 'Este convite não é mais válido.'),
          )
        }
      } finally {
        if (!cancelled) setChecking(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token])

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError('')
    try {
      await authApi.setPassword(token, values.password)
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, 'Não foi possível definir a senha.'),
      )
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

  if (checking) {
    return <FullScreenLoader />
  }

  if (inviteError) {
    return (
      <AuthLayout
        title="Convite indisponível"
        subtitle="Este link não pode mais ser usado."
        footer={
          <button
            type="button"
            onClick={goToLogin}
            className="font-semibold text-primary no-underline"
          >
            Ir para o login
          </button>
        }
      >
        <FormAlert message={inviteError} />
        <p className="text-[13.5px] text-text-2">
          Peça ao administrador da família para reenviar o convite pela tela de
          Integrantes.
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Definir sua senha"
      subtitle={`Olá, ${target?.name ?? ''}! Escolha a senha de acesso da sua conta.`}
      footer={
        <>
          Já definiu sua senha?{' '}
          <button
            type="button"
            onClick={goToLogin}
            className="font-semibold text-primary no-underline"
          >
            Entrar
          </button>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        {submitError && <FormAlert message={submitError} />}

        {status === 'authenticated' && user?.email !== target?.email && (
          <p className="mb-4 rounded-xl bg-surface-2 px-3.5 py-3 text-[13px] text-text-2">
            Este aparelho está conectado como <strong>{user?.email}</strong>. Ao
            definir a senha, essa sessão será encerrada e você entrará como{' '}
            <strong>{target?.email}</strong>.
          </p>
        )}

        <TextField
          label="E-mail"
          value={target?.email ?? ''}
          leadingIcon="mail"
          readOnly
        />

        <TextField
          label="Senha"
          autoComplete="new-password"
          leadingIcon="lock"
          passwordToggle
          placeholder="Crie uma senha"
          error={errors.password?.message}
          {...register('password')}
        />

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
          fullWidth
          loading={isSubmitting}
          loadingLabel="Salvando..."
        >
          Definir senha e acessar
        </Button>
      </form>
    </AuthLayout>
  )
}
