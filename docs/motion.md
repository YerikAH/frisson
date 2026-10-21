# Movimiento de Frisson

El sistema usa GSAP, ScrollTrigger y Flip. Conserva los textos en Astro y los estilos finales visibles sin JavaScript. No modifica los metadatos, datos estructurados, sitemap ni robots.

## Organización y ciclo de vida

- `src/scripts/motion-sections.ts`: entradas acotadas por sección, fotografías, líneas y pequeños movimientos decorativos.
- `src/scripts/motion.ts`: interacciones, menú, acordeones, diálogos nativos, confirmaciones, filtros y actualización de ScrollTrigger.
- `src/scripts/motion-whatsapp.ts`: oculta el contacto flotante durante las dos primeras secciones, lo muestra después y vuelve a ocultarlo al subir; conserva el foco y respeta movimiento reducido.
- `src/scripts/site.ts`: mantiene el estado funcional de selección, búsqueda, variedades, delivery y formularios. Actualiza conjuntamente los datos de cada variedad después de decodificar la fotografía; un contador de solicitudes descarta respuestas anteriores.
- `src/components/ScrollHeader.tsx`: la isla React conserva sus excepciones de teclado, menú y diálogos. GSAP en esta isla es el único responsable de la posición del header.

Cada sección usa `gsap.context()` y se revierte al cambiar las condiciones de `gsap.matchMedia()`. Las interacciones se registran en un contexto de página y se completan antes de cambiar de preferencia o de tamaño, evitando dejar controles a medio abrir. Los listeners usan `AbortController`; la limpieza se ejecuta en `astro:before-swap` y `pagehide`, y se reconstruye al volver desde la caché de navegación.

Las entradas se disparan una vez por visita cuando el elemento alcanza el 85 % de la pantalla. Se conserva el registro de elementos ya presentados al cambiar de tamaño. El foco completa una entrada activa; en el formulario desplegable, enfocar un campo termina su expansión para poder escribir inmediatamente.

## Dirección aplicada

| Área              | Movimiento                                                                                                                                                                                |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Header            | Logo de 8 px; enlaces e iconos separados 50 ms; posición animada por la isla React; menú móvil de pantalla completa con cortina de 550 ms y enlaces superpuestos.                         |
| Portada           | Secuencia superpuesta de 1,35 s; título de 22 px; ramo temprano de 24 px y escala 0,98; tarjetas móviles al entrar en pantalla; máscara del hilo que conserva el punteado.                |
| Valores           | Texto de 8 px separado 60 ms y dos líneas de izquierda a derecha.                                                                                                                         |
| Colección         | Encabezado, título y enlace; fotografías de 24 px dentro de sus óvalos; acercamiento máximo 1,03 en hover o foco; selección accesible con teclado y táctil.                               |
| Declaración       | Ramo de 16 px; tres líneas durante 800 ms; firma, línea desde el centro y giro breve de la estrella.                                                                                      |
| Variedades        | Título y pestañas; foto y descripción; salida de 160 ms, decodificación y actualización conjunta, entrada de 240 ms. Fotografía y texto tienen espacio reservado.                         |
| Personalizados    | Título y apoyo separados 100 ms; línea y control; expansión de 350 ms y giro de 45 grados.                                                                                                |
| Historia          | Foto de escala 1,03 a 1 dentro del arco; textos separados y pausa en la definición.                                                                                                       |
| Journal           | Encabezado antes de fotos; secuencia de 90 ms; leyendas de 6 px; zoom 1,03 e icono con giro breve. Videos conservan controles y reproducción voluntaria.                                  |
| Proceso           | Título, líneas y contenido de cada paso, con separación de 100 ms y números completos.                                                                                                    |
| Delivery          | Bloque de 16 px y secuencia de unos 600 ms; selector disponible durante la entrada y actualización inmediata de su mensaje.                                                               |
| Preguntas         | Entrada discreta y respuestas independientes de 280 ms; aperturas y cierres parten de la altura actual.                                                                                   |
| Cierre            | Líneas separadas 120 ms, descripción y botón con respuesta de color y elevación.                                                                                                          |
| Footer y WhatsApp | Columnas de 10 px; logo completo; WhatsApp de 0,96 a 1 una vez, después de las dos primeras secciones; oculto al volver arriba y durante diálogos.                                        |
| Diálogos          | `showModal()` antes de animar; selección lateral en escritorio e inferior en móvil; búsqueda, galería y resumen con entrada breve; `close()` tras 200 ms, Escape y recuperación del foco. |
| Interiores        | Flip de 500 ms al filtrar; ficha con foto antes del texto; historia y contacto reutilizan secciones; formularios discretos; privacidad, términos y 404 con una sola entrada breve.        |

Solo escritorio, desde 64 rem, añade hasta 20 px al ramo y al encuadre interno de historia, y 16 px a la palabra decorativa del cierre. La portada y los controles conservan sus transformaciones de centrado en contenedores distintos. El punto de corte móvil de la composición es 40 rem. Se mantiene el desplazamiento nativo y la navegación por anclas.

