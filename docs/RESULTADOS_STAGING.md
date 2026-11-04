# Resultados de staging alojado — 2026-11-03

Proyecto: `deepsun-staging` (`qvqcnljtckdyykqracol`, us-west-1). Producción (`svbvkgvtjksvjfvigiah`) **no fue tocada**.

## 1. Verificación de la conexión
- `~/.claude.json` → servidor MCP `supabase-staging` = `https://mcp.supabase.com/mcp?project_ref=qvqcnljtckdyykqracol&features=database,docs` (un solo ref, el de staging).
- Antes de empezar: 0 migraciones, 0 tablas (proyecto nuevo y vacío).
- No se leyó `.env.local` ni se usó ninguna credencial de producción.

## 2. Migraciones aplicadas a staging (vía MCP, en orden)
| # | Archivo | Resultado |
|---|---|---|
| 1 | 202609290001_portal_core | OK |
| 2 | 202609290002_rls_storage_audit | OK |
| 3 | 202609300003_project_tracking | OK |
| 4 | 202609300004_project_tracking_rls | OK |
| 5 | 202611030001_public_intake | OK |
| 6 | 202611030002_fix_storage_document_read | OK |
| 7 | 202611030003_harden_privileges | OK |

Estado final: 24 tablas en `public`, 0 sin RLS, 74 políticas, buckets `agreement-documents`, `testimonial-avatars`, `testimonial-results`, `testimonial-videos`.
**Registro de migraciones (corregido solo en staging):** el MCP las registró con marca de tiempo (`20261103…`), lo que habría hecho que `supabase db push` las reaplicara. Se actualizó `supabase_migrations.schema_migrations` de staging para que `version`/`name` coincidan con los archivos (`202609290001 portal_core` … `202611030003 harden_privileges`). Verificado con SELECT: 7 filas, 1:1 con `supabase/migrations/`. Pendiente de confirmar con `supabase migration list` / `db push --dry-run` cuando el CLI esté enlazado a staging.

## 3b. Suites oficiales contra staging alojado — 2026-11-03
**Credenciales:** 8 variables definidas; `HOSTED_URL`, `STAGING_SUPABASE_URL`, `STAGING_API` y los `*_CONFIRM` = `qvqcnljtckdyykqracol`; los JWT de `STAGING_ANON_KEY` (rol `anon`), `HOSTED_SERVICE_ROLE_KEY` y `STAGING_SERVICE_KEY` (rol `service_role`) llevan `ref` = `qvqcnljtckdyykqracol`. Valores nunca impresos; `.env.local` no contiene claves de Supabase y solo se listaron sus nombres.

| Suite | Resultado | Notas |
|---|---|---|
| `seed-hosted.mjs` | OK | 5 usuarios `@example.test`, contraseña aleatoria en `C:\Users\jonat\staging-out\seed.json` (fuera del repo). SQL de siembra aplicado: 1 admin, 2 acuerdos, 3 miembros, 3 proyectos |
| `verify-portal.mjs` | **52/52** | Auth real, registro público cerrado, anon sin acceso/RPC, RLS entre acuerdos, ledger, `calculate_project_participation`, Storage (firma, descarga con bytes correctos, trampa `name=storage_path`, carpetas ajenas) |
| `verify.mjs` | **23/23** (tras corregir el test) | Formularios, CHECK, buckets, moderación (admin aprueba/desaprueba, no edita contenido; inversor sin acceso) |
| `docs/qa/e2e-staging.js` | **28/28** | Navegador real (Edge) contra build local de producción (`next start` en `127.0.0.1:3101`) con variables de staging. **No es un Preview de Vercel.** |

### Error encontrado y corrección (solo código local)
`verify.mjs` fallaba en "más de 5 leads/hora desde la misma dirección → DS002" (22/23). Causa: el test asumía que el cliente podía inyectar `cf-connecting-ip`. En el proyecto alojado **Cloudflare responde 403 a una `cf-connecting-ip` enviada por el cliente** (no se puede falsificar) y **inyecta la IP real**. Prueba directa: sin cabecera → `400 DS002 rate_limited`; con cabecera falsa → `403` HTML de Cloudflare; `intake_client_log` mostró 5 filas con un único hash.
Corrección en `scripts/staging/verify.mjs`: si el borde devuelve 403 al spoof, el test envía 7 leads sin cabecera y exige `DS002`; en local mantiene el comportamiento anterior. Sin cambios en migraciones ni en la base.

