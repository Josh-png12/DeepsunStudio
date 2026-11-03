# Auditoría visual y funcional — rediseño público

Referencia usada: `Downloads/index.html` (v. 01, el original). `deepsun_propuesta_integral.html` **sigue sin aparecer en disco**: lo añadido por el prototipo integral (testimonios, planes, FAQ, blog, filtros, modal de reseña) no se pudo comparar con su archivo original; se verificó solo contra la transcripción del CSS.

Método: servidor estático local con la referencia y `next start` con la implementación, ambos en el mismo navegador, midiendo estilos computados y geometría de secciones a 320, 375, 768, 1440 y 1920 px, más capturas (`docs/comparacion/`). Las capturas del panel se volvieron inestables al final, por lo que la evidencia de 320/375/1920 es numérica, no gráfica.

## Diferencias prototipo → implementación

| # | Diferencia | Estado |
|---|---|---|
| 1 | Marca 25 px / isotipo 38 px (referencia: 24 / 37) | Corregido |
| 2 | Nav: 10 px, interletrado .05em, separación 29 px (ref.: 11 px, .06em, 35 px); CTA 12×14 → 12×15, gap 18 | Corregido |
| 3 | `.tiny` .12em → .13em; etiqueta de sección .12em → .14em; botón gap 27→32, interletrado .025→.045em, hover −3 px | Corregido |
| 4 | Foco 2 px/4 px (ref.: 3 px/5 px); además una segunda regla en `ds-pages.css` lo pisaba | Corregido |
| 5 | Padding del hero 155/65 → 154/66; `intro` p máx. 560 → 550 | Corregido |
| 6 | `section-top` h2: interlineado .94 → .93, interletrado −.078 → −.079em, mínimo 62→65 px; margen inferior 68→70; texto lateral 280→260 px con margen 13 px | Corregido |
| 7 | Proyecto: padding inferior 85→90, párrafo 320→300 px, enlace .07em, contador .15em | Corregido |
| 8 | Método: interlineado de `h3` (normal) | Corregido |
| 9 | Indicador «scroll» posicionado absoluto a la derecha (ref.) en lugar de en línea | Corregido |
| 10 | Menú móvil a `top:77px; left/right:15px` (ref.), hero móvil: mín. 57 px, −.092em, número en `bottom:38px`, disponibilidad 128 px | Corregido |
| 11 | Punto de quiebre ≤1050 px del original (hero 780, sol, proyecto 1/1.3 columnas, servicios) no existía | Corregido (y reordenado: al principio quedó después del bloque móvil y lo pisaba) |
| 12 | Proyectos y filas de servicio colapsaban a ≤940 px (ref.: ≤700 px y 45 px de primera columna) | Corregido |
| 13 | Desbordes a 320 px en títulos largos EN («FOUNDATION») y pistas de grilla sin `minmax(0,1fr)` | Corregido |
| 14 | Negrita perdida en `h3` de plan/artículo (preflight de Tailwind) | Corregido |
| 15 | Menú móvil se desplazaba (`overflow-x:hidden` en `.ds`) | Corregido (`clip`) |
| 16 | Etiqueta del hero «VOL. 02» (ref. original: «VOL. 01») | Pendiente de decidir (viene del prototipo integral) |
| 17 | Menú hamburguesa hasta 940 px (ref.: 700 px) | Intencional: hay 5 enlaces + ES/EN + CTA y no caben en 768 px |
| 18 | Contenido añadido: filtros, testimonios, planes/FAQ, blog, bloque «formulario completo», enlaces del pie (+~38 px en pie, +~10 px en contacto) | Intencional (integral) |
| 19 | Enlaces «Explorar el caso» a rutas reales en lugar de «Conversemos sobre algo similar» | Intencional |

Resultado a 1440 px: alturas idénticas en hero (887), título (396), sol (893), frase de introducción (353), proyecto (695), cabecera de servicios (339), proceso (236) y método (1050). La fila «Software a medida» difiere en 75 px solo por la barra de desplazamiento (11 px más de ancho útil en la referencia).

## Auditoría funcional

Backend de prueba: servidor falso local (`localhost`, sin red ni datos reales), compilación con `NEXT_PUBLIC_SUPABASE_URL` apuntando a él. Nada se envió a Supabase real.

