import { z } from 'zod'
import { PASSWORD_MAX_LENGTH, meetsPasswordPolicy } from './passwordPolicy'

const strongPassword = z
  .string()
  .max(PASSWORD_MAX_LENGTH, `A senha pode ter no máximo ${PASSWORD_MAX_LENGTH} caracteres.`)
  .refine(meetsPasswordPolicy, 'A senha ainda não cumpre os requisitos abaixo.')

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe seu e-mail.')
    .email('E-mail inválido.'),
  password: z.string().min(1, 'Informe sua senha.'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Informe seu nome.'),
    email: z
      .string()
      .min(1, 'Informe seu e-mail.')
      .email('E-mail inválido.'),
    password: strongPassword,
    confirmPassword: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

export const setPasswordSchema = z
  .object({
    password: strongPassword,
    confirmPassword: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe seu e-mail.')
    .email('E-mail inválido.'),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Informe sua senha atual.'),
    newPassword: strongPassword,
    confirmPassword: z.string().min(1, 'Confirme a nova senha.'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: 'A nova senha deve ser diferente da atual.',
    path: ['newPassword'],
  })

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type SetPasswordFormValues = z.infer<typeof setPasswordSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>
