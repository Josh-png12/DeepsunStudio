# Staging alojado (Supabase gratuito + Vercel Preview)

Objetivo: un entorno **independiente** de producción (`svbvkgvtjksvjfvigiah`) para repetir, con datos y cuentas ficticias, las pruebas que el stack local no puede cubrir: **cabecera de IP real (antispam)**, **Auth alojado** (registro público, límites, SMTP) y el **sitio desplegado** en un Preview de Vercel.

Todos los scripts de `scripts/staging/` y `docs/qa/e2e-staging.js` **rechazan** el proyecto de producción, exigen `*_CONFIRM=<ref>` y solo escriben datos sintéticos (`@example.test`).

## 0. Costo

- Plan **Free** de Supabase: sin costo; límite de **2 proyectos activos por organización**, el proyecto se **pausa tras ~1 semana sin actividad** y no incluye copias de seguridad (irrelevante para staging). Si su organización ya tiene 2 proyectos activos, **no cree un tercero en plan de pago**: pause o borre el que no use (nunca producción) o avíseme.
- Vercel **Hobby**: los Preview no tienen costo. Si el proyecto de Vercel está en un plan de pago de equipo, los Preview ya están incluidos en ese plan.
- Compruebe el cupo en Supabase → *Organization* → *Projects* (verá cuántos proyectos activos hay) y el plan en *Billing*. Si la pantalla de creación muestra un precio por mes distinto de **$0**, cancele.

## 1. Crear el proyecto de staging (Dashboard)

1. https://supabase.com/dashboard → la **organización de DeepSun** (la que contiene `svbvkgvtjksvjfvigiah`) → *New project*. Compruebe que el plan mostrado es **Free / $0**.
2. Nombre: `deepsun-staging`. Región: la misma que producción. Contraseña de base de datos: nueva y aleatoria (guárdela en su gestor de contraseñas; no la comparta ni la reutilice de producción).
3. En *Project Settings → API*: anote el **Project URL** (`https://<ref>.supabase.co`), la **publishable key** y la **service_role key**. Cada una es **distinta** de la de producción; compruebe que `<ref>` ≠ `svbvkgvtjksvjfvigiah`.
4. *Authentication → Sign In / Providers*: deje **desactivado** "Allow new users to sign up" **después** de sembrar los usuarios (el sembrado usa la API de administración y funciona igual con el registro cerrado; así staging replica producción).
5. *Authentication → URL Configuration*: *Site URL* = la URL del Preview de Vercel (§3) y como *Redirect URL* `https://<su-preview>.vercel.app/portal/auth/callback`.

> Mi conexión actual **no puede** crear el proyecto: el MCP de Supabase conectado a esta sesión es el de **producción en solo lectura** (sin herramienta de creación) y el CLI de esta máquina está autenticado con **otra cuenta** (otra organización, un solo proyecto ajeno a DeepSun). No lo usé ni lo modifiqué. No cambié ningún permiso del MCP de producción.

## 2. Migraciones y datos ficticios

Opción A — CLI (recomendada), desde una carpeta de trabajo fuera del repositorio con las migraciones copiadas:

```bash
npx supabase login                       # con su cuenta de DeepSun
npx supabase link --project-ref <REF_DE_STAGING>     # compruebe que NO es svbvkgvtjksvjfvigiah
npx supabase db push                     # aplica 202609290001 … 202609300004 y 202611030001, 002, 003, en ese orden
```

Opción B — SQL Editor: pegue en orden `202609290001`, `…0002`, `…300003`, `…300004`, `202611030001`, `202611030002`, `202611030003` (un archivo por ejecución).

Datos ficticios:

```bash
HOSTED_URL=https://<REF_DE_STAGING>.supabase.co HOSTED_CONFIRM=<REF_DE_STAGING> HOSTED_SERVICE_ROLE_KEY=<service_role de STAGING> \
  node scripts/staging/seed-hosted.mjs C:/ruta/FUERA/del/repo/staging-out
# pegue staging-out/seed-hosted.sql en el SQL Editor de STAGING (promueve al administrador y crea 2 acuerdos y 3 proyectos)
```

