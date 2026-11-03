# Lanzamiento de DeepSun Studio — estado, orden de despliegue y pendientes

Fecha: 2026-11-03 · Rama `redesign/deepsun-editorial` (sin push, sin merge, sin despliegue). Producción **no se modificó**: toda escritura de prueba se hizo en un stack Supabase **local** y desechable.

## Veredicto

**LISTO PARA STAGING ALOJADO. NO LISTO PARA PRODUCCIÓN** (bloqueantes en §7: son decisiones del titular y comprobaciones que solo se pueden hacer con acceso a Vercel y a un proyecto alojado, no fallos de código).

Lo que sí está demostrado: las migraciones `001`–`003`, Auth, RLS, permisos, Storage, formularios, moderación y el portal funcionan juntos sobre Supabase real (local) y los defectos de la auditoría están corregidos y cubiertos por pruebas que antes fallaban.

## 1. Qué se corrigió (Fase 1)

| # | Problema (auditoría de producción) | Corrección | Prueba que lo reproduce y lo cierra |
|---|---|---|---|
| 1 | Lectura de Storage no ligada al objeto (`d.storage_path = d.name`): documentos visibles ilegibles **y**, con un documento cuyo nombre = ruta, lectura de **todo el bucket** por cualquier miembro | `202611030002` reescrita: objeto calificado, carpeta = acuerdo del documento, `investor_visible`, membresía, y proyecto del mismo acuerdo y visible | `hardening-db.test.ts` (antes/después) y `verify-portal.mjs` sobre Storage real |
| 2 | Lectura cruzada entre acuerdos aun conociendo la ruta (incluido un `documents` con `storage_path` ajeno) | Misma política: `d.agreement_id = storage_agreement_id(objeto)` | ídem (fila «trampa» y fila «robo») |
| 3 | Visibilidad del proyecto ignorada en Storage | La política replica la regla de `documents select permitted` | ídem (proyecto oculto) |
| 4 | `anon` ejecuta helpers RPC; oráculo «¿este UUID es admin/miembro?»; `TRUNCATE`/`REFERENCES`/`TRIGGER`/`MAINTAIN` para las roles de la API; `anon` con todo sobre 19 tablas; `project_id` de otro acuerdo aceptado | `202611030003_harden_privileges.sql` + reversa | `hardening-db.test.ts`, `verify-portal.mjs` |
| 5 | SQL de verificación subreportaba (`information_schema` filtra por rol); suposiciones erróneas en los documentos | `intake_state_readonly.sql` (bloques 4–6 reescritos, 11–13 nuevos), `AUDITORIA_PRODUCCION.md`, `SQL_LECTURA_PRODUCCION.md`, `PUBLICACION_SEGURA.md`, `PRUEBAS_STAGING_SUPABASE.md` | `readonly-sql.test.ts` (solo SELECT, sin datos personales, corre en bases «legacy» y migrada) |
| 6 | Reversa de `001` insuficiente (no cubría Storage ni una instalación nueva) | `rollback/202611030001_public_intake_rollback_fresh_install.sql` (se niega si hay filas; elimina políticas de Storage; los buckets se borran por API porque Supabase bloquea el `DELETE` por SQL) | `hardening-db.test.ts`: «rollback of a fresh install» |

## 2. Staging (Fase 2): cómo se verificó y cómo repetirlo

**Qué existe hoy:** no hay proyecto de staging alojado ni acceso a Vercel desde esta máquina (`vercel whoami`: token inválido; el MCP de Supabase conectado es el de **producción**, solo lectura). Por eso el staging se montó **localmente con el CLI de Supabase** (Docker, gratis, sin tocar producción): Postgres 17 + GoTrue + PostgREST + Storage **reales**, en puertos 564xx, con otro `project_id` (`deepsun-staging`). En esta máquina corre además un stack de **otro proyecto** (`sistema_de_asistencia`, puertos 545xx): no se tocó.