Con movimiento reducido se omiten entradas, parallax, desplazamientos, escalas y transiciones. Los controles cambian de estado directamente. Las posiciones se recalculan tras fuentes, imágenes, filtros y acordeones.

## Verificación

```sh
npm run verify
npx playwright install chromium # solo la primera vez
npm run test:motion
```

El servidor de las pruebas se inicia con `astro dev --background`, como exige AGENTS.md. Si ya existe uno, se reutiliza. Se administra con `astro dev status`, `astro dev logs` y `astro dev stop`. `FRISSON_TEST_URL` permite probar otro servidor ya iniciado.

La suite de navegador incluye escritorio (1440 × 1000) y móvil (390 × 664), clics rápidos, imágenes demoradas o fallidas, pestañas con flechas/Inicio/Fin, acordeones interrumpidos, persistencia y validación de formularios, selección y cantidades con foco estable, filtros y elementos ocultos, delivery, galería, diálogos y Escape, dirección del header, movimiento reducido y su cambio en vivo, contenido sin JavaScript, centrado y desplazamientos de diseño. Las capturas y trazas se guardan en `test-results/` y quedan fuera de Git.

Documentación de referencia: [contextos de GSAP](<https://gsap.com/docs/v3/GSAP/gsap.context()>), [matchMedia](<https://gsap.com/docs/v3/GSAP/gsap.matchMedia()>), [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) y [Flip](https://gsap.com/docs/v3/Plugins/Flip/).

## Transiciones entre páginas y conservación del SEO

La navegación entre páginas utiliza `@view-transition { navigation: auto; }` en un pequeño estilo al inicio del `<head>` del layout, para activarse antes de cargar las hojas externas. El CSS compartido define únicamente el efecto visual. La página saliente se desvanece en 200 ms y la entrante en 300 ms. El navegador sigue solicitando un documento HTML completo por URL; no se interceptan clics, no se introduce un router de cliente y los enlaces siguen siendo elementos `a` con `href` reales. La transición no añade JavaScript ni peticiones adicionales.

Las transiciones nativas se activan en navegadores compatibles. Los demás conservan la navegación habitual y las entradas de sección existentes. Con movimiento reducido se desactivan. Se mantienen los enlaces de ancla, abrir en otra pestaña, el historial del navegador y la navegación sin JavaScript.

La compilación sigue produciendo 15 archivos HTML y 13 URLs canónicas indexables en el sitemap. Se compararon los títulos, metadatos, canonical, encabezados, enlaces y JSON-LD de todos los HTML antes y después del cambio, además de `robots.txt` y ambos sitemaps. El verificador de compilación exige que el contenido principal llegue en el HTML y conserva la comprobación de indexación y recursos.

Las pruebas de `tests/browser/navigation.spec.mjs` comprueban la transición nativa real, la carga de un documento distinto, metadatos correctos al navegar, funcionamiento de búsqueda/filtros/selección tras cambiar de página, movimiento reducido, enlaces sin JavaScript, historial y anclas. Se ejecutan tanto en escritorio como en móvil.

Los sitelinks son automáticos y los decide Google. Se preservan la estructura de URLs, los títulos y los enlaces internos que Google utiliza para entender el sitio; la transición no modifica esas señales. Referencias: [transiciones entre documentos en Astro](https://docs.astro.build/en/guides/view-transitions/#differences-between-browser-native-view-transitions-and-astros-clientrouter-) y [sitelinks en Google Search Central](https://developers.google.com/search/docs/appearance/sitelinks).

## Menú móvil de pantalla completa

El menú utiliza un diálogo nativo con `w-screen`, `h-screen` y altura dinámica `100dvh` cuando está disponible. Se mantiene fuera de la isla del header para no heredar sus desplazamientos. Conserva enlaces HTML, estado `aria-expanded`, cierre con Escape y un botón de cierre siempre accesible. El fondo queda bloqueado y el teclado recorre los controles del menú; al cerrar vuelve al botón de apertura.

GSAP revela el panel con una máscara vertical de 550 ms, el logo con un desplazamiento de 10 px, los nombres con 22 px y una separación de 55 ms, junto a sus números y líneas decorativas. Las animaciones se superponen y terminan en menos de un segundo. El cierre dura 380 ms y parte del estado actual si se interrumpe. Con movimiento reducido, los cambios son inmediatos. Enfocar un enlace completa la apertura para que la navegación con teclado esté disponible sin espera.

El panel conserva un único scroll exterior cuando la pantalla es muy baja, respeta las áreas seguras del móvil y se cierra al cambiar a escritorio. Los enlaces de ancla se ajustan tras el cierre para conservar su destino después de la recuperación del foco del diálogo. Las pruebas cubren 320, 390 y 768 px de ancho, orientación horizontal, interrupciones, foco, Escape, movimiento reducido, cambios de tamaño y navegación entre HTML.
