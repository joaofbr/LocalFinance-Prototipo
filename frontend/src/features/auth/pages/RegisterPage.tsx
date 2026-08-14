import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { FormAlert } from '@/components/ui/FormAlert'
import { getApiErrorMessage } from '@/lib/apiError'
import { useAuth } from '../useAuth'
import { registerSchema } from '../schemas'
import type { RegisterFormValues } from '../schemas'
import { AuthLayout } from '../components/AuthLayout'

export function RegisterPage() {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [submitError, setSubmitError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError('')
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      })
      navigate('/', { replace: true })
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, 'Não foi possível criar a conta.'),
      )
    }
  })

  return (
    <AuthLayout
      title="Criar sua conta"
      subtitle="Comece a organizar as finanças da família."
      footer={
        <>
          Já tem uma conta?{' '}
          <Link to="/login" className="font-semibold text-primary no-underline">
            Entrar
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate>
        {submitError && <FormAlert message={submitError} />}

        <TextField
          label="Nome"
          autoComplete="name"
          leadingIcon="user"
          placeholder="Seu nome"
          error={errors.name?.message}
          {...register('name')}
        />

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
          loadingLabel="Criando conta..."
        >
          Criar conta
        </Button>
      </form>
    </AuthLayout>
  )
}