| Prueba | Resultado |
|---|---|
| Carrusel — con datos (3 tarjetas, región `carousel`, 2 botones) | OK; desplazamiento instantáneo OK. **El desplazamiento suave por botón no avanzó en este panel; no confirmado** |
| Carrusel — vacío | OK (estado vacío honesto) |
| Carrusel — error 500 | OK (`role=alert`, sin vacío falso) |
| Carrusel — cargando (4 s) | OK («Cargando opiniones…», sin vacío falso) |
| Supabase no configurado | Estado de error; antes la portada entera caía (corregido) |
| Formulario rápido — backend falla (401 RLS) | Mensaje de error, datos conservados, sin éxito |
| Formulario rápido — backend OK | Éxito solo tras 201; carga útil correcta; reenvío inmediato bloqueado |
| Formulario de 5 pasos — correo inválido / backend falla / OK | Error de validación / error y se queda en el formulario / éxito tras 201; carga útil correcta |
| Reseñas — mensaje corto / backend falla / OK | Validación / error sin éxito / éxito; fila con `approved:false` |
| Diálogo — foco entra, Tab atrapado, Escape cierra y devuelve foco al botón | OK |
| Teclado — enlace de salto, orden de tabulación, menú móvil (abrir/Escape/foco) | OK |
| `prefers-reduced-motion` | Reglas presentes y acotadas a `.ds` (no ejecutado con emulación real) |
| Enlaces internos (40 `href` únicos de 15 rutas) | Todos 200; `/portal` 307 → login (esperado) |
| ES/EN — 8 rutas con textos y atributos | Sin textos en español visibles salvo artículos del blog (solo ES, con aviso; ahora con `lang="es"`) |
| WhatsApp sin `NEXT_PUBLIC_WHATSAPP_NUMBER` | Ningún enlace `wa.me` ni botón flotante |

## Pendiente

- Verificar contra el archivo `deepsun_propuesta_integral.html` (no encontrado).
- Elegir «VOL. 01» o «VOL. 02».
- Smooth scroll del carrusel en un navegador real; reduced-motion con emulación real.
- Subida de archivos de la reseña (buckets) no probada.
- Fuentes Fontshare/JetBrains del layout raíz siguen cargando en páginas públicas (las usa el portal).
- Esquema real de `leads` y número de WhatsApp (ver `docs/REDISENO_PUBLICO.md`).

---

# Ronda 3 — contra el prototipo v02 (referencia principal)

**Limitación:** `deepsun_propuesta_integral.html` no apareció en disco en ninguna ronda. Se comparó contra `docs/comparacion/v02/integral-reconstruccion.html`, una **reconstrucción hecha por mí desde la lectura original** (CSS transcrito, marcado y textos). Detecta errores del port a React y de mis añadidos, **no** errores de transcripción. Hay que repetir la verificación cuando el archivo original esté disponible. `index.html` (v01) queda como referencia histórica; las alineaciones hechas a v01 en la ronda 2 que contradecían v02 se revirtieron.

## Diferencias entre v02 y la implementación