### Antispam con IP real: RESULTADO para `docs/LANZAMIENTO.md` §7 (bloqueante 2)
- Dirección real de la conexión del cliente llega a la base por `cf-connecting-ip` (valor por defecto correcto; **no** hace falta cambiar `trusted_ip_header` ni activar `xff_from_right`).
- Los formularios insertan **desde el navegador** (`lib/leads.ts`, cliente Supabase `'use client'`), por lo que la IP que se cuenta es la del visitante y no la de Vercel.
- Límite 5/hora por IP comprobado en el alojado (6.º → `DS002`); email/día, duplicado y testimonios ya comprobados en §3.
- Confirmado con el sitio local; **sigue sin repetirse desde un Preview de Vercel** (no cambia la ruta navegador→Supabase, pero queda por comprobar de punta a punta).

### Efectos secundarios a tener en cuenta
- Cada suite agota la cuota de 5 leads/hora de la IP desde la que se ejecuta. Entre `verify.mjs` y el E2E hubo que vaciar `intake_client_log` en staging (la primera corrida del E2E falló 4/28 por ese motivo; con el contador limpio pasó 28/28).
- Estado final de staging: 0 leads, 0 filas en `intake_client_log`, 3 testimonios ficticios del E2E, 5 usuarios y 2 acuerdos de siembra, 7 migraciones.

### Pendiente real de la lista
- **`supabase migration list` / `db push --dry-run`**: no ejecutado (el CLI no está enlazado a staging y no hay access token/contraseña de BD en esta sesión). El registro está alineado por SQL (§2).
- **Auth alojado**: registro cerrado confirmado por `verify-portal`; sin verificar Site URL/Redirect URL, SMTP ni límites de correo (panel de Supabase).
- **Preview de Vercel**: no existe; E2E contra el Preview y antispam de punta a punta pendientes.

## 3. Pruebas ejecutadas (SQL en staging, usuarios `@example.test`, transacción revertida)
No son las suites oficiales (ver §4): simulan los roles `anon`/`authenticated` con claims JWT dentro de la base.

| Área | Prueba | Resultado |
|---|---|---|
| Auth | trigger crea perfil al insertar en auth.users | OK 3/3 |
| RLS | inversor ve solo proyectos visibles (1 de 2) | OK |
| RLS | inversor no ve notas internas ni audit_logs | OK (0/0) |
| RLS | usuario externo no ve acuerdos ni proyectos | OK (0/0) |
| RLS | inversor no puede escalar su rol ni insertar transacciones | OK bloqueado |
| RLS | admin ve todo (2 proyectos, notas, audit) | OK |
| RLS | `is_platform_admin(<otro uuid>)` desde inversor | devuelve false (sin oráculo) |
| Ledger | ingreso confirmado inmutable; audit_logs no borrable | OK |
| Privilegios | anon no lee agreements/leads/intake_settings ni llama RPC de ayuda | OK bloqueado |
| Formularios | CHECK rechaza email inválido y business_type fuera de lista | OK |
| Formularios | testimonio enviado con `approved=true` queda **sin aprobar** (el trigger lo fuerza a false antes del WITH CHECK) | OK, 0 publicados |
| Formularios | admin lee leads; inversor no; inversor no aprueba testimonios (0 filas) | OK |
| Antispam | 6 leads, misma IP vía `cf-connecting-ip` | 5 aceptados, 6.º `DS002` OK |
| Antispam | 4 leads mismo email/día | 3 aceptados, 4.º `DS002` OK |
| Antispam | duplicado exacto | `DS001` OK |
| Antispam | 4 testimonios misma IP/hora | 3 aceptados, 4.º `DS002` OK |
| Antispam | `intake_client_log` | 8 filas (5+3) OK |
| Antispam | 8 leads con `X-Forwarded-For` rotando y sin `cf-connecting-ip` | 8 aceptados: **sin cabecera de confianza no hay límite por IP** (solo actúan email/día y el tope global) |

