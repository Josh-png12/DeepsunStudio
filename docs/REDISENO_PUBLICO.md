# Rediseño editorial de la web pública (DeepSun Studio)

Rama: `redesign/deepsun-editorial` (desde `origin/main` 7633042). No fusionada ni desplegada.

## Arquitectura
- `app/(site)/` agrupa todas las rutas públicas (URLs sin cambios). Su layout carga `ds-base.css` + `ds-pages.css`, todo bajo `.ds`, y las 4 tipografías con `next/font`. `/portal/**` no importa estos estilos.
- `app/layout.tsx` conserva metadatos, JSON-LD, Analytics y `globals.css`/`tokens.css` (los usa el portal). Se movieron a `(site)` el idioma, el botón de WhatsApp y la navegación.
- `ds-base.css`: transcripción del CSS del prototipo `deepsun_propuesta_integral.html`, con selectores prefijados por `.ds`. **El original está versionado en `design-reference/deepsun_propuesta_integral.html`; el CSS transcrito es idéntico al suyo (salvo la regla `.preview-banner`).**
- Textos ES/EN: `lib/site-content.ts` (+ `lib/site-i18n.tsx`). Preferencia en `localStorage`, `html lang` actualizado en cliente.
- Contacto centralizado en `lib/site.ts`. WhatsApp oficial confirmado: **+57 324 618 3318** (`573246183318`); es la única fuente y cualquier otro valor de `NEXT_PUBLIC_WHATSAPP_NUMBER` se ignora. `tests/site-contact.test.ts` impide números hardcodeados.
- Formularios reales: `lib/leads.ts` (insert en `leads`, éxito solo tras confirmar), `ReviewForm` (buckets + `testimonials` con `approved:false`). Antispam: honeypot, tiempo mínimo y espera entre envíos.

## Decisiones
- Eliminadas la sección de habilidades/stack y las tarjetas de stack en casos. `data/*` conserva el stack solo internamente.
- Blog: artículos solo en español; en modo EN se avisa. Sin `hreflang`.
- Cifras 10+/6+/3+ y precios: reutilizados del sitio previo, marcados «por verificar». Tasas COP/EUR: valores previos, marcados como referencia aproximada.

## Pendiente de confirmar
Valores no nulos exigidos por la tabla `leads` (el formulario rápido de portada envía `business_type:'otro'`, `needs:['asesoria']`, `budget:'no_se'`, `timeline:'explorando'`); fuente de tasas de cambio; cifras públicas; JSON-LD aún lista tecnologías y el teléfono 573197149647; fuentes Fontshare del root siguen cargando por el portal.
