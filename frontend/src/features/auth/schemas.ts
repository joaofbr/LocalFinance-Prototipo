import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Informe seu e-mail.')
    .email('E-mail inválido.'),
  password: z.string().min(4, 'A senha deve ter ao menos 4 caracteres.'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Informe seu nome.'),
    email: z
      .string()
      .min(1, 'Informe seu e-mail.')
      .email('E-mail inválido.'),
    password: z.string().min(4, 'A senha deve ter ao menos 4 caracteres.'),
    confirmPassword: z.string().min(1, 'Confirme sua senha.'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword'],
  })

export const setPasswordSchema = z
  .object({
    password: z.string().min(4, 'A senha deve ter ao menos 4 caracteres.'),
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

export type LoginFormValues = z.infer<typeof loginSchema>
export type RegisterFormValues = z.infer<typeof registerSchema>
export type SetPasswordFormValues = z.infer<typeof setPasswordSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>
