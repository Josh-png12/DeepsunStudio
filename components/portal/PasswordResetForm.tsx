'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function PasswordResetForm() {
  const router = useRouter()
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setMessage('')
    const data = new FormData(event.currentTarget)
    const password = String(data.get('password') ?? '')
    const confirmation = String(data.get('confirmation') ?? '')
    if (password.length < 10 || password !== confirmation) {
      setMessage('Usa al menos 10 caracteres y confirma exactamente la misma contraseña.')
      setPending(false)
      return
    }
    const { error } = await createClient().auth.updateUser({ password })
    if (error) {
      setMessage('No pudimos actualizar la contraseña. Solicita un enlace nuevo.')
      setPending(false)
      return
    }
    router.replace('/portal/dashboard')
    router.refresh()
  }

  return (
    <form onSubmit={submit} className="portal-auth-form">
      <label>Nueva contraseña<input name="password" type="password" autoComplete="new-password" minLength={10} required /></label>
      <label>Confirmar contraseña<input name="confirmation" type="password" autoComplete="new-password" minLength={10} required /></label>
      {message && <p className="portal-form-message" data-tone="error" role="alert">{message}</p>}
      <button className="portal-button portal-button-primary" type="submit" disabled={pending}>{pending ? 'Actualizando…' : 'Guardar contraseña'}</button>
    </form>
  )
}

