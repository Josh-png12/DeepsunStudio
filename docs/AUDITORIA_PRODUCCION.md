# Auditoría de preparación para producción — Supabase, captación, integridad comercial y portal

Rama `redesign/deepsun-editorial` (sin push). No se tocó producción ni se usaron credenciales privadas. No había staging disponible: Docker está instalado pero detenido, no hay CLI de Supabase ni claves; se probó sobre Postgres local (PGlite) con las **migraciones reales** y se documentó lo que solo un staging puede confirmar (`docs/PRUEBAS_STAGING_SUPABASE.md`).

## Resumen de hallazgos

### BLOQUEANTES para producción
| # | Hallazgo | Estado |
|---|---|---|
| B1 | **`leads`, `testimonials` y los 3 buckets no existen en el repo**: se crearon a mano y su seguridad real es desconocida. Con RLS apagado o políticas abiertas (algo común en tablas hechas desde el panel), cualquier visitante podría **leer todos los contactos** (datos personales) y **auto-aprobar testimonios**; la prueba `upgrade` lo demuestra sobre una configuración así | Resuelto en código: `202611030001_public_intake.sql` (RLS, permisos mínimos por columna, validación, disparadores, buckets, políticas de Storage; idempotente y con guarda contra esquemas distintos). **Pendiente: ejecutar `intake_state_readonly.sql` en producción para ver el estado actual, aplicar en staging y verificar** |
| B2 | **Antispam solo en el navegador** (honeypot + espera de 20 s): cualquiera puede saltárselo llamando a la API | Resuelto en código (disparadores de base de datos: duplicados, límite por dirección —solo con cabecera de plataforma, no falsificable—, por correo y freno global; el cliente solo traduce las respuestas). **Pendiente en staging: confirmar qué cabecera trae la IP real (`intake_settings.trusted_ip_header`).** No frena una botnet distribuida |
| B3 | **Nadie se entera de una solicitud nueva ni hay dónde verla/moderarla**: las solicitudes solo caen en una tabla y los testimonios se aprobaban desde el panel de Supabase | Parcial: nuevas pantallas `/portal/admin/solicitudes` y `/portal/admin/testimonios` (solo administradores de plataforma). **No hay notificación**: decidir canal (ver abajo) |
| B4 | **Datos comerciales por confirmar por el titular** (cifras 10+/6+/3+, precios, plazos, permiso de clientes) | Sin cambios de contenido; checklist abajo |
| B5 | **Aviso de tratamiento de datos personales**: los formularios recogen nombre, correo y teléfono sin enlace a política ni autorización de tratamiento (Colombia: Ley 1581 de 2012) | No implementado (no se inventa texto legal). Requiere política redactada por el titular y enlace/casilla en los formularios |