```bash
# 1) carpeta de trabajo FUERA del repo, con la configuración incluida en supabase/staging/local-stack.config.toml
mkdir deepsun-staging && cd deepsun-staging && npx supabase init
cp <repo>/supabase/staging/local-stack.config.toml supabase/config.toml && mkdir -p supabase/migrations && cp <repo>/supabase/migrations/*.sql supabase/migrations/
npx supabase start --workdir .          # aplica las 7 migraciones; imprime claves LOCALES de demostración
# 2) datos ficticios (usuarios, 2 acuerdos, 3 proyectos) — rechaza cualquier URL que no sea local
LOCAL_API_URL=http://127.0.0.1:56421 LOCAL_SERVICE_ROLE_KEY=<service_role local> LOCAL_DB_CONTAINER=supabase_db_deepsun-staging node scripts/staging/seed-local.mjs > seed.json
# 3) pruebas de caja negra (Auth + PostgREST + Storage reales)
export STAGING_SUPABASE_URL=http://127.0.0.1:56421 STAGING_CONFIRM=56421 STAGING_ANON_KEY=<publishable local> STAGING_SEED_JSON=seed.json
node scripts/staging/verify-portal.mjs
STAGING_ADMIN_EMAIL=admin@example.test STAGING_INVESTOR_EMAIL=inva@example.test STAGING_ADMIN_PASSWORD='Staging-Local-Only-1!' STAGING_INVESTOR_PASSWORD='Staging-Local-Only-1!' node scripts/staging/verify.mjs
# 4) sitio compilado contra ese stack + navegador real (Edge)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:56421 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable local> SUPABASE_SERVICE_ROLE_KEY=<service_role local> NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3101 npm run build
<mismas variables> npx next start -p 3101   &   NODE_PATH=<carpeta con playwright-core> STAGING_SEED_JSON=seed.json STAGING_SERVICE_KEY=<service_role local> node docs/qa/e2e-staging.js
npx supabase stop --workdir .           # al terminar
```

**Resultados (2026-11-03):**

| Verificación | Resultado |
|---|---|
| `npm run check` (typecheck + lint + pruebas SQL/lógica) | ver §8 |
| 7 migraciones aplicadas por el CLI sobre Supabase real (incluye `INSERT` en `storage.buckets` con los disparadores de Storage actuales) | OK |
| `verify.mjs` — formularios, límites, CHECK, moderación, buckets de reseñas | **23/23** |
| `verify-portal.mjs` — Auth, RLS, RPC cerrado a `anon`, oráculo cerrado, ledger entre acuerdos, 18 comprobaciones de Storage con **firma y descarga reales** | **52/52** |
| Mismo `verify-portal.mjs` con **solo las migraciones que hoy están en producción** (sin `001`–`003`) | **39/52** — fallan 13: `anon` ejecuta los helpers, oráculo abierto, inyección de ledger entre acuerdos y, con la fila «trampa», un inversionista firma/descarga documentos privados y archivos del otro acuerdo y lista carpetas ajenas |
| `e2e-staging.js` — navegador Edge contra el sitio compilado | **28/28** |

Lo que el entorno local **no** puede probar (ver §7): la cabecera de IP real (Cloudflare), la configuración de Auth del proyecto alojado (registro público, límites, SMTP), correo real y cualquier variable del despliegue.

## 3. Sitio público (Fase 3)

- **WhatsApp:** `lib/site.ts` es la única fuente (`573246183318`, «+57 324 618 3318»); una variable de entorno distinta se ignora y se avisa. En el sitio compilado los 3 enlaces `wa.me` de la portada usan ese número y el texto visible coincide (`e2e-staging.js`, y `tests/site-contact.test.ts` rastrea que no queda otro número en el código).
- **Variables de entorno del despliegue — NO verificadas.** `.env.local` (local) no define ninguna variable de Supabase; `.env.local.example` apunta al proyecto de producción `svbvkgvtjksvjfvigiah`. No hay `.vercel/` ni sesión de Vercel, así que **no puedo afirmar qué proyecto usa el sitio desplegado**. Es el primer paso de §5.
- **Flujos recorridos de extremo a extremo (local):** envío rápido y de 5 pasos → fila en `leads` (`source` correcto, `status=new`); administración de solicitudes (estado, notas, quién y cuándo); reseña con imagen → pendiente e invisible → aprobación → visible por la API pública; avatar recuperable desde Storage; subida de documento privado desde el portal (`<acuerdo>/…`) → descarga exacta del inversionista A → 404 para el inversionista B → rutas de administración y `/portal/*` sin sesión redirigidas; contraseña incorrecta rechazada; ES/EN con contenido distinto y `lang` correcto.
- **No recorrido:** invitación de usuarios y recuperación de contraseña (requieren SMTP y `NEXT_PUBLIC_SITE_URL` reales), notificación de nuevas solicitudes (no implementada), pantallas de administración con cuenta de *acuerdo* (por diseño solo plataforma ve solicitudes/testimonios).
- **Precios, cifras y casos de clientes: siguen publicados en la rama como «por confirmar»** (`docs/AUDITORIA_AFIRMACIONES.md`). No los cambié sin su confirmación; **no deben publicarse en producción hasta que usted los confirme o los retire** (§7, B4).

