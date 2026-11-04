# DeepSun Studio 1.0 — lanzamiento informativo (2026-11-04)

Versión corporativa e informativa publicada en `https://www.deepsunstudio.com`. **No depende de ninguna base de datos**: ninguna página pública consulta Supabase (comprobado en navegador real bloqueando y contando toda petición a `*.supabase.co`: 0).

## Qué está activo
Inicio (identidad visual actual) · El estudio · Servicios (alcance, sin precios) · Proyectos propios (`scraper-app-gui`, `ms-usuarios`) · Blog (2 artículos revisados) · Contacto por **WhatsApp oficial +57 324 618 3318** (`lib/site.ts` es la única fuente) · SEO (robots, sitemap y canonical del dominio oficial; `noindex` en todo lo que no es producción) · responsive escritorio/móvil.

## Qué está desactivado (nada se borró; todo sigue en el repositorio)
Todo se controla en `lib/launch.ts`.

| Elemento | Cómo está | Cómo reactivarlo |
|---|---|---|
| Formularios con datos personales (contacto rápido, brief de 5 pasos, reseñas) y carrusel de testimonios | `FORMS_ENABLED` = false (variable `NEXT_PUBLIC_FORMS_ENABLED=true`). Sin aviso de privacidad no se recogen datos; WhatsApp es el canal | Política de tratamiento de datos aprobada por el titular + casilla de autorización (`docs/PUBLICACION_SEGURA.md` §5) + migración `202611030001` aplicada en la base de producción |
| Portal de inversionistas `/portal/*` | `PORTAL_ENABLED` = false: toda URL `/portal` responde 404 desde el despliegue público (`proxy.ts`). Sin enlaces en el sitio | Aplicar `202611030002` y `003` en producción (ver abajo) y `NEXT_PUBLIC_PORTAL_ENABLED=true` |
| API públicas `/api/projects|stats|experience` | 404 (`LEGACY_API_ENABLED`); publicaban stack técnico y datos internos | `NEXT_PUBLIC_LEGACY_API_ENABLED=true` (no recomendado) |
| Cifras 10+/6+/3+ | Ocultas (`SHOW_UNVERIFIED_FIGURES`) | Cuando haya evidencia |
| Precios US$600/1.500/800, tasa COP/EUR, plazos, 50/50, soporte, «24/7» | Fuera de planes y preguntas frecuentes. Copia original en `PLANS_FULL` / `FAQ_FULL` (`lib/site-content.ts`) | Confirmar cada cifra y condición |
| Casos de clientes: LUFE, Fundación Vida Amor y Salud, SIEPA, Premios La Cima | Ocultos y fuera del sitemap/enlaces (`CASE_PUBLISHED`); su contenido sigue en `data/portfolio.ts` y `lib/site-content.ts` | Permiso escrito de cada cliente → poner el slug en `true` |
| Artículo «¿Cuánto cuesta un sitio web en Colombia?» | `draft: true` (precios sin verificar) | Confirmar precios y quitar `draft` |
| Estadísticas sin fuente y cálculos de retorno en los otros dos artículos | Retirados del texto | Citar fuente si se reponen |

## Base de datos de producción `svbvkgvtjksvjfvigiah` (NO modificada)
- Estado verificado en solo lectura (2026-11-04): 19 tablas, 64 políticas, 1 bucket (`agreement-documents`), 2 usuarios, 1 acuerdo, 0 documentos; `anon` ejecuta los helpers `is_*` y tiene `SELECT` sobre `agreements` (lo que corrige la 003).
- Migraciones pendientes: `202611030001` (formularios; no necesaria para este lanzamiento), `202611030002` y `202611030003` (seguridad del portal). **No aplicadas**: el MCP de producción es de solo lectura y no hay respaldo recuperable garantizado.
- Reversión preparada: `supabase/rollback/202611030002_fix_storage_document_read_rollback.sql` (política original capturada de producción) y `supabase/rollback/202611030003_harden_privileges_rollback.sql`. La de la 003 está cubierta por `tests/hardening-db.test.ts`; la de la 002 es nueva y **no se ha probado contra una base de datos** (probarla en staging antes de depender de ella).
- **Antes de aplicar 002/003** (en SQL Editor, cada archivo en una ejecución y en orden): (1) Dashboard → Database → Backups: confirmar uno reciente, o descargar volcado; (2) ejecutar `supabase/verification/intake_state_readonly.sql` y guardar el resultado; (3) aplicar `002`, `003`; (4) repetir la consulta de solo lectura (bloques 11–13); (5) activar el portal con la variable de entorno **solo en Preview** primero y repetir `verify-portal.mjs` contra una copia/staging; (6) solo entonces en producción.
- Orden de despliegue recomendado cuando se active el portal: migraciones → variables de Vercel Production (`NEXT_PUBLIC_SUPABASE_URL` y clave del proyecto `svbvk…`, `SUPABASE_SERVICE_ROLE_KEY` solo servidor) → `NEXT_PUBLIC_PORTAL_ENABLED=true` → redeploy.

## Proyecto histórico `qhfovdpuypnqudrtxpbe` (pendiente de inventario)
El sitio anterior (despliegue del 2026-06-05, commit `08ab73a`) se conectaba a este proyecto. **No se tocó, no se borró y no se migró nada.** Las variables de Vercel Production siguen apuntando a él; el sitio 1.0 no las usa. Cuando vuelva a ser accesible, comprobar:
1. Tablas existentes y sus filas (`leads`, `testimonials` y cualquier otra) y fechas del último registro.
2. Si hay solicitudes (nombre/correo/teléfono) sin responder: exportarlas a CSV **fuera del repositorio** y atenderlas.
3. Testimonios aprobados: ¿tienen autorización para volver a publicarse? ¿hay archivos asociados en Storage (avatares, imágenes, videos)?
4. Si el proyecto sigue activo (plan, facturación, pausas por inactividad en el plan gratuito) y quién tiene acceso.
5. Políticas RLS y claves expuestas: la clave publicable del sitio antiguo sigue pública en versiones previas; revisar si debe rotarse.
6. Decisión: archivar/exportar y cerrar, o migrar datos legítimos a `svbvk…` con la `001` (nunca copiando datos sin autorización de tratamiento).

## Pendientes tras 1.0
Política de privacidad y autorización → reactivar formularios (aplicar `001`) · confirmar precios/plazos/condiciones · permisos de clientes para sus casos · cifras con evidencia · portal (migraciones 002/003, respaldo, Auth: registro público cerrado, Site URL/Redirect/SMTP) · correo público `joshua@deepsunstudio.com`: confirmar que el buzón existe (sigue visible en contacto y pie) · token de Search Console (`NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`) · CAPTCHA/notificación de solicitudes al reactivar formularios.

## Verificación
`npm run check` (typecheck + lint + 90 pruebas) · `npm run build` · `scripts/launch/smoke.mjs` (Edge, escritorio y móvil: 160 comprobaciones — rutas 200, rutas ocultas 404, sin `<form>`, sin enlaces al portal, solo WhatsApp oficial, sin afirmaciones retiradas, sin desbordes horizontales, sin errores de consola, 0 peticiones a Supabase, sitemap solo con lo publicado).
