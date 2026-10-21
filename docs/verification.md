# Validación de Frisson

Revisión realizada el 20 de octubre de 2026.

## Comprobaciones automatizadas

- Astro y TypeScript sin errores, advertencias ni sugerencias.
- Seis pruebas de integridad de la selección, codificación Unicode del mensaje, ausencia de enlaces sin contacto, resumen de varios arreglos, solicitudes sin catálogo y tarifas confirmadas.
- Compilación estática de quince páginas, además de robots y sitemap.
- Referencias internas y recursos del build comprobados por `scripts/verify-build.mjs`.
- `git diff --check` sin errores de espacios.

## Comprobaciones en navegador

- Revisión de escritorio a 1440 × 1000 y móvil a 390 × 844.
- Ningún desbordamiento horizontal en 320, 768, 1024 y 1440 px.
- Menú móvil, navegación al catálogo y filtros por categoría.
- Búsqueda con resultados y sin coincidencias.
- Añadir un producto, conservarlo al navegar al pedido y eliminarlo.
- Formulario vacío bloqueado; solicitud completa con personalización, presupuesto, tarjeta, fecha, horario, zona, destinatario, dirección e indicaciones.
- Resumen previo con los datos completos y copia al portapapeles confirmada.
- Eliminación de los datos de prueba mediante los controles de la propia interfaz.
- Pestañas que cambian contenido y enlace, también con flechas de teclado.
- Consulta de zona sin inventar tarifas, acordeones y ampliación de fotografías.
- Fotografías cargadas correctamente; consola sin errores ni advertencias en la revisión final.
- Inspección visual de todas las secciones de la portada y del formulario móvil.

## Capturas

- `previews/inicio-escritorio.jpg`
- `previews/inicio-movil.jpg`
- `previews/coleccion-escritorio.jpg`
- `previews/personalizacion-movil.jpg`
- `previews/cierre-escritorio.jpg`
- `previews/instagram-escritorio.jpg`
- `previews/instagram-movil.jpg`
- `previews/instagram-coleccion.jpg`
- `previews/hero-sin-fondo-escritorio.jpg`
- `previews/hero-sin-fondo-movil.jpg`
- `previews/sheet-movil.jpg`
- `previews/whatsapp-escritorio.jpg`
- `previews/whatsapp-movil.jpg`
- `previews/whatsapp-final.jpg`
- `previews/hero-piel-escritorio.jpg`
- `previews/hero-piel-movil.jpg`
- `previews/hero-piel-final.jpg`
- `previews/tailwind-escritorio.jpg`
- `previews/tailwind-movil.jpg`

## Integración del Instagram oficial

- Perfil público `https://www.instagram.com/frisson.pee/` consultado en navegador y enlazado desde la web.
- Cinco fotografías públicas convertidas a WebP sin ampliación ni recreación generativa; fuentes y dimensiones en `instagram-images.json`.
- Portada con un recorte PNG transparente derivado de una foto de Frisson. Cuatro ramos destacados, historia, tres pestañas de variedades y galería con fotos reales. Maceteros y floreros conservan referencias ilustrativas identificadas.
- Paleta ajustada a piel claro, kraft, madera y verde bosque, conservando el aumento de tipografía solicitado.
- Portada inspeccionada en 1440, 768 y 390 px; ausencia de desbordamiento y de recursos rotos comprobada también en 320 y 1024 px.
- Filtro «De temporada» muestra las dos composiciones correspondientes. La ficha «Un poquito de sol» usa su foto real y enlaza a la publicación de origen.
- La galería amplía la fotografía elegida y conserva el enlace a su publicación.
- Las publicaciones individuales requieren iniciar sesión en Instagram; se utilizaron las fotografías ya accesibles desde el perfil público. No se inició sesión ni se enviaron mensajes.

## Hero con transparencia

- `hero-frisson-sin-fondo.png` conserva alfa real entre 0 y 255, con una variante de 450 px para móvil.
- Retirados el fondo fotográfico, la mano de soporte y el marco redondeado; el ramo completo se presenta con `object-fit: contain`.
- Edición realizada con ImageGen; prompt y fuente en `hero-cutout.json`.

## Transiciones y WhatsApp

