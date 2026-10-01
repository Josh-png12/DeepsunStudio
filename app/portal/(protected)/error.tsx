'use client'

export default function PortalError({ reset }: { error: Error; reset: () => void }) {
  return <section className="portal-empty" role="alert"><span className="portal-empty-mark"/><h1>No pudimos cargar esta sección</h1><p>La sesión sigue protegida. Vuelve a intentarlo; si el problema continúa, contacta al administrador.</p><button className="portal-button portal-button-secondary" type="button" onClick={reset}>Intentar de nuevo</button></section>
}

