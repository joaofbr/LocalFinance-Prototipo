import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { FormAlert } from '@/components/ui/FormAlert'
import { getApiErrorMessage } from '@/lib/apiError'
import { useAuth } from '../useAuth'
import { loginSchema } from '../schemas'
import type { LoginFormValues } from '../schemas'
import { AuthLayout } from '../components/AuthLayout'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError('')
    try {
      await login(values)
      navigate('/', { replace: true })
    } catch (error) {
      setSubmitError(getApiErrorMessage(error, 'E-mail ou senha inválidos.'))
    }
  })

  return (
    <AuthLayout
      title="Entrar na sua conta"
      subtitle="Acesse o painel financeiro da família."
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
        {submitError && <FormAlert message={submitError} />}

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
          <a
            href="#"
            className="text-[13px] font-semibold text-primary no-underline"
          >
            Esqueci minha senha
          </a>
        </div>

        <Button
          type="submit"
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
