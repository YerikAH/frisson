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

El contenido de `dist/` puede alojarse en un hosting estático. No se ha publicado un dominio ni conectado un servicio externo.

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
PUBLIC_SITE_URL=
PUBLIC_WHATSAPP_NUMBER=51903235318
```

`PUBLIC_SITE_URL` debe ser la URL absoluta del dominio aprobado. Activa las URLs canónicas y las entradas de `/sitemap.xml`; sin dominio, el sitemap queda vacío para evitar URLs ficticias. El WhatsApp oficial está en `src/config/site.ts` y puede sobrescribirse con `PUBLIC_WHATSAPP_NUMBER`, incluyendo el código de país, solo con dígitos. Reiniciar Astro al cambiar variables y recompilar antes de publicar.

| Dato                                           | Archivo                                         | Estado                                                                      |
| ---------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------- |
| WhatsApp                                       | `src/config/site.ts`, `.env`                    | +51 903 235 318, confirmado por el usuario                                  |
| Dominio                                        | `.env`                                          | Pendiente                                                                   |
| Instagram y TikTok                             | `src/config/site.ts`                            | Instagram oficial conectado; TikTok pendiente                               |
| Tarifas de entrega                             | `src/config/site.ts`, `deliveryRates`           | Vacías; ningún costo inventado                                              |
| Precios                                        | `src/data/products.ts`, `price`                 | `null` muestra «Consultar precio»                                           |
| Flores, tamaños e inventario                   | `src/data/products.ts`                          | Ejemplos editoriales sujetos a aprobación                                   |
| Identidad comercial, atención y medios de pago | `src/config/site.ts`                            | Pendientes; no se muestran sin confirmar                                    |
| Fotografías de productos reales                | `public/images/instagram/`                      | Cinco fotos públicas del perfil oficial incorporadas a petición del usuario |
| Políticas comerciales definitivas              | `src/pages/terminos.astro` y `privacidad.astro` | Información sobre el funcionamiento actual; completar con datos oficiales   |

Zonas confirmadas: Huancayo, El Tambo, Chilca y San Carlos. `deliveryRates` acepta importes numéricos en soles por zona cuando se proporcionen. Sin tarifa se muestra «Costo de delivery por confirmar según la dirección de entrega».

El slogan se centraliza en `src/config/site.ts`. El perfil oficial es [@frisson.pee](https://www.instagram.com/frisson.pee/). Se observaron 104 seguidores durante la consulta; la cifra no se fija en la web para evitar que quede desactualizada.

## Estilos con Tailwind

Tailwind CSS 4 se integra con Vite en `astro.config.mjs`. Todos los componentes, páginas y elementos creados desde TypeScript usan utilidades Tailwind, incluidas las variantes de tamaño, estados, diálogos y animaciones. Las cinco hojas CSS anteriores se retiraron.

- `src/styles/global.css` es la única entrada: importa Tailwind, registra las fuentes, centraliza la paleta, las tipografías, las sombras y la curva de animación con `@theme`, y aplica la base con `@apply`.
- Los tamaños, espacios, radios, interlineados y espaciados entre letras usan la escala nativa de Tailwind: `text-sm`, `text-5xl`, `gap-6`, `p-9`, `rounded-xl`, etc. No hay medidas en píxeles ni tamaños tipográficos arbitrarios en `src/`. Tailwind 4 resuelve los tamaños numéricos mediante su variable `--spacing`.
- Los puntos de corte usan las variantes nativas; `--breakpoint-xs` añade el ajuste de pantallas pequeñas. Las fórmulas relativas restantes atienden a la altura visible, las áreas seguras del dispositivo y las transiciones de elementos nativos.
- El fondo piel se ajusta con `--color-paper` y la franja del hero con `--color-hero-tint`.
- Las clases semánticas que conserva el marcado sirven como referencias para las interacciones y las variantes de descendientes; no tienen reglas CSS independientes. Las clases de contenido dinámico se escriben completas para que Tailwind pueda detectarlas.
- Prettier usa `prettier-plugin-tailwindcss` para ordenar las utilidades al ejecutar `npm run format`.

## Imágenes

La portada, las cuatro creaciones destacadas, la historia y el journal usan fotografías públicas del Instagram oficial, incorporadas a petición del usuario. Se guardaron cinco fotos como WebP, con variantes de 400 px y sin ampliarlas ni recrearlas con IA. La procedencia y resolución de cada imagen se conservan en `docs/instagram-images.json`. La galería y las fichas de los ramos enlazan a sus publicaciones originales. Son las imágenes públicas disponibles, de hasta 640 px; los originales de cámara permitirían más detalle.

El hero utiliza ahora un PNG transparente derivado de la foto de lirios rosados, editado con ImageGen para retirar el fondo y la mano de soporte. El recorte y su variante móvil están en `public/images/hero-frisson-sin-fondo*.png`; el prompt y la procedencia están en `docs/hero-cutout.json`. Las fotos originales de la colección y del journal se conservan.

Los nombres de las composiciones son propuestas editoriales para la web, no nombres de inventario confirmados. Los maceteros y floreros conservan imágenes generadas, identificadas como inspiración ilustrativa. También se mantienen algunos recursos decorativos originales creados con ImageGen; prompts en `docs/image-prompts.json`. La boutique es una visión conceptual de futuro: Frisson no cuenta con un establecimiento abierto al público.

Para añadir fotos, videos, preparación de pedidos o eventos, editar `src/data/journal.ts`. Un video puede incorporar `videoSrc`, una portada `image` y `captionsSrc` con subtítulos WebVTT en español. No se incluyen videos ni estadísticas ficticias. Las licencias de Bodoni Moda y DM Sans acompañan las fuentes en `public/fonts/`.

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
