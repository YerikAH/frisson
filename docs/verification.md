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

## Límites comerciales y de validación

No se envió ningún mensaje externo ni se simuló una compra. El número oficial +51 903 235 318 fue confirmado por el usuario y está conectado al botón flotante y a los enlaces de contacto. Se comprobó la URL y su mensaje preparado, sin enviarlo. Los precios, las tarifas, TikTok y el dominio siguen pendientes de confirmación.

Los recursos generados restantes son representaciones ilustrativas. Las fotos de Instagram disponibles tienen hasta 640 px; los originales de cámara permitirían mayor definición. No se han medido puntuaciones de Lighthouse ni Core Web Vitals de un dominio publicado.