| # | Diferencia | Estado |
|---|---|---|
| 1 | Métricas alineadas a v01 (nav 11 px, marca 24 px, interletrados, quiebre ≤1050, foco 3/5 px…) distintas de v02 | Revertido: `ds-base.css` regenerado desde el CSS exacto de v02 |
| 2 | v02 depende de márgenes e interlineado por defecto del navegador que el preflight de Tailwind anula (`p` 1em, `line-height: normal`) | Corregido (`.ds{line-height:normal}`, `.ds p{margin-block:1em}`) |
| 3 | Precio USD «US$1.500» (es-CO) vs «US$1,500» en v02 | Corregido |
| 4 | Índice del plan 3 «AUTOMATIZAR» vs «03 / AUTOMATIZACIÓN» | Corregido (EN: «AUTOMATION», v02 lo deja sin traducir) |
| 5 | Botón del plan 4 en portada «Solicitar cotización gratuita» vs «Cotizar proyecto» | Corregido (en /servicios se conserva el texto largo) |
| 6 | Fecha de artículos «MAR DE 2026» vs «MAR 2026» | Corregido |
| 7 | Pie en EN: «Journal» vs «Blog» | Corregido |
| 8 | Barra de desplazamiento oscura de 4 px del CSS global antiguo | Corregido (estándar, como v02) |
| 9 | **Estilos azules antiguos filtrados en los artículos** (`.blog-prose` de `globals.css`: texto `#94a3b8`, viñetas azules; contraste 2,25:1) | Corregido (clase renombrada `ds-prose`) |
| 10 | Texto pequeño bajo 4,5:1 (`price-note` 4,33; `contact-mini small` 3,98; varios míos sobre arena ~4,2; coral pequeño) y coral sobre arena (2,7:1) en `/studio` | Corregido con tonos más oscuros del mismo matiz |
| 11 | axe: botón de WhatsApp fuera de landmark; orden de encabezados en `/proyectos` y `/blog`; campos de formulario con foco solo por color | Corregido |
| 12 | Nombres de herramientas en el texto de solución de dos casos (Python/BeautifulSoup/Selenium; JWT/bcrypt) | Neutralizado en `data/portfolio.ts` sin cambiar el sentido |
| 13 | Texto de «sin testimonios», intro de planes, nota de precios, contacto y formulario: v02 usa notas internas de prototipo («vista previa», «en producción…») | Intencional: copia de cara al cliente |
| 14 | FAQ: v02 4 preguntas parafraseadas; implementación 6 reales; enlace «Ver detalle de cada plan» | Intencional |
| 15 | Títulos/descripciones de artículos: v02 resumidos; implementación reales | Intencional |
| 16 | Textos dentro de las ilustraciones: v02 los deja en español en EN; implementación los traduce | Intencional (mejora) |
| 17 | «Ir al contenido» / «MENÚ» sin traducir en v02 EN | Intencional (traducidos) |
| 18 | Nav en hamburguesa hasta 940 px, filtros, modal con campos extra (empresa, cargo, archivos), formulario real en vez de `mailto:` | Intencional / funcional |

Mantenido: `DEEPSUN / VOL. 02 — 2026`.

**Medición.** Hero: 0,05–0,21 % de píxeles distintos a 320/375/768/1440/1920 px (solo antialiasing y unos px del texto vertical «scroll»). Alturas de sección idénticas a v02 a 1440 y 768 px (hero, franja, intro, trabajo, testimonios, método, pie); 40 selectores comparados (fuente, peso, interletrado, interlineado, color, fondo, espaciado): idénticos salvo texto distinto. Testimonios y planes (1440 y 375): visualmente idénticos salvo copy.

## Pruebas completadas en navegador real (Edge headless + Supabase **falso**)

| Prueba | Resultado |
|---|---|
| Scroll suave del carrusel | Gradual (226 → 366 → 386 px) |
| `prefers-reduced-motion: reduce` | Scroll instantáneo; marquee `none`; pulso 0,01 ms; `html` `scroll-behavior:auto` |
| Foco por teclado (69 paradas en portada) | Todas con indicador visible; orden lógico |
| axe-core (wcag2a/2aa/21aa + best-practice) | 0 violaciones en 9 rutas ES, 3 EN y el diálogo de reseña |
| Subida de archivos de la reseña | >2 MB y tipo no permitido rechazados en cliente; 3 subidas a `testimonial-avatars/-results/-videos` y URLs guardadas; si la subida falla: error, formulario intacto y **sin** fila insertada |
| Ninguna sección/lista de lenguajes o frameworks | Confirmado en las 12 rutas públicas |

## Qué NO está validado (un servidor falso no es una integración real)

Requiere un **staging real de Supabase**:
- RLS e inserción real en `leads` y `testimonials` (esquema, columnas NOT NULL y restricciones: el formulario rápido envía `business_type:'otro'`, `needs:['asesoria']`, `budget:'no_se'`, `timeline:'explorando'`).
- Buckets `testimonial-*` reales: permisos, tamaño máximo, tipos MIME, política de lectura pública y moderación (`approved=false` visible solo para admin).
- Lectura real de `testimonials` con `approved=true`; imagen y video públicos en el carrusel.
- Variable `NEXT_PUBLIC_WHATSAPP_NUMBER` (número aún sin confirmar; hoy no se muestra WhatsApp).
- Fuente de tasas COP/EUR; cifras 10+/6+/3+; JSON-LD con teléfono y tecnologías; fuentes del layout raíz que usa el portal.
- Contra el archivo original de v02 (ver limitación).