## 4. Orden definitivo de migraciones

Cada archivo en **una sola ejecución** (SQL Editor o `supabase db push`), en este orden, primero en staging alojado:

1. `202611030001_public_intake.sql` — tablas/buckets/políticas de captación. Crea todo (no existía en producción). No toca tablas ni políticas existentes.
2. `202611030002_fix_storage_document_read.sql` — política de lectura de documentos (transaccional).
3. `202611030003_harden_privileges.sql` — mínimo privilegio (transaccional). Idempotente.

Después, `VALIDATE CONSTRAINT` de las restricciones `NOT VALID` cuando el bloque 10 de `intake_state_readonly.sql` devuelva 0 (con tablas nuevas es inmediato).
`001` y `003` son independientes entre sí; `002` y `003` solo requieren el esquema de producción actual (`…0004`).

## 5. Checklist de producción

**Antes de tocar nada**
- [ ] Confirmar a qué proyecto de Supabase apunta el sitio **desplegado** (Vercel → Project → Settings → Environment Variables: `NEXT_PUBLIC_SUPABASE_URL` debe ser `svbvkgvtjksvjfvigiah`, y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` la clave *publishable*; **nunca** `service_role` con prefijo `NEXT_PUBLIC_`). Si apunta a otro proyecto, ese proyecto necesita su propia auditoría de solo lectura.
- [ ] Variables del despliegue: `NEXT_PUBLIC_SITE_URL=https://www.deepsunstudio.com`, `SUPABASE_SERVICE_ROLE_KEY` (solo servidor, solo si se invitará gente desde el portal), `NEXT_PUBLIC_WHATSAPP_NUMBER=573246183318` (opcional: el código ya fuerza ese número).
- [ ] Supabase Auth (panel): registro público **desactivado** (el portal es por invitación; en el stack local está abierto por defecto), límites de correo, política de contraseñas, URL del sitio y redirecciones (`https://www.deepsunstudio.com/portal/auth/callback`), SMTP propio si se usarán invitaciones.
- [ ] Respaldo: Dashboard → Database → Backups (confirmar uno reciente) **y** `pg_dump --schema-only` del esquema `public` + metadatos de Storage, guardado fuera del repositorio. Producción tiene pocos datos (1 acuerdo, 2 usuarios, 0 documentos al auditar); aun así, copia completa.
- [ ] Staging alojado: crear un proyecto distinto (**puede generar costo; requiere su aprobación**), aplicar `0001`–`0004` + `001`–`003`, repetir `verify.mjs`, `verify-portal.mjs` y `e2e-staging.js` apuntando a él, y anotar **qué cabecera trae la IP real** (`intake_settings.trusted_ip_header`; se espera `cf-connecting-ip`).
- [ ] Decisiones de contenido (B4) y política de datos personales (B5): ver §7.

**Despliegue**
- [ ] Ejecutar `intake_state_readonly.sql` (bloques 1–8, 11–13) y guardar el resultado (plano «antes»).
- [ ] Aplicar `001` → `002` → `003` (§4). Repetir el SQL de solo lectura y comparar con lo esperado (comentarios del archivo).
- [ ] Probar a mano un envío real de contacto y una reseña (se pueden borrar después desde el portal).
- [ ] Desplegar el frontend (rama aprobada) y vaciar caché/CDN si aplica.

**Reversión** (ver `docs/PUBLICACION_SEGURA.md` §3): `003` → `…003_harden_privileges_rollback.sql`; `002` → recrear la política desde el volcado; `001` → `…001_public_intake_rollback_fresh_install.sql` (se niega si hay filas) y borrar los buckets por la API de Storage; frontend → despliegue anterior (sigue siendo compatible con la base migrada). Interruptores de emergencia de la captación en el archivo de reversa.

## 6. Pruebas posteriores al despliegue

1. `intake_state_readonly.sql` completo: RLS `true` en `leads`/`testimonials`; bloque 11: `truncate`/`references`/`trigger` = 0 para ambas roles; bloque 12: `anon_exec = false` en todas las funciones; bloque 13: la política menciona `objects.name`.
2. `verify.mjs` y `verify-portal.mjs` contra **staging** (no contra producción: los scripts rechazan la URL del sitio). En producción, solo comprobaciones manuales: envío de contacto → fila `new`; reseña → pendiente e invisible; aprobar desde `/portal/admin/testimonios` → visible tras recargar.
3. Cuentas reales: administrador de plataforma (solicitudes, testimonios, documentos), inversionista A (ve su acuerdo y descarga su documento visible), inversionista B (no ve ni descarga lo de A), usuario sin acuerdo (nada).
4. Subir un documento desde `/portal/admin/documentos` y abrirlo como inversionista; marcarlo no visible y comprobar que deja de abrirse.
5. Límite por IP: 6 envíos en una hora desde la misma red → el 6.º con el aviso de «muchas solicitudes»; si `intake_client_log` queda vacía, la IP no llega: solo actúan los límites por correo y global.
6. Auth: registro público cerrado; recuperación de contraseña apunta a `https://www.deepsunstudio.com`.
7. WhatsApp: los enlaces abren `wa.me/573246183318`; ES/EN: alternar idioma en portada, `/servicios`, `/contacto`.

## 7. Bloqueantes abiertos (para PRODUCCIÓN)

| # | Bloqueante | Quién | Estado |
|---|---|---|---|
| 1 | Confirmar el proyecto Supabase y las variables del despliegue (Vercel) | titular | No verificable desde aquí |
| 2 | Staging **alojado** con la cabecera de IP real y Auth del proyecto alojado (registro público OFF, SMTP) | titular (aprobar costo) | Pendiente; el local no lo cubre |
| 3 | **B4:** confirmar o retirar cifras (10+/6+/3+), precios (US$600/1.500/800), plazos, condiciones de pago/soporte, tasa COP/EUR y permiso de cada cliente para mostrar su caso (LUFE, Fundación, SIEPA, Premios La Cima) | titular | Siguen publicados en la rama «por confirmar» |
| 4 | **B5:** política de tratamiento de datos personales (Ley 1581/2012) y casilla/enlace en los formularios, que recogen nombre, correo y teléfono | titular redacta; luego se integra | No implementado (no se inventa texto legal) |
| 5 | Canal de aviso de solicitudes nuevas (hoy hay que revisar el portal) | titular decide | Sin implementar |
| 6 | Decidir si se eliminan `/api/projects|stats|experience` (públicas, publican stack técnico y currículum interno) | titular | Sin cambios |
| 7 | Cuenta de administrador de **plataforma** para `/portal/admin/solicitudes|testimonios` (producción tiene 1) | titular | Existe 1; confirmar que es la correcta |

No son bloqueantes pero conviene saberlo: la invitación de usuarios y el restablecimiento de contraseña no se ejercitaron (requieren SMTP); el límite por IP no detiene una botnet distribuida (hay freno global); el MIME de las subidas públicas es el declarado por el navegador y los archivos huérfanos de reseñas requieren limpieza periódica por la API de Storage.

## 8. Estado del repositorio (al 2026-11-03)

- Rama `redesign/deepsun-editorial`, árbol limpio. **Nada publicado**: sin push, sin merge, sin despliegue.
- **12 commits locales por delante de `origin/main`**: los **8 previos** (`a5094f6` … `d4f2292`: rediseño público, SEO/afirmaciones, endurecimiento y captación, WhatsApp oficial, revisión de `001`) — son 8, no 6 — y **4 nuevos** de esta fase: `2bb1e4d` (002 + 003 + reversas + pruebas), `9ed436d` (staging local y pruebas de caja negra/e2e), `074944c` (documentación) y el último, que añade esta sección. El portal de inversionistas (`7633042`) ya está en `origin/main`.
- Existe un `stash@{0}` antiguo de la rama `feat/investor-portal` (`next-env.d.ts` autogenerado); no se tocó.
- `npm run check` (typecheck + lint + 82 pruebas) en verde.
