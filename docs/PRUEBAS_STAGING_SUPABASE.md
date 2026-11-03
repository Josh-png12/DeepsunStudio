# Pruebas que requieren un entorno real de Supabase (staging)

Todo lo validado hasta ahora usó un **servidor falso local** (`docs/qa/mock-supabase.js`): sirve para estados de interfaz, **no** prueba RLS, esquema, buckets ni red real. No ejecutar nada de esto contra producción.

## Preparación
- Proyecto Supabase **de staging** (no el de producción) con el esquema de `leads` y `testimonials`, y los buckets `testimonial-avatars`, `testimonial-results`, `testimonial-videos`. Estas tablas/buckets **no están en `supabase/migrations`** del repo: documentar o versionar su esquema real.
- `.env.local` (no versionado) con `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` del staging y `NEXT_PUBLIC_WHATSAPP_NUMBER` de prueba. Nunca la `service_role` en el navegador.

## Checklist
| # | Prueba | Resultado esperado |
|---|---|---|
| 1 | Insertar desde `/contacto` (5 pasos) como usuario anónimo | 201; fila en `leads` con `business_type`, `needs[]`, `budget`, `timeline`, `name`, `email`, `whatsapp?`, `message?` |
| 2 | Insertar desde el formulario rápido de portada | Fila aceptada con `business_type:'otro'`, `needs:['asesoria']`, `budget:'no_se'`, `timeline:'explorando'` (valores neutros; confirmar que no violan CHECK/NOT NULL) |
| 3 | Anónimo intenta `SELECT`/`UPDATE`/`DELETE` en `leads` | Denegado por RLS (solo insertar) |
| 4 | Enviar una reseña con y sin archivos | Fila en `testimonials` con `approved=false`; archivos en los tres buckets |
| 5 | Anónimo lee `testimonials` | Solo filas con `approved=true`; nunca las pendientes |
| 6 | Subir `.exe`, archivo >2/5/50 MB, o MIME no permitido directamente al bucket (sin pasar por la UI) | Rechazo del lado servidor (el cliente solo valida tamaño/tipo; el bucket debe imponer los suyos) |
| 7 | Anónimo intenta `UPDATE` de `approved`/`featured` | Denegado |
| 8 | Aprobar una reseña desde el panel administrador | Aparece en el carrusel; imagen y video públicos cargan |
| 9 | Spam: >20 envíos seguidos con el mismo origen | Definir límite a nivel de base de datos/edge (hoy solo hay honeypot, tiempo mínimo y espera de 20 s en el navegador) |
| 10 | Caída de red a mitad de subida | Mensaje de error, sin fila huérfana y sin archivos sin referencia (revisar limpieza en bucket) |
| 11 | `/portal/**` con usuarios reales (admin / inversionista) | Sin cambios respecto a `origin/main`: login, roles, RLS, documentos |

## Otras configuraciones antes de producción
`NEXT_PUBLIC_WHATSAPP_NUMBER` (hoy ningún botón de WhatsApp se muestra), `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`, fuente de tasas COP/EUR, confirmación de cifras y plazos (`docs/AUDITORIA_AFIRMACIONES.md`).
