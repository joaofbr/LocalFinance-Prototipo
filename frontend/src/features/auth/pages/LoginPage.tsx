import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { FormAlert } from '@/components/ui/FormAlert'
import { getApiErrorMessage, getApiErrorStatus } from '@/lib/apiError'
import { useAuth } from '../useAuth'
import { loginSchema } from '../schemas'
import type { LoginFormValues } from '../schemas'
import { AuthLayout } from '../components/AuthLayout'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState<{
    message: string
    tone: 'error' | 'info'
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null)
    try {
      await login(values)
      navigate('/', { replace: true })
    } catch (error) {
      setSubmitError({
        message: getApiErrorMessage(error, 'E-mail ou senha inválidos.'),
        tone: getApiErrorStatus(error) === 403 ? 'info' : 'error',
      })
    }
  })

  return (
    <AuthLayout
      title="Que bom ter você de volta"
      subtitle="Entre para ver como está o seu mês."
      note="O Poupi está em beta fechado. Algumas funções ainda podem mudar."
      footer={
        <>
          Não tem uma conta?{' '}
          <Link
            to="/register"
            className="font-semibold text-primary no-underline"
          >
            Criar conta
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        {submitError && (
          <FormAlert message={submitError.message} tone={submitError.tone} />
        )}

        <TextField
          label="E-mail"
          type="email"
          autoComplete="email"
          leadingIcon="mail"
          placeholder="voce@email.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <TextField
          label="Senha"
          autoComplete="current-password"
          leadingIcon="lock"
          passwordToggle
          placeholder="Sua senha"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="mb-[22px] text-right">
          <Link
            to="/esqueci-senha"
            className="text-[13px] font-semibold text-primary no-underline"
          >
            Esqueci minha senha
          </Link>
        </div>

        <Button
          type="submit"
          variant="strong"
          fullWidth
          loading={isSubmitting}
          loadingLabel="Entrando..."
        >
          Entrar
        </Button>
      </form>
    </AuthLayout>
  )
}