### IMPORTANTES, no bloqueantes
| # | Hallazgo | Estado |
|---|---|---|
| I1 | Portal: los inversionistas **no podían abrir documentos marcados como visibles**: la política de lectura de Storage comparaba `d.storage_path = name` y `name` resolvía a `documents.name`. Falla cerrado (no filtraba nada) | **Corregido y probado**: `202611030002_fix_storage_document_read.sql` (la prueba fallaba antes) |
| I2 | Portal: `inviteUserAction` usa la clave de servicio (ignora RLS) y solo exigía ser *miembro* del acuerdo; un administrador de un acuerdo que fuera inversionista de otro podía invitar gente al segundo | **Corregido**: exige `canManageAgreement` |
| I3 | Sin pantalla/estado de Supabase Auth verificado: registros públicos, límites de correo, política de contraseñas | Documentado en la lista de staging (#15) |
| I4 | Subidas de archivos: el MIME es el declarado por el navegador; los pendientes son accesibles por URL aleatoria; sin limpieza de archivos huérfanos | Documentado; límites de tamaño y tipo se imponen por bucket |
| I5 | `NEXT_PUBLIC_SITE_URL` ausente en producción haría que las invitaciones apunten a `http://localhost:3000` | Documentado (#17) |
| I6 | `/api/projects`, `/api/stats`, `/api/experience` son públicos, no los usa la interfaz y publican el stack técnico, «technologies: 20» y el currículum interno | **Sin cambios**: decidir si se eliminan (contradicen la decisión de no mostrar tecnologías) |
| I7 | El administrador necesita rol de **plataforma** para las pantallas nuevas (un administrador solo de acuerdo ve el aviso y es redirigido) | Por diseño; documentado |
| I8 | No hay límite de intentos de inicio de sesión propio (depende de Supabase Auth) | Verificar límites en el panel de Auth |

### MEJORAS FUTURAS
CAPTCHA verificado en un Route Handler propio si hay abuso · notificación de nuevas solicitudes (ver opciones) · limpieza programada de archivos huérfanos · paginación y exportación CSV en las pantallas de administración (hoy máx. 500 filas) · política de retención de datos personales · pruebas end-to-end con cuentas de staging · ocultar `moderated_by` es deliberado, añadirlo a la interfaz si se quiere trazabilidad visible.

## Acciones realizadas
1. Auditoría de todo el uso de Supabase (`leads`, `testimonials`, buckets, portal, claves, `proxy.ts`, callback, acciones del servidor).
2. Migración `202611030001_public_intake.sql`: tablas, columnas de gestión (`status`, `admin_notes`, `source`…), validación (CHECK `NOT VALID` para no romper filas existentes), RLS por defecto-denegar (borra políticas previas), permisos mínimos por columna, disparadores de abuso y de moderación, buckets con límites, políticas de Storage por patrón de nombre.
3. Migración `202611030002_fix_storage_document_read.sql`.
4. Frontend: `lib/leads.ts` (clasifica `DS001/2/3`, valores inválidos, origen del formulario), formularios rápido/completo/reseña (mensajes honestos, datos conservados, `approved` ya no se envía, columnas explícitas en el carrusel).
5. Portal: `/portal/admin/solicitudes` y `/portal/admin/testimonios` con acciones del servidor (re-autorizan y se apoyan en RLS) y entradas de menú. `inviteUserAction` corregida.
6. Pruebas nuevas reproducibles en `npm test`: 25 (intake) + 7 (portal) con Postgres local; `devDependency` `@electric-sql/pglite`.
7. Consulta de solo lectura para inspeccionar el estado real: `supabase/verification/intake_state_readonly.sql` (guía: `docs/SQL_LECTURA_PRODUCCION.md`; prueba `tests/readonly-sql.test.ts`).
8. Revisión de seguridad de la migración, procedimiento de staging, respaldo/despliegue/reversa, propuestas de aviso y de política de privacidad: **`docs/PUBLICACION_SEGURA.md`**; `supabase/rollback/`, `supabase/staging/legacy_fixture.sql`, `scripts/staging/verify.mjs`.
9. La migración fue revisada: la IP solo se toma de una cabecera de plataforma configurable (no de `x-forwarded-for`), el hash de IP y el actor de moderación viven en tablas internas, es compatible con el sitio antiguo (puede aplicarse antes del despliegue) y trae reversa probada.

## Pruebas verificadas
- `npm run check`: typecheck + lint + todas las pruebas (incluye intake con Postgres local, portal, consulta de solo lectura, WhatsApp, reversa y ensayo con el fixture de staging). `npm run build`: correcto (incluye las dos rutas nuevas).
- Base de datos (local): visitante anónimo no lee/edita/borra `leads`; no puede fijar `status`, `admin_notes`, `client_hash`; valores inválidos rechazados; duplicados (24 h), límite por dirección (6.º en 1 h), por correo (4.º en 24 h), freno global; sin IP solo actúan correo y freno global; inversionista no ve ni modifica nada; administrador gestiona y el contenido es inmutable; el público solo ve testimonios aprobados y columnas públicas; nadie puede aprobarse/destacarse ni cambiar contenido; URLs de medios solo de nuestros buckets; subidas de Storage limitadas por bucket y patrón; actualización de una configuración permisiva la cierra sin perder filas; contrato de columnas que consulta el código.
- Portal (local): anónimo sin acceso; inversionista A solo ve su acuerdo, proyectos visibles y novedades de miembros; no ve notas internas, novedades «solo administración» ni auditoría; inversionista B aislado; no puede escribir, unirse a acuerdos ni ascender su rol; documentos privados por visibilidad.
- Navegador real (Edge) contra servidor falso: error, límite, pausa, valor inválido, duplicado y éxito en los tres formularios; el éxito solo tras guardar; datos conservados al fallar; carga útil sin `approved` y con `source`.
- Rutas protegidas del portal redirigen a login sin sesión (incluidas las nuevas).

## No se pudo verificar (requiere staging con cuentas reales)
Sesiones y cookies reales del portal con administrador/inversionistas · traducción de errores de PostgREST · cabecera real de IP · validación de Storage (tamaño y tipo real) · límites de Supabase Auth · pantallas `/portal/admin/solicitudes|testimonios` autenticadas · volumen real de filas existentes frente a las restricciones nuevas.

## Notificación de solicitudes — opciones evaluadas (no implementadas)
1. **Revisión diaria en el portal** (hoy): cero dependencias; riesgo de que una solicitud espere.
2. **Webhook de base de datos de Supabase → correo** (Resend/SMTP): la más simple dentro de la arquitectura actual; añade un servicio y una clave.
3. **Route Handler propio** que reciba el formulario, verifique CAPTCHA, guarde con clave de servicio y avise: la más robusta contra abuso; cambia el flujo actual (el navegador deja de insertar directo).
Recomendación: opción 2 al lanzar y opción 3 solo si aparece abuso. Requiere decisión del titular.

## Checklist breve para el titular
- [ ] Autorizar ejecutar `intake_state_readonly.sql` en producción y compartir los resultados.
- [ ] Proporcionar un proyecto de **staging** (o confirmar crearlo) para la lista de `docs/PRUEBAS_STAGING_SUPABASE.md`.
- [x] **WhatsApp** confirmado: +57 324 618 3318 (centralizado en `lib/site.ts`, con prueba automática).
- [ ] Confirmar el correo público (`joshua@deepsunstudio.com`) y `NEXT_PUBLIC_SITE_URL`.
- [ ] Confirmar o retirar: 10+ proyectos, 6+ clientes, 3+ años.
- [ ] Confirmar precios (US$600 / 1.500 / 800), plazos (7–10 y 15–20 días, 3–4 meses), pago 50/50 y soporte, y la fuente de tasas COP/EUR.
- [ ] Confirmar que cada cliente autoriza mostrar su caso (LUFE, Fundación, SIEPA, Premios La Cima).
- [ ] Redactar la política de tratamiento de datos y aprobar dónde se enlaza.
- [ ] Decidir el canal de aviso de nuevas solicitudes.
- [ ] Decidir si se eliminan `/api/projects|stats|experience`.
- [ ] Cuenta de administrador de plataforma para las pantallas nuevas; token de Search Console (`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`).
