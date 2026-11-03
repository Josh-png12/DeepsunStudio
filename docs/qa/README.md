# QA de la web pública (herramientas locales)

Scripts usados en la auditoría. **No son dependencias del proyecto**: instálalas en una carpeta temporal.

```bash
npm i playwright-core pixelmatch@5 pngjs axe-core   # en una carpeta aparte
```

- `mock-supabase.js` — Supabase **falso** en `localhost:54399` (`/__set?t=data|empty|error|slow&l=ok|fail&s=ok|fail`). Sirve para ver estados de UI; **no valida RLS, buckets ni esquema reales**.
- `visual2.js` — compara el **prototipo v02 original** (`design-reference/deepsun_propuesta_integral.html`, servido en `localhost:3200`) con la implementación: capturas por sección y diferencia de píxeles (pixelmatch), ES/EN y varios anchos.
- `axe2.js` — axe-core (wcag2a/2aa/21a/21aa/22aa + best-practice) en todas las rutas, ES/EN, 1440/375 px, con diálogo de reseña, menú móvil, FAQ abierta y formulario con error.
- `audit.js` — carrusel (scroll suave / movimiento reducido) y orden de foco.
- `text.js` — diferencia de cadenas visibles ES/EN entre v02 y la implementación.
- `portal.js` — compara `/portal/*` público entre `origin/main` (puerto 3300) y la rama (puerto 3100): píxeles, reglas `.ds`, fuentes, robots.
- `seo-check.js` — título, canonical, Open Graph, robots, hreflang y JSON-LD emitidos por ruta.

Compilación de prueba: `NEXT_PUBLIC_SUPABASE_URL=http://localhost:54399 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=test NEXT_PUBLIC_WHATSAPP_NUMBER=573246183318 npm run build`.

- `forms.js` — prueba en Edge real de los tres formularios con cada respuesta posible del servidor (error, límite `DS002/DS003`, valor inválido, duplicado `DS001`, éxito) y de la carga útil enviada. Usa `mock-supabase.js` (`/__set?l=ok|fail|dup|rate|paused|invalid`).
- Pruebas de base de datos (en `tests/`, parte de `npm test`): `intake-db.test.ts`, `portal-rls-db.test.ts`, con `tests/support/db.ts` (Postgres local PGlite que imita roles, `auth.*`, `storage` y permisos por defecto de Supabase).
