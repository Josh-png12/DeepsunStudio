'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { forgotPasswordAction, loginAction, type AuthState } from '@/lib/portal/actions'

const initialState: AuthState = {}

export function LoginForm() {
  const searchParams = useSearchParams()
  const [state, action, pending] = useActionState(loginAction, initialState)
  return (
    <form action={action} className="portal-auth-form">
      <input type="hidden" name="next" value={searchParams.get('next') ?? '/portal/dashboard'} />
      <label>Correo electrónico<input name="email" type="email" autoComplete="email" required placeholder="nombre@empresa.com" /></label>
      <label>Contraseña<input name="password" type="password" autoComplete="current-password" required /></label>
      {state.error && <p className="portal-form-message" data-tone="error" role="alert">{state.error}</p>}
      <button className="portal-button portal-button-primary" type="submit" disabled={pending}>{pending ? 'Verificando…' : 'Ingresar al portal'}</button>
      <Link href="/portal/forgot-password" className="portal-text-link">Olvidé mi contraseña</Link>
    </form>
  )
}

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(forgotPasswordAction, initialState)
  return (
    <form action={action} className="portal-auth-form">
      <label>Correo electrónico<input name="email" type="email" autoComplete="email" required placeholder="nombre@empresa.com" /></label>
      {state.error && <p className="portal-form-message" data-tone="error" role="alert">{state.error}</p>}
      {state.success && <p className="portal-form-message" data-tone="success" role="status">{state.success}</p>}
      <button className="portal-button portal-button-primary" type="submit" disabled={pending}>{pending ? 'Enviando…' : 'Enviar enlace seguro'}</button>
      <Link href="/portal/login" className="portal-text-link">Volver al ingreso</Link>
    </form>
  )
}