Limpieza: tras la prueba staging quedó en 0 usuarios / 0 leads / 0 testimonios / 0 acuerdos.

## 4. NO ejecutado (bloqueado por falta de claves de staging)
- `verify-portal.mjs` (52 comprobaciones: Auth real, RPC, Storage con firma y descarga) — requiere publishable key de staging.
- `verify.mjs` (23: formularios por API, buckets) — requiere publishable key y usuarios sembrados con contraseña.
- `seed-hosted.mjs` — requiere service_role de staging.
- `docs/qa/e2e-staging.js` (28, navegador contra Preview) — requiere Preview de Vercel + claves.
- Antispam con IP **real** (§4 de STAGING_ALOJADO.md): requiere enviar desde el Preview; el mecanismo funciona, pero no se ha demostrado que la cabecera llegue.
- Auth alojado: registro cerrado, límites de correo/SMTP, URL de redirección.
- Storage por API (límites de tamaño/MIME, firma de URLs).

## 5. Pendiente para publicar
1. Ejecutar las 3 suites con las claves de staging (el usuario las exporta como variables de entorno en su terminal).
2. Auth de staging: desactivar registro, configurar Site URL y Redirect URL del Preview.
3. Variables de Vercel solo para "Preview", valores de staging (`docs/env-preview.example.txt`).
4. Desplegar Preview (no `--prod`, sin merge a `main`), con Deployment Protection.
5. Probar el 6.º envío real desde el Preview y comprobar que `intake_client_log` sube; si no, ajustar `trusted_ip_header` (registrar en `docs/LANZAMIENTO.md` §7).
6. Solo entonces: plan de `docs/PUBLICACION_SEGURA.md` para producción.

## 6. Preparación del Preview de Vercel — 2026-11-04
Proyecto Vercel: `joshua-dev` (`prj_vI43upRikxitK0hUiSuFw5NwcS5m`, equipo `josh-png12's projects`), conectado a `Josh-png12/Portafolio`, rama de producción `main`, dominio `www.deepsunstudio.com`.

- **Riesgo encontrado:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY` estaban en «Production, Preview»: un Preview habría usado producción.
- **Corrección (solo configuración de Vercel):** se retiró el alcance Preview de las tres (ahora solo Production; valores no leídos ni modificados). Se crearon, solo en Preview: `NEXT_PUBLIC_SUPABASE_URL` (staging), `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (JWT con `ref` de staging, rol `anon`) y `NEXT_PUBLIC_WHATSAPP_NUMBER=573246183318`. `SUPABASE_SERVICE_ROLE_KEY` no existe en Preview.
- **Previews antiguos:** 0 despliegues de Preview en el proyecto; no hay credenciales de producción retenidas.
- **Deployment Protection:** `ssoProtection = all_except_custom_domains` (Previews con autenticación de Vercel; dominio propio público). Sin contraseña ni allowlist. Para el E2E contra el Preview hará falta un bypass token de automatización.
- **Indexación:** `lib/indexing.js` (solo `VERCEL_ENV=production` es indexable). Fuera de producción: `X-Robots-Tag: noindex, nofollow, noarchive` (next.config.js), `<meta robots noindex>` y `robots.txt` con `Disallow: /`. Producción: `index, follow` y robots con el dominio oficial. Se eliminó `public/robots.txt` (dominio de ejemplo y conflicto con `app/robots.ts`). Comprobado con build + `next start` en ambos modos.
- **service_role:** solo la usa `inviteUserAction` (invitar inversionista, requiere SMTP en staging); código `server-only`, 0 apariciones en `.next/static` y `public`. El E2E, los formularios y el resto del portal no la necesitan.
- `npm run check`: typecheck + lint + 84/84 pruebas unitarias. Build correcto con las variables de Preview.
