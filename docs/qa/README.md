# QA de la web pública (herramientas locales)

Scripts usados en la auditoría. **No son dependencias del proyecto**: instálalas en una carpeta temporal.

```bash
npm i playwright-core pixelmatch@5 pngjs axe-core   # en una carpeta aparte
```

- `mock-supabase.js` — Supabase **falso** en `localhost:54399` (`/__set?t=data|empty|error|slow&l=ok|fail&s=ok|fail`). Sirve para ver estados de UI; **no valida RLS, buckets ni esquema reales**.
- `visual.js` — compara el prototipo v02 con la implementación (capturas + diferencia de píxeles del hero a 320/375/768/1440/1920).
- `audit.js` — carrusel (scroll suave / movimiento reducido), orden de foco y axe-core en todas las rutas.
- `text.js` — diferencia de cadenas visibles ES/EN entre v02 y la implementación.

Compilación de prueba: `NEXT_PUBLIC_SUPABASE_URL=http://localhost:54399 NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=test NEXT_PUBLIC_WHATSAPP_NUMBER=570000000000 npm run build`.

`docs/comparacion/v02/integral-reconstruccion.html` es una **reconstrucción** del prototipo v02 hecha a partir de su lectura (el archivo original no estaba en disco): no sustituye al original.