- Diálogos con fundido y desplazamiento de 260–360 ms, incluyendo la salida del elemento y su fondo oscurecido. Se comprobó que el panel sigue visible durante la transición de cierre antes de ocultarse.
- Selección lateral en escritorio y sheet inferior con bordes redondeados en móvil, sin desbordamiento horizontal.
- Menú, acordeones de preguntas y formulario personalizado con transiciones de apertura y cierre. Verificados los cambios de altura y el formulario visible.
- Escape cierra la búsqueda y devuelve el foco al botón que la abrió; el campo de búsqueda recibe foco al abrirse. Menú móvil comprobado con Escape.
- Las transiciones de diálogos, fondos y acordeones respetan `prefers-reduced-motion`.
- Botón flotante con enlace `https://wa.me/51903235318`, mensaje de consulta codificado y área segura inferior. Revisión en 390 px y 1440 px, sin enviar mensajes externos.
- `npm run verify`: 0 errores, advertencias o sugerencias, 6 pruebas aprobadas, 15 páginas y 636 referencias locales verificadas.

## Ramo más alto y fondo piel

- Hero con más altura: imagen de 735 px en escritorio y escalas adaptadas a móvil, conservando la proporción del PNG transparente.
- Fondo principal piel claro `#f4e8df` y franja central `#e7ceba`, con tonos de texto y bordes coordinados.
- Revisados los encuadres de escritorio y móvil; sin desbordamientos ni imágenes rotas en 320, 390, 662, 768, 1024, 1440 y 1920 px.
- Compilación de las 15 páginas y comprobación de 636 referencias locales aprobadas.

## Migración completa a Tailwind CSS 4

- Integración mediante `@tailwindcss/vite`, tema centralizado y orden automático de clases con Prettier.
- Componentes, páginas y contenido dinámico migrados a utilidades. Eliminadas las hojas `base.css`, `home.css`, `commerce.css`, `interactions.css` y `responsive.css`.
- La única entrada, `global.css`, conserva las fuentes y el tema; todas las reglas de base usan `@apply`. No quedan selectores CSS de componentes ni estilos visuales asignados mediante `.style` desde JavaScript.
- En la primera fase, antes de normalizar los tamaños a la escala nativa: comparación de 32 propiedades de estilo en veinte vistas, sin diferencias respecto a las hojas originales.
- Tarjetas relacionadas comprobadas también en 320, 662, 768, 1024 y 1920 px, sin desbordamientos y conservando las alturas de referencia.
- Selección, navegación al pedido, eliminación del producto de prueba, búsqueda, Escape y restauración del foco, menú móvil y cambio de variedad comprobados en navegador. WhatsApp conserva el número oficial y no se envió ningún mensaje.
- Verificación de Astro sin errores, advertencias ni sugerencias; seis pruebas aprobadas, quince páginas compiladas y 636 referencias locales verificadas.

## Escala nativa y variables de tema

- Eliminadas todas las medidas en píxeles de `src/`, incluidos los tamaños arbitrarios de las utilidades. Tipografía, espaciado, radios y separación de letras usan la escala nativa de Tailwind 4; los iconos usan `size-4`, `size-5` y `size-7`.
- Todos los colores se definen exclusivamente en `@theme`, incluidas las variantes de WhatsApp y del pie. Los degradados usan esos colores y modificadores de opacidad. La etiqueta `theme-color` lee el fondo desde la misma fuente.
- Fuentes, sombras y curva de animación centralizadas en el tema. Puntos de corte con nombres; el ajuste `xs` se define en el tema.
- Las tarjetas del hero móvil crecen con el contenido. La etiqueta destacada del catálogo se adapta al ancho disponible.
- Nueve páginas revisadas en tres anchos de pantalla (320, 768 y 1440): 27 vistas sin desbordamiento horizontal ni imágenes rotas. Revisión visual adicional en 390.
- Búsqueda con dos resultados para «lirio», cierre con Escape y restauración del foco, menú móvil y selección de un producto verificados. El producto de prueba se retiró desde la interfaz.
- Capturas: `previews/tailwind-escala-escritorio.jpg` y `previews/tailwind-escala-movil.jpg`.

