import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Icon } from '@/components/ui/Icon'
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
  const [pendingEmail, setPendingEmail] = useState('')

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
      const { pendingApproval } = await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
      })
      if (pendingApproval) {
        setPendingEmail(values.email.trim())
        return
      }
      navigate('/', { replace: true })
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, 'Não foi possível criar a conta.'),
      )
    }
  })

  if (pendingEmail) {
    return (
      <AuthLayout
        title="Cadastro recebido"
        subtitle="Sua conta foi criada e está em análise."
      >
        <div className="mb-6 flex items-start gap-3 rounded-xl border border-border bg-surface p-4">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] bg-primary-weak text-primary">
            <Icon name="mail" size={18} />
          </span>
          <p className="text-[13.5px] leading-relaxed text-text-2">
            Assim que o acesso for liberado, você recebe um e-mail em{' '}
            <strong className="break-all text-text">{pendingEmail}</strong>. Depois é
            só entrar com o e-mail e a senha que você acabou de criar.
          </p>
        </div>
        <Button type="button" variant="secondary" fullWidth onClick={() => navigate('/login')}>
          Voltar para o login
        </Button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Criar sua conta"
      subtitle="Comece a organizar suas finanças. Se quiser, convide a família depois."
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
        <p className="mb-5 rounded-xl border border-border bg-surface-2 px-3.5 py-3 text-[13px] leading-relaxed text-text-2">
          Estamos liberando o acesso aos poucos. Depois do cadastro, sua conta passa
          por uma aprovação e você recebe um e-mail quando ela estiver liberada.
        </p>

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
          variant="strong"
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
