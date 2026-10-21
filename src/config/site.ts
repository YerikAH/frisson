import { DEFAULT_SITE_URL, normalizeSiteUrl } from '../lib/seo';

/** Datos comerciales confirmados. Completar solo con información aprobada por Frisson. */
export const site = {
  name: 'FRISSON',
  slogan: 'Floristería & emociones a flor de piel 🍁',
  description:
    'Floristería de autor en Huancayo. Ramos franceses y composiciones únicas para transformar emociones en recuerdos.',
  url: normalizeSiteUrl(import.meta.env.PUBLIC_SITE_URL || DEFAULT_SITE_URL),
  whatsapp: import.meta.env.PUBLIC_WHATSAPP_NUMBER || '51903235318', // Número oficial confirmado; código de país y número, solo dígitos.
  instagram: 'https://www.instagram.com/frisson.pee/',
  tiktok: '',
  legalName: null as string | null,
  retailAddress: null as string | null,
  openingHours: null as string | null,
  paymentMethods: [] as string[],
  zones: ['Huancayo', 'El Tambo', 'Chilca', 'San Carlos'],
  deliveryRates: {} as Record<string, number>, // Soles. Vacío hasta confirmar tarifas.
  deliveryNote: 'Costo de delivery por confirmar según la dirección de entrega',
};