## Header fijo con isla React

Header ampliado al inicio con `h-32` en escritorio/tablet y `h-28` en móvil. La rama ocupa `h-16`/`h-14` y se oculta al hacer scroll mientras el header pasa a `h-18`/`h-16`, con transición de 300 ms. Al volver arriba se recuperan la rama y la altura inicial. El estado compacto depende del desplazamiento y no de la altura animada, evitando alternancias durante la transición. El espacio inicial del documento permanece constante.

Verificados el inicio y el regreso arriba en escritorio y móvil, el header compacto al subir, la ocultación al bajar y un desplazamiento pequeño que compacta el header mientras sigue visible. Revisadas pantallas de 320, 390 y 1440 sin desbordamientos. En el catálogo el bloque del logo sigue transparente. El menú móvil compacto empieza justo debajo del header (`h-16`). Sin errores ni avisos de consola. `npm run verify` aprobado con 52 archivos Astro, 10 pruebas, quince páginas y 669 referencias locales. Capturas: `previews/header-rama-inicio.jpg`, `previews/header-rama-scroll.jpg`, `previews/header-rama-inicio-movil.jpg` y `previews/header-rama-scroll-movil.jpg`.

Header fijo verificado en escritorio y móvil: ocultación al bajar, aparición al subir, posición visible al inicio, transición de 300 ms y menú móvil anclado debajo del header. La isla React conserva los controles de búsqueda y selección, se mantiene visible con el menú abierto y se recupera al navegar con Tab. Sin errores ni advertencias de consola durante la comprobación de hidratación. Astro revisó 43 archivos sin incidencias; seis pruebas y compilación de quince páginas aprobadas. Capturas: `previews/header-scroll-abajo.jpg` y `previews/header-scroll-arriba.jpg`.

## Iconos de librería

Iconos manuales sustituidos por Lucide para Astro y logo de WhatsApp de Simple Icons. Revisados los cuatro iconos de las tarjetas, navegación, menú móvil, búsqueda y cierre de diálogos; tamaños Tailwind conservados y sin desbordamientos. Astro sin incidencias y quince páginas compiladas. Captura: `previews/iconos-lucide.jpg`.

Retirado «Volver a la colección» de las fichas y sus utilidades de estilo. Sustituidas las flechas de texto restantes en contacto, pedido, páginas legales, 404, footer, búsqueda y selección por SVG de Lucide. Los resultados dinámicos clonan iconos renderizados por Astro desde plantillas; al actualizar el botón de continuar solo cambia su etiqueta y se conserva el SVG. Verificadas la búsqueda con y sin resultados, la selección vacía, la ausencia del enlace en «Jardín de emociones» y los botones de contacto en 1440 y 390, sin errores de consola ni desbordamientos. Ningún enlace a WhatsApp fue abierto. `npm run verify` aprobado: 55 archivos sin incidencias, 10 pruebas, quince páginas y 645 enlaces/recursos comprobados. Capturas: `previews/contacto-flechas-lucide.jpg`, `previews/contacto-flechas-lucide-movil.jpg` y `previews/ficha-sin-volver-coleccion.jpg`.

## Logo de Frisson

Logo reconstruido a partir de la fotografía aportada. Ambas variantes siguen el orden vertical solicitado: rama, `frisson.`, líneas finas con rombo central y `floristería`. Cormorant Garamond Light se sirve localmente con peso real 300, comprobado en el archivo WOFF2 y en los estilos del navegador. La rama PNG conserva el canal alfa y adopta el color de los fondos claros y oscuros mediante máscara. El slogan general de la web se conserva.

Revisados 320, 390, 768 y 1440 sin desbordamientos. El header conserva `h-16`/`h-18` y el logo queda contenido en ambas alturas. Las páginas interiores mantienen transparente el bloque del logo. Sin errores ni avisos en la consola de la vista previa. `npm run verify` pasa: 52 archivos Astro sin incidencias, 10 pruebas, quince páginas compiladas, 13 URLs del sitemap, 15 tarjetas sociales y 669 referencias locales comprobadas. Capturas: `previews/logo-floristeria-footer.jpg`, `previews/logo-floristeria-header-movil.jpg` y `previews/logo-floristeria-footer-movil.jpg`. Procedencia, tipografía y prompt original de la rama: `logo-reconstruction.json`.

