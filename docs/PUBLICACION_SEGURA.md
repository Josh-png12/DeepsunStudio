# Publicación segura: revisión de la migración, staging, despliegue y reversa

Nada de esto se ha ejecutado contra ningún proyecto de Supabase. La migración `supabase/migrations/202611030001_public_intake.sql` **no está aplicada en ninguna parte**. Todo se probó en Postgres local con pruebas automáticas (`npm test`).

## 1. Revisión de seguridad de `202611030001_public_intake.sql`

| Pregunta | Respuesta |
|---|---|
| ¿Elimina políticas? | **Sí, deliberadamente**: borra *todas* las políticas existentes de `public.leads`, `public.testimonials` y las de `storage.objects` que mencionan los tres buckets de reseñas, y crea políticas por defecto-denegar. Es el objetivo (cerrar configuraciones abiertas), pero si en producción hay una política que hoy usa algo que no conocemos, dejará de funcionar. **Guarde antes los bloques 3, 4 y 8 de la consulta de solo lectura** (es su copia para reconstruirlas). No toca políticas de otras tablas ni del bucket `agreement-documents`. |
| ¿Cambia permisos? | Sí: `REVOKE` total a `anon/authenticated/public` sobre `leads`, `testimonials` y las tablas internas, y luego `GRANT` mínimo: `anon` solo `INSERT` en columnas del formulario; `testimonials` legible por todos pero RLS limita a `approved = true`; lectura/gestión completa solo vía `is_platform_admin()`. Revoca `EXECUTE` de las funciones internas (por defecto PostgREST las expondría). |
| ¿Modifica datos existentes? | **No** modifica ni borra filas. Añade columnas con valor por defecto constante (`source='brief'`, `status='new'`). Las restricciones CHECK se añaden `NOT VALID`: las filas antiguas que no cumplan quedan intactas (se detectan con el bloque 10 y se validan después). |
| ¿Interrumpe funciones existentes? | No reemplaza funciones del portal. Usa `is_platform_admin()` (ya existente). No cambia Auth. |
| ¿Es compatible con el sitio *actualmente desplegado*? | **Sí, por diseño y por prueba**: `select *` en testimonios sigue funcionando (la tabla pública no tiene columnas internas), el insert con `approved:false` sigue funcionando (se acepta y se fuerza a no aprobado), las subidas con extensión en mayúsculas siguen aceptadas. Por eso la migración puede aplicarse **antes** de publicar el nuevo sitio. |
| ¿Es atómica/idempotente? | Una sola transacción (si falla, no queda nada a medias). Se puede ejecutar dos veces (prueba incluida). |
| ¿Bloqueos? | `ALTER TABLE … ADD COLUMN` con default constante y `ADD CONSTRAINT … NOT VALID` toman bloqueos breves; con un volumen pequeño de filas son milisegundos. Ejecutar en horario de poco tráfico. |
| ¿Deriva de esquema? | Si las tablas reales tienen columnas distintas/extra, **aborta con un mensaje** en lugar de exponerlas. |
| Defectos corregidos en esta revisión | (a) la IP ya **no** se toma de `x-forwarded-for`/`x-real-ip` (los pone el navegador); (b) el hash de IP y el actor de moderación salen de las tablas públicas a tablas internas sin permisos; (c) el contador solo cuenta envíos realmente guardados; (d) límites configurables sin redeploy; (e) el freno global sube a 500 leads/h y 120 reseñas/h. |

### Antispam: ¿depende de una IP que el navegador pueda inventar?
- Solo se usa la cabecera `trusted_ip_header` (por defecto `cf-connecting-ip`, que añade Cloudflare delante de Supabase y sobrescribe la del cliente). Si esa cabecera no existe, **no hay conteo por dirección** (solo por correo y freno global): falla hacia «permitir», no hacia «bloquear a alguien por una IP falsa». Un atacante no puede «quemar» la cuota de otra persona enviando cabeceras ajenas (hay pruebas para esto).
- Falta confirmar en staging qué cabecera llega realmente (si no es `cf-connecting-ip`, cambiar `trusted_ip_header`; si solo llega `x-forwarded-for` detrás de un número fijo de proxies, configurar `xff_from_right`). Sin esa confirmación el límite por dirección puede estar inactivo; el resto sigue funcionando.
- ¿Puede bloquear a visitantes legítimos? Límites por defecto: 5 solicitudes/h por dirección, 3/día por correo, 3 reseñas/h y 8/día por dirección. Una oficina o una red móvil compartida podría alcanzar 5/h; es poco probable y se arregla sin código (ver «interruptores de emergencia» en el archivo de reversa). Los rechazos por duplicado/invalidez no consumen cuota. Al visitante bloqueado se le ofrece WhatsApp.
- Un atacante todavía puede **pausar** el formulario si genera 500 leads/h reales (el freno global): es el precio de un freno sin CAPTCHA. Respuesta: CAPTCHA verificado en servidor (Cloudflare Turnstile) si ocurre; mientras tanto, el visitante ve el mensaje «pausa» y WhatsApp.
- Un freno global no se puede evadir cambiando de IP, pero tampoco detiene una botnet que llegue justo por debajo de los límites por dirección.