## 3. Preview de Vercel con variables propias de staging

1. Plantilla: `docs/env-preview.example.txt`. En Vercel → *Settings → Environment Variables*, cree cada variable marcando **solo "Preview"** (desmarque Production y Development). Valores de **staging**; nada de producción.
2. Verifique en la lista que **Production** conserva sus valores y que ninguna variable de Preview apunta a `svbvkgvtjksvjfvigiah`.
3. Despliegue un **Preview** (no producción) desde la rama de trabajo sin hacer merge a `main`: `vercel` (sin `--prod`) desde el repositorio enlazado, o abra un Pull Request/rama y deje que Vercel genere el Preview. Active *Deployment Protection* (Vercel Authentication) para que el Preview no sea público ni indexable.
4. Copie la URL `https://<su-preview>.vercel.app` y póngala en `NEXT_PUBLIC_SITE_URL` (Preview) y en la URL de Auth del §1.5; redespliegue el Preview.

## 4. Ejecutar las suites contra staging

```bash
export STAGING_SUPABASE_URL=https://<REF_DE_STAGING>.supabase.co STAGING_CONFIRM=<REF_DE_STAGING> STAGING_ANON_KEY=<publishable de STAGING> STAGING_SEED_JSON=C:/ruta/staging-out/seed.json
node scripts/staging/verify-portal.mjs                       # Auth, RLS, RPC, ledger y Storage con firma y descarga reales (esperado 52/52)
STAGING_ADMIN_EMAIL=admin@example.test STAGING_INVESTOR_EMAIL=inva@example.test \
STAGING_ADMIN_PASSWORD=<password de seed.json> STAGING_INVESTOR_PASSWORD=<password de seed.json> node scripts/staging/verify.mjs   # formularios, CHECK, buckets (esperado 23/23)
# Navegador real contra el Preview (si Deployment Protection está activo, desactívelo solo para esta prueba o use un bypass token de Vercel):
NODE_PATH=<carpeta con playwright-core> APP_URL=https://<su-preview>.vercel.app STAGING_API=https://<REF_DE_STAGING>.supabase.co STAGING_CONFIRM=<REF_DE_STAGING> \
STAGING_ANON_KEY=<publishable> STAGING_SERVICE_KEY=<service_role de STAGING> STAGING_SEED_JSON=C:/ruta/staging-out/seed.json node docs/qa/e2e-staging.js    # esperado 28/28
```

### Antispam con la cabecera de IP real (lo que el local no prueba)

1. `verify.mjs` reporta `INFO rotating X-Forwarded-For …` y hace pasar la comprobación del límite con `cf-connecting-ip` (mecanismo). Eso **no** demuestra que Cloudflare entrega esa cabecera: compruébelo así, **solo en staging**: envíe 6 solicitudes distintas en una hora **sin** enviar cabeceras propias (desde el navegador del Preview) y revise, en el SQL Editor de staging, `select count(*) from public.intake_client_log` (cuenta, no datos personales): si sube, la IP llega y el 6.º envío debe responder `DS002`.
2. Si queda en 0: la cabecera real no es `cf-connecting-ip`. Anote cuál llega (revise una petición en *Logs → API Gateway* de staging) y ajuste `update public.intake_settings set value='<cabecera>' where key='trusted_ip_header'`. **No** active `xff_from_right` sin haber verificado cuántos proxies hay delante.
3. Resultado a registrar en `docs/LANZAMIENTO.md` §7 (bloqueante 2).

## 5. Qué NO hacer

- No apunte ningún Preview, script ni cuenta de prueba al proyecto de producción; no copie claves de producción a Preview.
- No suba `seed.json` ni claves al repositorio (los scripts se niegan a escribir dentro de la carpeta del repo).
- No use datos reales de clientes en staging. Al terminar, pause o borre el proyecto de staging (Free) si no se usará.