## Franja del hero y retirada de breadcrumbs

La franja del hero se extiende hacia arriba con `-top-32` y `max-sm:-top-28`, cubriendo el espacio reservado para el header. Comprobado el desplazamiento corto de la captura del usuario: el header se compacta y la franja continúa hasta su borde inferior, sin el hueco de fondo. Revisión visual en 1440 y 390, sin desbordamientos ni errores de consola. Captura: `previews/hero-franja-sin-corte.jpg`.

Retirada la fila de breadcrumbs del layout compartido y eliminado el componente que la generaba. Comprobada la ficha «Jardín de emociones» y verificada su ausencia en las quince páginas generadas. Los datos estructurados de navegación se conservan. `npm run verify` aprobado: 55 archivos sin incidencias, 10 pruebas, quince páginas, 13 URLs en sitemap y 651 enlaces/recursos. Captura: `previews/ficha-sin-breadcrumbs.jpg`.

## Botones en fila

Las acciones de contacto, fichas de productos y selección usan `flex flex-wrap items-center` con espacios nativos de Tailwind. Los dos botones de contacto comparten fila en 1440 y 768; en 390 y 320 se ajustan al ancho disponible sin desbordarse. Las acciones de las fichas quedan alineadas en escritorio y se distribuyen en varias líneas en móvil. La selección conserva sus controles e iconos, con apertura y cierre comprobados. Sin errores de consola. Astro revisó 55 archivos sin incidencias; quince páginas compiladas y 645 enlaces/recursos verificados. Capturas: `previews/botones-en-fila-contacto.jpg`, `previews/botones-en-fila-contacto-movil.jpg` y `previews/botones-en-fila-ficha.jpg`.

## Entrada inicial con el logo

Ajuste de la vista previa: en desarrollo la intro reaparece al recargar, incluso si la sesión ya tenía la marca de vista. La marca ahora se guarda después de mostrar el logo durante un segundo. Verificado navegar al catálogo sin intro y recargar esa página con el logo visible; captura `previews/intro-recarga-localhost.jpg`. El verificador del build comprueba que producción omite el atributo que habilita esta repetición y conserva una entrada por sesión.

Intro de un segundo con el logo completo y salida de 500 ms, solo en la primera visita de cada sesión de pestaña. Comprobados el logo visible, el contenido temporalmente inerte, la liberación del scroll y los controles, la búsqueda funcional después de la entrada, la recarga, la navegación al catálogo y el regreso con el historial. La capa no reaparece en esos recorridos. Revisada en escritorio y móvil de 390, sin desbordamientos ni errores de consola. El HTML de las quince páginas conserva la intro oculta y el contenido disponible sin JavaScript; el verificador comprueba ambas condiciones. La salida elimina su duración con movimiento reducido. `npm run verify` aprobado: 58 archivos sin incidencias, 10 pruebas, quince páginas y 675 enlaces/recursos verificados. Capturas: `previews/entrada-logo-inicial.jpg`, `previews/entrada-logo-movil.jpg` y `previews/entrada-logo-web-revelada.jpg`.

## Límites comerciales y de validación

No se envió ningún mensaje externo ni se simuló una compra. El número oficial +51 903 235 318 fue confirmado por el usuario y está conectado al botón flotante y a los enlaces de contacto. Se comprobó la URL y su mensaje preparado, sin enviarlo. Los precios, las tarifas y TikTok siguen pendientes de confirmación. El usuario confirmó `https://frisson.pe` como dominio público para la configuración SEO.

Los recursos generados restantes son representaciones ilustrativas. Las fotos de Instagram disponibles tienen hasta 640 px; los originales de cámara permitirían mayor definición. No se han medido puntuaciones de Lighthouse ni Core Web Vitals de un dominio publicado.

## SEO, sitemap, Open Graph y accesibilidad