## 2. Procedimiento de staging (reproducible, sin datos reales)

1. **Proyecto**: crear un proyecto nuevo de Supabase llamado `deepsun-staging` (plan gratuito basta). Nunca reutilizar el de producción.
2. **Esquema base**: aplicar en orden las migraciones de `supabase/migrations/` hasta `202609300004…` (SQL Editor, una por una, o `supabase db push` apuntando al proyecto de staging).
3. **Estado legado**: ejecutar `supabase/staging/legacy_fixture.sql` (tablas permisivas con filas ficticias, incluida una que viola los CHECK nuevos). Ajústelo a lo que muestre el bloque 2 de producción.
4. **Ensayo de la migración**: ejecutar `202611030001` y luego `202611030002`. Ejecutar `202611030001` una segunda vez (debe terminar sin error). Ejecutar el bloque 10: la fila antigua debe aparecer; `VALIDATE CONSTRAINT` fallará hasta limpiarla (comportamiento esperado).
5. **Cuentas ficticias** (Auth → Users → *Add user*, con correo `@example.test` o alias propio): un **administrador de plataforma** (`profiles.role = 'admin'` y la marca que usa `is_platform_admin()`), un **inversionista A** y un **inversionista B**. Contraseñas solo en su gestor.
6. **Verificación automática**:
   ```bash
   STAGING_SUPABASE_URL=https://<ref>.supabase.co STAGING_ANON_KEY=<publishable> STAGING_CONFIRM=<ref> node scripts/staging/verify.mjs
   ```
   (opcional: `STAGING_ADMIN_EMAIL/PASSWORD`, `STAGING_INVESTOR_EMAIL/PASSWORD`). El script se niega a ejecutarse si `STAGING_CONFIRM` no coincide, o si la URL es la que usa el sitio (`.env.local`). Escribe filas marcadas `[staging-test]`; limpiar al final con las dos sentencias que imprime.
7. **Verificación manual** con `docs/PRUEBAS_STAGING_SUPABASE.md` (Auth real, portal, `/portal/admin/solicitudes|testimonios`, cabecera de IP real, Storage con archivos reales).
8. **Ensayo de reversa**: ejecutar `supabase/rollback/202611030001_public_intake_rollback.sql` en staging, comprobar que el sitio sigue enviando, y volver a aplicar la migración.
9. **Cubierto por qué**: roles/RLS/permisos/triggers/Storage-policies → pruebas locales (ya pasan) **y** `verify.mjs`; Auth y cabeceras de IP reales, límites de tamaño/MIME de Storage, PostgREST traduciendo `DS001/2/3` → solo staging real.

## 3. Respaldo, despliegue y reversa en producción

**Antes** (nada de esto modifica producción):
1. Autorizar y ejecutar la consulta de solo lectura (`docs/SQL_LECTURA_PRODUCCION.md`) y guardar los resultados (esto es el *plano* de lo que hay).
2. Copia de seguridad: Dashboard → Database → Backups (confirmar que hay una reciente; en plan gratuito, descargue un volcado: `pg_dump` del esquema `public` y de `storage.buckets/objects` solo metadatos), y exportar manualmente `leads` y `testimonials` a CSV **guardado fuera del repositorio** (contiene datos personales).
3. Revisar en la exportación las reseñas `approved = true`: la migración las deja publicadas tal cual (si alguien se auto-aprobó antes, seguirá visible hasta que usted la desapruebe).

