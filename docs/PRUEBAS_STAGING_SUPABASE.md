# Supabase: qué está probado, qué falta y cómo verificarlo en staging

**Regla:** nada de esto se ejecuta contra producción. Primero staging; en producción solo las consultas de **solo lectura** de `supabase/verification/intake_state_readonly.sql`.

## Qué ya está probado (y con qué alcance)

| Capa | Prueba | Alcance real |
|---|---|---|
| Esquema, restricciones, disparadores, RLS y permisos de columna de `leads`, `testimonials` y Storage | `tests/intake-db.test.ts` (25 pruebas, `npm test`) con las migraciones reales sobre Postgres local (PGlite) | Prueba la **lógica SQL**. No prueba PostgREST, Auth ni Storage reales |
| Aislamiento entre inversionistas y datos solo-admin del portal | `tests/portal-rls-db.test.ts` (7 pruebas) con las migraciones reales | Idem. No prueba sesiones, cookies ni `proxy.ts` |
| Actualización de una configuración permisiva «hecha a mano» | Prueba `upgrade` | Demuestra que la migración cierra RLS apagado / políticas abiertas y conserva filas |
| Formularios (error, límite, inválido, duplicado, éxito) y carga útil | `docs/qa/forms.js` en Edge real contra un servidor **falso** | Prueba la **interfaz**; el servidor falso no es Supabase |

El Postgres local imita `auth.uid()/auth.role()`, los roles `anon/authenticated/service_role`, `request.headers` y los permisos por defecto de Supabase. Lo que **no** puede confirmar: nombres reales de cabeceras de IP, cómo PostgREST traduce los errores `DS001/DS002/DS003`, validación de Storage (tamaño/MIME) ni límites de Auth.

## Orden de despliegue (staging → producción)

1. En **producción**, ejecutar `supabase/verification/intake_state_readonly.sql` (solo lectura) y guardar los resultados: indica si hoy hay RLS, políticas abiertas o permisos amplios.
2. Crear/usar un proyecto **staging**. Restaurar un volcado de esquema de producción (sin datos personales) o aplicar las migraciones: `202609290001` … `202609300004` y luego `202611030001_public_intake.sql` y `202611030002_fix_storage_document_read.sql`.
   - Si la migración aborta con `schema differs from what the frontend sends`, **no forzar**: ajustar el esquema real (la tabla de producción difiere) y volver a intentar.
3. Con `.env.local` de staging (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; nunca la `service_role` en el navegador) ejecutar la lista de abajo.
4. Si todo pasa: aplicar en producción en una ventana de bajo tráfico, con copia de seguridad previa. Después ejecutar de nuevo el archivo de solo lectura y `VALIDATE CONSTRAINT` de las restricciones `NOT VALID` cuando el bloque 10 devuelva 0.

## Lista de verificación en staging

| # | Prueba | Resultado esperado |
|---|---|---|
| 1 | Aplicar la migración dos veces | Sin errores (idempotente) |
| 2 | Enviar `/contacto` (5 pasos) y el formulario rápido como visitante | Fila en `leads` con `source` `brief` / `home_quick`; confirmación solo tras el 201 |
| 3 | Como `anon`: `GET /rest/v1/leads` y `PATCH/DELETE` | 401/403 (permiso denegado) |
| 4 | Como `anon`: insertar con `status`, `admin_notes`, `client_hash` | Rechazado |
| 5 | Repetir el mismo envío | `400` con `code: "DS001"` (la UI muestra «ya habíamos recibido…») |
| 6 | 6 envíos distintos en una hora desde una misma red | El 6.º devuelve `DS002`. **Anotar cuál cabecera trae la IP real** (`cf-connecting-ip`, `x-real-ip`, `x-forwarded-for`) y ajustar `intake_client_ip()` si hace falta. Si `client_hash` sale `NULL`, la IP no llega y solo actúan los límites por correo y global |
| 7 | Enviar reseña con y sin archivos | Fila con `approved=false`; archivos en los 3 buckets con nombres `<timestamp>-<aleatorio>.<ext>` |
| 8 | Como `anon`: `GET /rest/v1/testimonials` | Solo `approved=true` y solo columnas públicas; `select=*` da error (la web pide columnas explícitas) |
| 9 | Como `anon`: `PATCH testimonials set approved=true` | Rechazado |
| 10 | Como inversionista (`authenticated`, no admin): leer `leads`, ver pendientes, aprobar | 0 filas / sin efecto |
| 11 | Como administrador de plataforma en `/portal/admin/solicitudes` y `/testimonios`: listar, cambiar estado, aprobar, destacar, eliminar | Funciona; el testimonio aprobado aparece en la portada tras recargar |
| 12 | Como administrador de **acuerdo** (no de plataforma) abrir esas pantallas | Redirige al panel (por diseño: requieren rol de plataforma) |
| 13 | Subir `.exe`, >2 / 5 / 50 MB, MIME no permitido, directamente a la API de Storage | Rechazo del lado servidor. **Anotar si Storage valida el tipo real o solo el declarado** |
| 14 | Subida que falla a mitad | Mensaje de error, sin fila; revisar archivos huérfanos en el bucket |
| 15 | Auth: desactivar registros públicos (`Authentication → Sign In / Providers → Allow new users to sign up = OFF`); límites de envío de correo; política de contraseñas | Solo cuentas por invitación (el portal no tiene registro público) |
| 16 | Portal con cuentas reales: administrador, inversionista A, inversionista B | Cada uno solo ve lo suyo; el inversionista A abre un documento marcado visible; el B no |
| 17 | `NEXT_PUBLIC_SITE_URL` en producción | Definida (si falta, las invitaciones apuntarían a `http://localhost:3000`) |

## Limitaciones conocidas (aceptadas hasta decidir lo contrario)
- El límite por dirección no detiene una botnet distribuida; el freno global (200 solicitudes/h, 60 reseñas/h) acota el daño. Si se observa abuso: CAPTCHA (p. ej. Cloudflare Turnstile) verificado en un Route Handler propio.
- El MIME de las subidas es el declarado por el navegador; los archivos pendientes son accesibles por quien conozca su URL aleatoria; hay que limpiar huérfanos periódicamente.
- Nadie recibe aviso de una solicitud nueva: hay que revisar el portal (ver `docs/AUDITORIA_PRODUCCION.md`).
