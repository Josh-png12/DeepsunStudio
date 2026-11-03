# Registro de afirmaciones comerciales, cifras y precios (web pública)

Criterio: la web no debe afirmar resultados, cifras ni compromisos que el repositorio no respalde. Lo que viene del sitio anterior se conserva **marcado como «por confirmar por el titular»**; los resultados cuantificados sin evidencia se retiraron del texto público (el original queda aquí para restaurarlo si se demuestra).

## Retirado del texto público (resultados cuantificados sin evidencia)

| Dónde | Texto anterior (ES) | Ahora |
|---|---|---|
| Caso SIEPA — resultado | «Tiempo de generación de reportes reducido de días a segundos. Inconsistencias de datos eliminadas por completo.» | Describe lo construido (sistema centralizado, reportes automatizados, paneles en tiempo real) sin cifras |
| Caso Scraper App GUI — resultado | «Reduce el tiempo de recolección de datos más del 90 %…» | Cualitativo: reemplaza copiar y pegar manual por recolección automatizada y programada |
| Caso ms-usuarios — resultado | «integrable… en menos de una hora, con seguridad de nivel empresarial» | Servicio reutilizable con autenticación y control por roles |
| Caso LUFE — descripción | «sitio web comercial de alta conversión» | «sitio web comercial» |
| Meta de `/contacto` | «Respondemos en menos de 24 horas…» (compromiso de plazo) | Sin plazo |
| Meta/JSON-LD globales | Horario Lu-Vi 8–18, rango de precios `$$`, monedas aceptadas, código postal, coordenadas, teléfono, buscador del sitio, perfiles sociales personales, «Next.js/React developer», `knowsAbout` con tecnologías | Eliminados |
| Textos de casos | Python, BeautifulSoup, Selenium, JWT, bcrypt, «full-stack» | Redactado sin nombres de herramientas |

Aún no quitado: `data/portfolio.ts` conserva `stack`, experiencia y habilidades **solo como datos internos** (no se renderizan).

## Se conserva, por confirmar por el titular

| Afirmación | Dónde | Origen / estado |
|---|---|---|
| 10+ proyectos, 6+ clientes, 3+ años | Portada y `/studio` | Cifras ya publicadas en el sitio anterior y en `data/portfolio.ts` (`stats`). Sin evidencia independiente. Se rotulan «indicados/declarados» |
| Precios US$600 / US$1,500 / US$800 / a cotizar | Portada y `/servicios` | Valores del código anterior (`app/servicios`). Confirmar vigencia |
| Equivalencia 1 USD = 4.200 COP = 0,92 EUR | `/servicios` | Tasa fija heredada, rotulada «aproximada, pendiente de verificar». No hay fuente de cambio |
| Entregas 7–10 y 15–20 días; 3–4 meses para software; 50 % / 50 % de pago; soporte post-entrega; 1 mes de soporte | `/servicios`, FAQ | Condiciones del sitio anterior. Confirmar que siguen vigentes |
| «Respuestas automáticas 24/7» (plan Automatización) | `/servicios` | Característica del plan anterior |
| Casos «Cliente real» (LUFE, Fundación, SIEPA —institución confidencial—, Premios La Cima) | Proyectos | Datos del repo. Confirmar permiso de cada cliente para mostrarlos |
| Estadísticas dentro de los artículos del blog (p. ej. porcentajes de consumidores/búsquedas móviles, «20 horas semanales») | `/blog/*` | Contenido editorial del titular, sin fuente citada. Revisar o citar fuente |
| Diseño «accesible», «cumple estándares» en la descripción de la Fundación | Caso Fundación | Texto del repo; la implementación pública del cliente no se auditó aquí |

## Reseñas
No hay reseñas ficticias. Con 0 aprobadas se muestra un estado vacío. Datos de prueba solo existen en el servidor falso local (`docs/qa/mock-supabase.js`) y nunca en el código desplegable.

## Ilustraciones
Las composiciones de proyectos son «reinterpretaciones conceptuales» y así se rotulan; no son capturas de los productos.