- `https://frisson.pe` como dominio predeterminado, configurable con `PUBLIC_SITE_URL`. URLs canónicas sin parámetros ni barra final y sitemap automático de Astro con 13 páginas públicas; pedido y 404 conservan `noindex, follow`.
- Títulos y descripciones únicos en las 15 páginas. Open Graph y Twitter Cards completos, con 15 tarjetas JPEG de 1200 × 630 compuestas con fotografías y fuentes locales. Inspección visual de todas las tarjetas y comprobación de sus dimensiones, formatos y archivos.
- JSON-LD de Organization, WebSite, WebPage, CollectionPage, AboutPage, ContactPage, BreadcrumbList, ItemList, Product y FAQPage. Preguntas y respuestas compartidas con el contenido visible; sin precios, valoraciones o inventario inventados.
- Rutas de navegación en JSON-LD; fila de breadcrumbs retirada a petición del usuario. Diálogo asociado a su encabezado, relaciones ARIA de botones y búsqueda, estado actual del menú y destino enfocable para saltar al contenido. Corregidos el salto de encabezados del hero y catálogo y el contraste de los números del proceso de pedido. WhatsApp pertenece a una región complementaria.
- `npm run verify` aprobado: Astro sin errores, advertencias ni sugerencias; 10 pruebas aprobadas; 15 páginas, 13 URLs indexables, 15 tarjetas y 669 referencias locales verificadas. El verificador comprueba la correspondencia exacta entre sitemap y canonical, unicidad de metadatos, JSON-LD y referencias ARIA.
- Chrome con axe-core: sin incidencias automatizadas en las 15 vistas, incluida una URL inexistente que responde 404. Comprobación de navegación, filtros, búsqueda y menú móvil; sin errores de JavaScript. Capturas revisadas en 1440 y 390 px, sin desbordamiento horizontal en el catálogo móvil.
- OpenGraph.xyz y la indexación en Google se comprueban sobre el dominio después de publicar. La validación realizada aquí corresponde al build local servido mediante Astro Preview.

## Instagram y WhatsApp como canales principales

La web invita a descubrir y seguir Frisson en Instagram y a conversar directamente por WhatsApp. Portada, cierre compartido, contacto, galería, header, menú móvil y footer dan más presencia a los canales oficiales. Las fichas permiten consultar por WhatsApp con el nombre y la URL del arreglo en el mensaje. El catálogo, la selección y el formulario siguen disponibles; los pasos y las preguntas frecuentes también explican la alternativa de conversar directamente.

El flotante conserva solo el icono y muestra «Contáctanos por WhatsApp» al pasar el cursor o enfocarlo con teclado. No se muestran cifras de seguidores. Los enlaces usan `https://www.instagram.com/frisson.pee/` y el número confirmado `51903235318`, con mensajes codificados y apertura en otra pestaña.

Verificadas portada, contacto, catálogo, historia y ficha en 320, 390, 640, 768, 1024 y 1440 px, sin desbordamientos ni errores de JavaScript. Comprobados los destinos, el contexto del mensaje de producto y los accesos del menú móvil. La selección permite añadir y quitar productos con las animaciones normales en escritorio y móvil. `npm run verify` aprobado: 64 archivos Astro sin incidencias, 10 pruebas, 15 páginas, 13 URLs en sitemap, 15 tarjetas sociales y 656 referencias locales. Capturas: `previews/redes-portada-1440.jpg`, `previews/redes-menu-movil.jpg`, `previews/redes-contacto-390.jpg` y `previews/redes-cta-final-movil.jpg`.

## Favicon botánico

`public/favicon.svg` adapta la ramita del logo a un trazado simplificado, con tinta `#3f3429` sobre piel `#f4e8df`. El SVG es autónomo y no depende de fuentes. El layout compartido incluye el SVG con una nueva URL de caché, el ICO de 16/32/48 px y el icono de Apple de 180 px con fondo opaco. Las variantes se regeneran con `npm run images:favicons`.

Inspeccionada la legibilidad a 16, 24, 32, 48, 64 y 128 px sobre fondos claros y oscuros; vista previa en `previews/favicon-botanico.png`. Comprobadas las dimensiones de las tres imágenes del ICO y del PNG de Apple, las referencias del layout y las respuestas HTTP 200 de los recursos. Astro sin errores, advertencias ni sugerencias; quince páginas compiladas y referencias locales verificadas.
