# Frisson · Floristería & emociones a flor de piel 🍁

Web editorial construida en Astro 7, Tailwind CSS 4 y TypeScript. Diseño adaptable con utilidades Tailwind, tipografías locales, fotografías originales y JavaScript solo para las interacciones. Sin React, backend comercial ni pasarela de pagos.

## Instalar y abrir

Requiere Node.js 22.22 o posterior.

```sh
npm install
npm run dev -- --background
```

Vista local: `http://localhost:4321`. Gestión del servidor según `AGENTS.md`:

```sh
npm run astro -- dev status
npm run astro -- dev logs
npm run astro -- dev stop
```

## Verificar y compilar

```sh
npm run check          # TypeScript y componentes Astro
npm test               # Selección, resumen, WhatsApp y tarifas
npm run build          # Sitio estático en dist/
npm run verify         # Todo lo anterior y enlaces/recursos del build
npm run format         # Prettier
```

El contenido de `dist/` puede alojarse en un hosting estático. El dominio público configurado es `https://frisson.pe`; la publicación y el DNS se gestionan en el hosting.

## Experiencia incluida

- Inicio con hero editorial, cuatro valores, colección, declaración de marca, pestañas de variedades, formulario personalizado, historia, galería, proceso de pedido, delivery, preguntas, llamada final y footer.
- Catálogo con filtros, seis páginas de detalle, personalización, solicitud, historia, contacto, privacidad, términos informativos y página 404.
- Selección con cantidades y eliminación en `localStorage`; formulario conservado en `sessionStorage` de la pestaña, con opción de borrar los datos.
- Validación, fecha mínima según Lima, resumen previo y copia. WhatsApp conectado al número oficial +51 903 235 318, con mensaje preparado.
- Pestañas con flechas, Inicio y Fin; diálogos nativos con foco contenido y Escape; acordeones, búsqueda y menú móvil.
- Animaciones que respetan `prefers-reduced-motion`, dimensiones de imagen, carga diferida y versiones pequeñas para catálogo y galería.
- Apertura y cierre suaves de diálogos, fondo y menú; la selección entra desde el lateral en escritorio y como sheet inferior en móvil. Acordeones con transición de altura cuando el navegador la admite.
- Botón flotante de WhatsApp en todas las páginas, adaptado a móvil y al área segura del dispositivo.
- Títulos, descripciones, Open Graph, robots y sitemap configurables. Sin analítica, newsletter simulada, descuentos, reseñas ni datos comerciales inventados.

## Datos comerciales

Copiar `.env.example` a `.env` y completar únicamente datos oficiales:

```dotenv
PUBLIC_SITE_URL=https://frisson.pe
PUBLIC_WHATSAPP_NUMBER=51903235318
```

`PUBLIC_SITE_URL` permite sobrescribir el dominio aprobado `https://frisson.pe`, que también se usa por defecto. Debe ser un dominio absoluto HTTP(S), sin credenciales, rutas, parámetros ni fragmentos. Astro, las URLs canónicas, Open Graph, los datos estructurados y robots usan ese dominio. El WhatsApp oficial está en `src/config/site.ts` y puede sobrescribirse con `PUBLIC_WHATSAPP_NUMBER`, incluyendo el código de país, solo con dígitos. Reiniciar Astro al cambiar variables y recompilar antes de publicar.

| Dato                                           | Archivo                                         | Estado                                                                      |
| ---------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------- |
| WhatsApp                                       | `src/config/site.ts`, `.env`                    | +51 903 235 318, confirmado por el usuario                                  |
| Dominio                                        | `src/lib/seo.ts`, `.env`                         | `https://frisson.pe`, confirmado por el usuario                               |
| Instagram y TikTok                             | `src/config/site.ts`                            | Instagram oficial conectado; TikTok pendiente                               |
| Tarifas de entrega                             | `src/config/site.ts`, `deliveryRates`           | Vacías; ningún costo inventado                                              |
| Precios                                        | `src/data/products.ts`, `price`                 | `null` muestra «Consultar precio»                                           |
| Flores, tamaños e inventario                   | `src/data/products.ts`                          | Ejemplos editoriales sujetos a aprobación                                   |
| Identidad comercial, atención y medios de pago | `src/config/site.ts`                            | Pendientes; no se muestran sin confirmar                                    |
| Fotografías de productos reales                | `public/images/instagram/`                      | Cinco fotos públicas del perfil oficial incorporadas a petición del usuario |
| Políticas comerciales definitivas              | `src/pages/terminos.astro` y `privacidad.astro` | Información sobre el funcionamiento actual; completar con datos oficiales   |

Zonas confirmadas: Huancayo, El Tambo, Chilca y San Carlos. `deliveryRates` acepta importes numéricos en soles por zona cuando se proporcionen. Sin tarifa se muestra «Costo de delivery por confirmar según la dirección de entrega».

## SEO y vistas previas al compartir

