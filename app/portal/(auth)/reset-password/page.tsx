import { PasswordResetForm } from '@/components/portal/PasswordResetForm'

export default function ResetPasswordPage() {
  return <main id="portal-main" className="portal-auth-page"><div className="portal-auth-frame"><section className="portal-auth-copy"><span className="portal-brand-mark">DS</span><div><h1>Define una contraseña nueva.</h1><p>Usa una frase única de al menos diez caracteres.</p></div><small>DeepSun Studio · Sesión protegida</small></section><section className="portal-auth-panel"><h2>Nueva contraseña</h2><p>La sesión se actualizará al guardar.</p><PasswordResetForm /></section></div></main>
}

