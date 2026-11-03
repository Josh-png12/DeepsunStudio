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
