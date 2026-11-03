# Inspección de solo lectura de producción (SQL Editor de Supabase)

**Objetivo:** saber cómo están hoy `leads`, `testimonials` y los buckets, sin cambiar nada y sin ver datos personales.
**Requiere autorización del titular.** Esta guía no ejecuta nada por sí misma.

## Qué garantiza el archivo `supabase/verification/intake_state_readonly.sql`
- Solo contiene `SELECT` (sobre catálogos del sistema, o `COUNT/MIN/MAX` sobre nuestras dos tablas). Sin `INSERT/UPDATE/DELETE/DDL`, sin `SET`, sin funciones con efectos secundarios (solo `count`, `min`, `max`, `string_agg`, `current_setting`).
- Nunca selecciona nombres, correos, teléfonos, mensajes, notas ni URLs. Lo más «personal» que devuelve son fechas de creación mínima/máxima y recuentos.
- Lo comprueba una prueba automática (`tests/readonly-sql.test.ts`): solo-SELECT, lista blanca de funciones, sin columnas personales, y ejecución real dentro de `BEGIN READ ONLY` sobre una base con el estado antiguo y otra migrada, verificando que nada cambia.
- Límite honesto: es una garantía de *este archivo*. Si alguien lo edita, vuelva a ejecutar `npm test`.

## Cómo ejecutarlo con seguridad
1. Supabase Dashboard → proyecto **de producción** → **SQL Editor** → *New query*.
2. Pegue **un bloque numerado cada vez** (0 a 10). Para cada uno escriba antes `BEGIN READ ONLY;` y después `ROLLBACK;` (en el mismo editor). Con eso Postgres rechaza cualquier escritura aunque el texto se hubiera alterado.
3. Bloque 0: confirme `transaction_read_only = on`.
4. Bloque 1: si falta una tabla, **omita** los bloques que la mencionan (darían error, no daño).
5. No pulse «Run» sobre otros scripts del editor. No use «Save/Share snippet» con resultados.
6. Copie los resultados (texto, no capturas con datos) y compártalos. Los bloques 1–8 y 10 solo contienen metadatos; el 9 solo recuentos.

## Qué compartir y qué NO
| Compartir | No compartir |
|---|---|
| Resultados de los bloques 0–10 | Contenido de filas de `leads` / `testimonials` |
| Versión de Postgres | Claves (`anon`, `service_role`, JWT secret), contraseñas |
| Nombre de políticas y roles | URL completa de archivos subidos por clientes |

## Cómo leer los resultados (señales de alarma)
| Bloque | Señal de alarma | Significa |
|---|---|---|
| 1 | `rls_enabled = false` en `leads` o `testimonials` | Cualquiera con la clave pública puede leer/modificar toda la tabla |
| 3 | Política con `roles` que incluye `public`/`anon` y `cmd` = `ALL`, `SELECT`, `UPDATE` o `DELETE` sobre `leads` | Los contactos son públicos o editables |
| 3 | `UPDATE` sobre `testimonials` para `anon`, o `SELECT` sin condición `approved` | Pueden auto-aprobarse o verse reseñas pendientes |
| 4–5 | `anon` con `SELECT`/`UPDATE`/`DELETE` en `leads` | Igual que arriba (aunque haya RLS, es mala defensa en profundidad) |
| 7 | Bucket sin límite de tamaño / sin `allowed_mime_types` | Subidas ilimitadas |
| 8 | Políticas de Storage `FOR ALL` para `public/anon` | Cualquiera podría borrar o sobrescribir archivos |
| 10 | Cualquier recuento > 0 | La migración dejará esas filas sin tocar; limpie antes de `VALIDATE CONSTRAINT` |
| 2 | Columnas distintas a las esperadas | La migración abortará a propósito (guarda de deriva de esquema): enviar el resultado para adaptarla |

Si el bloque 3/4 muestra una señal de alarma, **no es una emergencia que justifique cambiar producción de inmediato sin plan**: avise para decidir un cierre mínimo (`ALTER TABLE … ENABLE ROW LEVEL SECURITY`) con copia de seguridad previa.