- `@astrojs/sitemap` descubre las rutas estáticas y las fichas del catálogo durante `npm run build`. Genera `/sitemap-index.xml` y `/sitemap-0.xml`, con todas las páginas públicas y sus URLs canónicas sin barra final. Las nuevas rutas se incorporan automáticamente.
- `/robots.txt` permite rastrear el sitio y anuncia el índice del sitemap. `/pedido` y la página 404 llevan `noindex, follow` y se excluyen del sitemap mediante `isIndexablePath` en `src/lib/seo.ts`. Se permite rastrear `/pedido` para que los buscadores puedan leer su `noindex`.
- `src/config/seo.ts` centraliza títulos, descripciones y tarjetas de las páginas. Las fichas obtienen sus metadatos de `src/data/products.ts`. `src/components/SEO.astro` los publica en el HTML inicial, con canonical, Open Graph completo y Twitter Cards.
- Todas las páginas comparten `public/og-image.png`, una tarjeta de 1200 × 630 con el logo centrado sobre el fondo crema de la web. Usa la rama, la tipografía Cormorant Garamond y los colores locales de la marca. Para regenerarla después de cambiar el logo o la paleta, ejecutar `npm run images:social` y volver a compilar.
- JSON-LD describe la organización, el sitio, las páginas, la colección, las composiciones y las rutas de navegación. Las preguntas frecuentes comparten `src/data/faq.ts` con el contenido visible. Los importes, las valoraciones, el stock y una dirección física no se publican sin confirmar.
- Las páginas interiores omiten la fila de breadcrumbs. Los botones identifican los diálogos que abren; los diálogos se asocian con sus encabezados, y el menú indica la página actual.

