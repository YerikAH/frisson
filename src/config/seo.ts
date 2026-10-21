export interface PageMetadata {
  name: string;
  title: string;
  description: string;
  socialTitle: string;
  photo: string;
  type?: 'WebPage' | 'CollectionPage' | 'AboutPage' | 'ContactPage';
}

/** Metadatos y textos de las tarjetas sociales de cada página. */
export const pageMetadata: Record<string, PageMetadata> = {
  '/': {
    name: 'Inicio',
    title: 'Floristería en Huancayo · Ramos y flores de autor | Frisson',
    description:
      'Descubre Frisson, floristería de autor en Huancayo. Ramos franceses y arreglos personalizados con entregas coordinadas en Huancayo, El Tambo, Chilca y San Carlos.',
    socialTitle: 'Flores que te\nhacen sentir.',
    photo: '/images/instagram/lirios-rosas.webp',
  },
  '/catalogo': {
    name: 'Catálogo',
    title: 'Ramos y arreglos florales en Huancayo | Frisson',
    description:
      'Explora ramos franceses, flores de temporada, maceteros y floreros de Frisson en Huancayo. Encuentra inspiración y consulta las opciones para tu próximo regalo.',
    socialTitle: 'Un jardín\nde emociones.',
    photo: '/images/instagram/ramo-delicado.webp',
    type: 'CollectionPage',
  },
  '/personalizados': {
    name: 'Arreglos personalizados',
    title: 'Arreglos florales personalizados en Huancayo | Frisson',
    description:
      'Crea tu arreglo floral personalizado con Frisson en Huancayo. Elige flores, colores y presupuesto; prepara tu solicitud y coordina los detalles por WhatsApp.',
    socialTitle: 'Tu emoción,\nhecha flores.',
    photo: '/images/instagram/lirios-y-gerbera.webp',
  },
  '/historia': {
    name: 'Nuestra historia',
    title: 'Nuestra historia · Floristería de autor en Huancayo | Frisson',
    description:
      'Conoce la historia de Frisson, floristería de autor en Huancayo. Creamos composiciones de inspiración francesa para celebrar las emociones y los pequeños instantes.',
    socialTitle: 'Una flor.\nUn frisson.',
    photo: '/images/instagram/lirios-amarillos.webp',
    type: 'AboutPage',
  },
  '/contacto': {
    name: 'Contacto y entregas',
    title: 'Contacto y delivery de flores en Huancayo | Frisson',
    description:
      'Contacta a Frisson por WhatsApp y coordina tu pedido floral. Entregas en Huancayo, El Tambo, Chilca y San Carlos; disponibilidad y costo según tu dirección.',
    socialTitle: 'Conversemos\ncon flores.',
    photo: '/images/instagram/flores-amarillas.webp',
    type: 'ContactPage',
  },
  '/privacidad': {
    name: 'Privacidad',
    title: 'Información de privacidad y datos de solicitudes | Frisson',
    description:
      'Conoce qué datos guarda Frisson en tu navegador, cómo borrar tu selección y qué compartes al enviar una solicitud por WhatsApp. Información de privacidad.',
    socialTitle: 'Tus datos,\ncon claridad.',
    photo: '/images/instagram/ramo-delicado.webp',
  },
  '/terminos': {
    name: 'Términos e información comercial',
    title: 'Términos e información de pedidos florales | Frisson',
    description:
      'Consulta cómo funcionan los pedidos de Frisson: creaciones artesanales, precios por confirmar, disponibilidad de flores y coordinación de entregas en Huancayo.',
    socialTitle: 'Cada detalle\ncuenta.',
    photo: '/images/instagram/lirios-y-gerbera.webp',
  },
  '/pedido': {
    name: 'Prepara tu solicitud',
    title: 'Prepara tu solicitud de flores en Huancayo | Frisson',
    description:
      'Revisa tu selección de flores, completa los detalles de entrega y prepara tu solicitud para Frisson. Coordina disponibilidad e importe directamente por WhatsApp.',
    socialTitle: 'Un gesto\npor florecer.',
    photo: '/images/instagram/flores-amarillas.webp',
  },
  '/404': {
    name: 'Página no encontrada',
    title: 'Página no encontrada · Vuelve a nuestro jardín | Frisson',
    description:
      'No encontramos la página que buscas. Descubre el catálogo de Frisson, conoce nuestras creaciones florales o contáctanos para preparar un arreglo en Huancayo.',
    socialTitle: 'Volvamos\nal jardín.',
    photo: '/images/instagram/lirios-rosas.webp',
  },
};

export const socialImage = {
  path: '/og-image.png',
  type: 'image/png',
  width: 1200,
  height: 630,
  alt: 'Logo de Frisson, floristería, centrado sobre el fondo crema de la marca.',
} as const;
