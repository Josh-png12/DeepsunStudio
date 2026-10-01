import { Suspense } from 'react'
import { LoginForm } from '@/components/portal/AuthForms'
import { isSupabaseConfigured } from '@/lib/supabase/env'

export default function LoginPage() {
  const configured = isSupabaseConfigured()
  return (
    <main id="portal-main" className="portal-auth-page">
      <div className="portal-auth-frame">
        <section className="portal-auth-copy">
          <span className="portal-brand-mark">DS</span>
          <div><h1>Información contractual, sin ruido.</h1><p>Consulta movimientos confirmados, participaciones, pagos y soportes de los acuerdos donde eres miembro.</p></div>
          <small>Acceso privado · DeepSun Studio</small>
        </section>
        <section className="portal-auth-panel">
          <h2>Ingresar</h2><p>Usa la cuenta que fue creada o invitada por administración.</p>
          {!configured ? <p className="portal-form-message" data-tone="error">Configura las variables públicas de Supabase para habilitar el ingreso.</p> : <Suspense fallback={<p>Cargando acceso…</p>}><LoginForm /></Suspense>}
        </section>
      </div>
    </main>
  )
}

