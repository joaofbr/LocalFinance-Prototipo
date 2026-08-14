import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { authApi } from '@/api/auth'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { FormAlert } from '@/components/ui/FormAlert'
import { Icon } from '@/components/ui/Icon'
import { getApiErrorMessage } from '@/lib/apiError'
import { forgotPasswordSchema } from '../schemas'
import type { ForgotPasswordFormValues } from '../schemas'
import { AuthLayout } from '../components/AuthLayout'

export function ForgotPasswordPage() {
  const [submitError, setSubmitError] = useState('')
  const [sentTo, setSentTo] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError('')
    try {
      await authApi.forgotPassword(values.email)
      setSentTo(values.email)
    } catch (error) {
      setSubmitError(
        getApiErrorMessage(error, 'Não foi possível enviar o e-mail agora.'),
      )
    }
  })

  if (sentTo) {
    return (
      <AuthLayout
        title="Verifique seu e-mail"
        subtitle="Se houver uma conta com esse endereço, o link está a caminho."
        footer={
          <Link to="/login" className="font-semibold text-primary no-underline">
            Voltar para o login
          </Link>
        }
      >
        <div className="mb-5 flex items-start gap-3 rounded-[14px] border border-border bg-surface-2 p-4">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary-weak text-primary">
            <Icon name="mail" size={18} />
          </span>
          <p className="text-[13.5px] leading-relaxed text-text-2">
            Enviamos as instruções para <strong>{sentTo}</strong>. O link vale
            por 48 horas e só pode ser usado uma vez.
          </p>
        </div>
        <p className="text-[13px] text-text-3">
          Não chegou? Confira a caixa de spam e a aba de promoções antes de
          tentar de novo.
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      title="Esqueci minha senha"
      subtitle="Informe seu e-mail e enviaremos um link para criar uma nova senha."
      footer={
        <>
          Lembrou a senha?{' '}
          <Link to="/login" className="font-semibold text-primary no-underline">
            Entrar
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

        <Button
          type="submit"
          fullWidth
          loading={isSubmitting}
          loadingLabel="Enviando..."
        >
          Enviar link de recuperação
        </Button>
      </form>
    </AuthLayout>
  )
}
