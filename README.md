# DeepSun Studio

Sitio público y portal privado de seguimiento contractual construidos con Next.js 16, App Router, TypeScript estricto, Tailwind CSS, Supabase y Vercel.

## Desarrollo local

```bash
npm install
copy .env.local.example .env.local
npm run dev
```

Configura en `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (preferida) o, temporalmente, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- credenciales públicas de EmailJS para el formulario público
- `SUPABASE_SERVICE_ROLE_KEY` solo si se invitarán usuarios desde el panel administrativo

La service role es privada, nunca usa el prefijo `NEXT_PUBLIC` y solo se importa desde código marcado `server-only`.

## Comandos de calidad

| Comando | Función |
| --- | --- |
| `npm run dev` | Servidor local |
| `npm run typecheck` | TypeScript sin emitir archivos |
| `npm run lint` | ESLint compatible con Next.js 16 |
| `npm test` | Pruebas de finanzas y autorización |
| `npm run check` | Typecheck, lint y tests |
| `npm run build` | Build de producción |

## Arquitectura del portal

- `app/portal/(auth)`: ingreso, recuperación y cambio de contraseña.
- `app/portal/(protected)`: páginas privadas; el layout valida la sesión en servidor.
- `app/portal/(protected)/admin`: segundo límite de autorización para administradores.
- `lib/supabase/client.ts`: cliente de navegador.
- `lib/supabase/server.ts`: cliente SSR basado en cookies.
- `lib/supabase/admin.ts`: cliente de service role exclusivamente server-side.
- `lib/portal`: autorización, consultas, acciones, validación, seguimiento de proyectos y cálculos reutilizables.
- `supabase/migrations`: esquema, RLS, Storage, auditoría y motor financiero.

`proxy.ts` actualiza la sesión y redirige accesos anónimos. No es la única defensa: cada página administrativa valida el rol en servidor y PostgreSQL aplica RLS sobre cada tabla y objeto privado.

## Preparar Supabase

Con Supabase CLI:

```bash
npx supabase login
npx supabase link --project-ref svbvkgvtjksvjfvigiah
npx supabase db push
```

Si no usas CLI, ejecuta en SQL Editor, en este orden:

1. `supabase/migrations/202609290001_portal_core.sql`
2. `supabase/migrations/202609290002_rls_storage_audit.sql`
3. `supabase/migrations/202609300003_project_tracking.sql`
4. `supabase/migrations/202609300004_project_tracking_rls.sql`

Las migraciones crean el bucket privado `agreement-documents`. No conviertas ese bucket en público.

Las migraciones `003` y `004` son aditivas: incorporan avances históricos, hitos, bloqueos, visibilidad selectiva, `last_seen_at`, notificaciones y políticas RLS sin reescribir el ledger existente. Los proyectos heredados con movimientos confirmados se clasifican como contratados; los demás estados heredados se traducen a oportunidad o propuesta.

Para revisar localmente antes de aplicar cambios remotos:

```bash
npm run check
npm run build
npx supabase migration list
```

Cuando decidas aplicar las nuevas migraciones al proyecto ya enlazado, revisa primero el diff y luego ejecuta tú mismo:

```bash
npx supabase migration list
npx supabase db push --dry-run
npx supabase db push
```

## Usuarios y seed inicial

1. Crea o invita en Supabase Auth la cuenta de Joshua y la de Dereck.
2. Abre `supabase/seed.sql`.
3. Sustituye los dos correos marcados `REEMPLAZAR_...`; no sustituyas UUID manualmente.
4. Ejecuta el archivo completo.

El trigger de Auth crea `profiles` y `user_preferences`. El seed asigna a Joshua el rol de plataforma `admin`, crea el acuerdo inicial y vincula a ambos usuarios mediante `agreement_members`. No inventa ni solicita el documento de Dereck.

## Reglas financieras

- Solo movimientos `confirmed` intervienen en cálculos.
- Un movimiento confirmado es inmutable. Las correcciones se representan con ajustes o reversos y motivo.
- `calculate_project_participation` reconstruye ingresos, costos, devoluciones, contracargos y ajustes dentro de PostgreSQL.
- El resultado se limita por `contractual_cap`; ese límite no constituye rentabilidad garantizada.
- Los documentos se entregan mediante signed URLs de 60 segundos.
- Las herramientas personales usan RLS `auth.uid() = user_id` y no comparten datos con el acuerdo.

## Producción

Replica las variables en Vercel, aplica migraciones al proyecto Supabase dedicado y configura en Auth las URL permitidas para:

- `https://www.deepsunstudio.com/portal/auth/callback`
- `http://localhost:3000/portal/auth/callback` durante desarrollo

Las rutas `/portal` llevan `noindex`, están excluidas por `robots.ts` y no forman parte del sitemap público.