Después de publicar en `frisson.pe`, comprobar las URLs públicas en [OpenGraph.xyz](https://www.opengraph.xyz/) y enviar `https://frisson.pe/sitemap-index.xml` a Google Search Console. Los sitemaps se generan al compilar y se revisan en el hosting o con `npm run preview`.

`npm run verify` valida las 15 páginas, la correspondencia entre sitemap y páginas indexables, la unicidad de los metadatos, las dimensiones y existencia de las tarjetas, JSON-LD, los encabezados y las referencias ARIA, además de los enlaces y las pruebas del flujo de solicitud.

El slogan se centraliza en `src/config/site.ts`. El perfil oficial es [@frisson.pee](https://www.instagram.com/frisson.pee/). Se observaron 104 seguidores durante la consulta; la cifra no se fija en la web para evitar que quede desactualizada.

## Estilos con Tailwind

Tailwind CSS 4 se integra con Vite en `astro.config.mjs`. Todos los componentes, páginas y elementos creados desde TypeScript usan utilidades Tailwind, incluidas las variantes de tamaño, estados, diálogos y animaciones. Las cinco hojas CSS anteriores se retiraron.

- `src/styles/global.css` es la única entrada: importa Tailwind, registra las fuentes, centraliza la paleta, las tipografías, las sombras y la curva de animación con `@theme`, y aplica la base con `@apply`.
- Los tamaños, espacios, radios, interlineados y espaciados entre letras usan la escala nativa de Tailwind: `text-sm`, `text-5xl`, `gap-6`, `p-9`, `rounded-xl`, etc. No hay medidas en píxeles ni tamaños tipográficos arbitrarios en `src/`. Tailwind 4 resuelve los tamaños numéricos mediante su variable `--spacing`.
- Los puntos de corte usan las variantes nativas; `--breakpoint-xs` añade el ajuste de pantallas pequeñas. Las fórmulas relativas restantes atienden a la altura visible, las áreas seguras del dispositivo y las transiciones de elementos nativos.
- El fondo piel se ajusta con `--color-paper` y la franja del hero con `--color-hero-tint`.
- Las clases semánticas que conserva el marcado sirven como referencias para las interacciones y las variantes de descendientes; no tienen reglas CSS independientes. Las clases de contenido dinámico se escriben completas para que Tailwind pueda detectarlas.
- Prettier usa `prettier-plugin-tailwindcss` para ordenar las utilidades al ejecutar `npm run format`.

El ancho máximo general es `max-w-5xl`. El header conserva su marcado Astro dentro de `ScrollHeader.tsx`, una isla React hidratada con `client:load`. Al inicio usa `h-32` (`h-28` en móvil) para mostrar el logo con la rama ampliada. Al hacer scroll oculta la rama y pasa a `h-18` (`h-16` en móvil), con una transición Tailwind de 300 ms; vuelve a ampliarse al regresar arriba. Se mantiene fijo, se oculta al bajar y reaparece al subir. El bloque de color del logo aparece solo al inicio de la portada y se vuelve transparente al hacer scroll; las páginas interiores tienen un fondo uniforme. Un espacio inicial de altura constante evita saltos del contenido al compactar el header. El menú abierto, el foco de teclado y los diálogos mantienen la navegación disponible; se respeta la preferencia de movimiento reducido.

## Entrada con el logo

`BrandIntro.astro` muestra el logo completo durante un segundo al entrar por primera vez en la sesión de una pestaña. En producción usa `sessionStorage` (`frisson-intro-seen-v1`) para omitirlo al recargar o navegar entre páginas. Guarda la marca después de mostrar el logo. En desarrollo permite repetirlo al recargar la página para probarlo en localhost; no se repite al navegar entre páginas. La salida dura 500 ms y coordina el inicio de las animaciones de la página con `frisson:intro-reveal`. Respeta movimiento reducido, libera los controles y el scroll al terminar y limpia la capa antes de guardar una página en el historial. Sin JavaScript se muestra directamente la web; si el navegador bloquea el almacenamiento de sesión, en producción se omite la intro. La intro funciona de forma independiente al paquete de animaciones.

## Imágenes

Los iconos de interfaz proceden de `@lucide/astro`; el logo de WhatsApp usa `simple-icons`. `src/components/Icon.astro` centraliza los nombres tipados, el trazo y los tamaños Tailwind (`size-4`, `size-5`, `size-7`), incluidas las flechas de botones y enlaces. Se generan como SVG durante el renderizado de Astro, sin cargar una librería de iconos en el navegador. La búsqueda dinámica clona esos SVG desde plantillas incluidas en `Dialogs.astro`; la selección conserva el icono al actualizar su etiqueta.

La portada, las cuatro creaciones destacadas, la historia y el journal usan fotografías públicas del Instagram oficial, incorporadas a petición del usuario. Se guardaron cinco fotos como WebP, con variantes de 400 px y sin ampliarlas ni recrearlas con IA. La procedencia y resolución de cada imagen se conservan en `docs/instagram-images.json`. La galería y las fichas de los ramos enlazan a sus publicaciones originales. Son las imágenes públicas disponibles, de hasta 640 px; los originales de cámara permitirían más detalle.

El hero utiliza ahora un PNG transparente derivado de la foto de lirios rosados, editado con ImageGen para retirar el fondo y la mano de soporte. El recorte y su variante móvil están en `public/images/hero-frisson-sin-fondo*.png`; el prompt y la procedencia están en `docs/hero-cutout.json`. Las fotos originales de la colección y del journal se conservan.

`BrandLogo.astro` compone el logo en vertical: rama, `frisson.`, separador con rombo central y `floristería`. El nombre utiliza Cormorant Garamond Light con peso real 300 y el token Tailwind `font-brand`; la fuente WOFF2 se sirve localmente y contiene los caracteres del logo. La rama transparente adopta el color del tema mediante una máscara. En el header la rama se desvanece y reduce su altura a cero al hacer scroll; el footer conserva siempre el logo completo. Procedencia y licencia: `docs/logo-reconstruction.json` y `public/fonts/Cormorant-Garamond-OFL.txt`.

Los nombres de las composiciones son propuestas editoriales para la web, no nombres de inventario confirmados. Los maceteros y floreros conservan imágenes generadas, identificadas como inspiración ilustrativa. También se mantienen algunos recursos decorativos originales creados con ImageGen; prompts en `docs/image-prompts.json`. La boutique es una visión conceptual de futuro: Frisson no cuenta con un establecimiento abierto al público.

Para añadir fotos, videos, preparación de pedidos o eventos, editar `src/data/journal.ts`. Un video puede incorporar `videoSrc`, una portada `image` y `captionsSrc` con subtítulos WebVTT en español. No se incluyen videos ni estadísticas ficticias. Las licencias de Bodoni Moda, Cormorant Garamond y DM Sans acompañan las fuentes en `public/fonts/`.

## Organización

```text
src/components/   Secciones y elementos reutilizables
src/layouts/      Estructura, SEO y navegación común
src/pages/        Rutas y endpoints estáticos SEO
src/data/         Composiciones y journal
src/config/       Marca y datos comerciales
src/lib/          Funciones puras de solicitudes
src/scripts/      Interacciones TypeScript
src/styles/       Entrada Tailwind, tema y estilos base
public/images/    Imágenes originales optimizadas
public/fonts/     Fuentes y licencias
scripts/          Verificación del build
tests/            Pruebas de solicitudes
docs/             Prompts, capturas y validación
```

## Flujo de solicitud

1. Añadir arreglos o comenzar una creación personalizada.
2. Indicar preferencias, presupuesto, destinatario, fecha, horario y dirección.
3. Revisar el resumen sin enviar datos automáticamente.
4. Copiar la solicitud o abrir WhatsApp con el mensaje preparado, cuando esté configurado.
5. Confirmar disponibilidad, importe y entrega directamente con Frisson.

La web nunca marca solicitudes como pagadas ni confirmadas. Los datos permanecen en el navegador hasta que la persona decide compartir el mensaje.