**Orden seguro de publicación** (el orden definitivo y la lista completa están en `docs/LANZAMIENTO.md`):
1. Solo lectura en producción → 2. Staging completo (§2) → 3. Respaldo (arriba) → 4. **Aplicar en producción, cada archivo en UNA sola ejecución y en este orden: `202611030001` → `202611030002` → `202611030003`** (ventana de poco tráfico; el sitio antiguo sigue funcionando) → 5. Ejecutar de nuevo la consulta de solo lectura (bloques 1–8 y 11–13) y comparar con lo esperado → 6. Probar a mano un envío real de contacto y una reseña → 7. **Desplegar el nuevo frontend** (rama `redesign/deepsun-editorial`) → 8. Revisar `/portal/admin/solicitudes` → 9. Cuando el bloque 10 dé 0, `VALIDATE CONSTRAINT`.
No hay migración automática en el repositorio: nada se aplica sin que usted ejecute el SQL.

**Reversa** (en orden inverso al de aplicación; cada paso es independiente y se prueba en `tests/hardening-db.test.ts`):
- `003` → `supabase/rollback/202611030003_harden_privileges_rollback.sql`: devuelve los privilegios exactamente como estaban en producción (es el estado MENOS seguro). Preferible: corregir hacia adelante re-otorgando UNA función/tabla a `authenticated`.
- `002` → recrear la política anterior desde el volcado del respaldo (o volver a ejecutar el bloque 13 guardado). Ojo: la política anterior es la que tenía el defecto; solo conviene volver a ella si la nueva bloquea lectura legítima.
- `001` cuando **creó** las tablas (caso de producción: no existían) → `supabase/rollback/202611030001_public_intake_rollback_fresh_install.sql`: se niega a ejecutarse si hay filas (exporte antes), borra tablas, funciones, disparadores y las políticas de Storage de los buckets `testimonial-*`. **Los buckets y sus archivos NO se pueden borrar por SQL** (Supabase instala disparadores `storage.protect_delete`): elimínelos con la API de Storage (instrucciones dentro del archivo). Si ya hay datos que conservar: `202611030001_public_intake_rollback.sql` (quita la maquinaria y conserva las filas).
- Frontend nuevo defectuoso: volver al despliegue anterior; sigue siendo compatible con la base migrada. Interruptores de emergencia (pausar/relajar límites sin tocar código) en el propio archivo de reversa.

## 4. Aviso de nuevas solicitudes (propuesta, no implementada)
Estado: no hay integración externa. El repo contiene variables `NEXT_PUBLIC_EMAILJS_*` en `.env.local.example`, pero ninguna ruta del sitio las usa hoy; confirme si esa cuenta de EmailJS sigue activa.
Propuesta mínima reutilizando lo existente: **Database Webhook de Supabase (INSERT en `leads`) → Route Handler `app/api/notify-lead/route.ts` → un correo a `joshua@deepsunstudio.com`** (con el servicio de correo que ya use el titular, p. ej. la API REST de EmailJS desde el servidor, o Resend/SMTP). Reglas: verificar un secreto compartido en la cabecera del webhook; el correo lleva solo nombre, tipo de negocio y un enlace a `/portal/admin/solicitudes` (nunca el mensaje completo ni teléfono, para que el correo no sea una segunda copia de datos personales); si el aviso falla, la solicitud ya está guardada (no se pierde nada). Alternativa sin código: revisión diaria del portal; o un recordatorio de calendario. Requiere decisión del titular (qué servicio, a qué correo, y variables de entorno nuevas en el servidor).

## 5. Dónde integrar la política de privacidad y la autorización de tratamiento
Sin inventar texto legal (lo redacta el titular, p. ej. con abogado; Colombia: Ley 1581 de 2012 y Decreto 1377 de 2013 exigen informar finalidad y obtener autorización previa, expresa e informada):
- **Página** `/privacidad` (y `/en/privacy` si se mantiene el cambio ES/EN): responsable, finalidades, derechos, canal para ejercerlos, tiempo de conservación. Contenido pendiente del titular.
- **Formulario completo** (`components/site/BriefForm.tsx`, paso 5, antes de «Enviar»): casilla *no premarcada* «He leído la política de tratamiento de datos y autorizo…» con enlace; bloquear el envío sin ella.
- **Formulario rápido** (`ContactBlock`) y **reseñas** (`ReviewForm`): misma casilla/enlace (en reseñas, además autorización para publicar nombre/foto/video).
- **Pie de página**: enlace permanente a la política.
- **Base de datos (siguiente migración, no incluida)**: columnas `privacy_accepted_at timestamptz`, `privacy_version text` en `leads` y `testimonials`, con CHECK `privacy_accepted_at is not null` para nuevas filas y el texto/versión que apruebe el titular. Así queda evidencia de la autorización.
- Pendiente del titular: política de retención y procedimiento para atender solicitudes de supresión (borrado manual en el portal hoy).
