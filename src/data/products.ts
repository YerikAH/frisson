export interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  imageWidth?: number;
  sourceUrl?: string;
  alt: string;
  description: string;
  flowers: string;
  colors: string;
  price: number | null;
}
export const products: Product[] = [
  {
    id: 'ramo-frances',
    name: 'Un pequeño frisson',
    category: 'Ramos franceses',
    image: 'instagram/ramo-delicado',
    imageWidth: 640,
    sourceUrl: 'https://www.instagram.com/frisson.pee/p/DcTt_AsRiDL/',
    alt: 'Ramo de Frisson con alstroemerias rosadas, flores lilas y eucalipto, en papel kraft con lazo crema',
    description:
      'Un gesto delicado que dice mucho. Flores ligeras, eucalipto y un lazo suave sobre papel kraft. Una creación de nuestro universo floral para inspirar la tuya.',
    flowers: 'Alstroemerias, flores lilas y eucalipto',
    colors: 'Rosa suave, lila y pequeños acentos amarillos',
    price: null,
  },
  {
    id: 'jardin-romantico',
    name: 'Jardín de emociones',
    category: 'De temporada',
    image: 'instagram/lirios-rosas',
    imageWidth: 480,
    sourceUrl: 'https://www.instagram.com/frisson.pee/p/DcgwK9ekayo/',
    alt: 'Ramo de Frisson con lirios rosados, una rosa roja, claveles y flores blancas, envuelto en yute',
    description:
      'Lirios que se abren, una rosa intensa y pequeñas flores blancas. Texturas naturales y tonos románticos, reunidos en una de nuestras creaciones.',
    flowers: 'Lirios, rosa, claveles y flores blancas ligeras',
    colors: 'Rosa, rojo y blanco',
    price: null,
  },
  {
    id: 'sol-entre-flores',
    name: 'Un poquito de sol',
    category: 'De temporada',
    image: 'instagram/flores-amarillas',
    imageWidth: 478,
    sourceUrl: 'https://www.instagram.com/frisson.pee/p/DdfRSXekcwA/',
    alt: 'Rosas amarillas, girasol, margaritas blancas y flores moradas de Frisson sobre una mesa de madera',
    description:
      'Para los días que merecen más luz. Amarillos luminosos, pequeños blancos y acentos lilas en un ramo cálido, envuelto con la naturalidad de Frisson.',
    flowers: 'Rosas amarillas, girasol y flores de acompañamiento',
    colors: 'Amarillo, blanco y violeta',
    price: null,
  },
  {
    id: 'a-flor-de-piel',
    name: 'A flor de piel',
    category: 'Ramos franceses',
    image: 'instagram/lirios-y-gerbera',
    imageWidth: 640,
    sourceUrl: 'https://www.instagram.com/frisson.pee/p/DcSiHGbja65/',
    alt: 'Ramo de Frisson con lirios blancos, gerbera roja y flores violetas, sostenido entre estantes de libros',
    description:
      'Un encuentro de colores que se siente. Lirios blancos, rojo vivo y flores violetas sobre un envoltorio de yute: un gesto lleno de carácter.',
    flowers: 'Lirios, gerbera y flores violetas',
    colors: 'Blanco, rojo y violeta',
    price: null,
  },
  {
    id: 'arreglo-macetero',
    name: 'Calma en flor',
    category: 'En macetero',
    image: 'arreglo-macetero',
    alt: 'Flores blancas y crema en un macetero cerámico marfil',
    description:
      'Una pausa para contemplar. Flores en tonos marfil y verdes naturales se encuentran en una pieza cerámica de líneas sencillas.',
    flowers: 'Rosas y flores crema',
    colors: 'Blanco, crema y verde',
    price: null,
  },
  {
    id: 'arreglo-florero',
    name: 'Instantes de luz',
    category: 'En florero',
    image: 'arreglo-florero',
    alt: 'Flores rosadas y blancas en un florero transparente de cristal',
    description:
      'Ligero, espontáneo y lleno de vida. Flores de distintas alturas y un florero de cristal dejan que la naturaleza encuentre su propia forma.',
    flowers: 'Rosas y flores ligeras',
    colors: 'Blanco y rosa empolvado',
    price: null,
  },
];
export const priceLabel = (price: number | null) =>
  price === null
    ? 'Consultar precio'
    : new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
      }).format(price);
