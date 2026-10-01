import { ForgotPasswordForm } from '@/components/portal/AuthForms'

export default function ForgotPasswordPage() {
  return <main id="portal-main" className="portal-auth-page"><div className="portal-auth-frame"><section className="portal-auth-copy"><span className="portal-brand-mark">DS</span><div><h1>Recupera el acceso.</h1><p>Enviaremos un enlace temporal al correo asociado con tu cuenta.</p></div><small>El enlace solo puede utilizarse una vez.</small></section><section className="portal-auth-panel"><h2>Restablecer contraseña</h2><p>Escribe el correo con el que ingresas al portal.</p><ForgotPasswordForm /></section></div></main>
}

