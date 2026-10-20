/** Fotografías públicas de la cuenta oficial, seleccionadas para la web. */
export interface JournalEntry {
  image: string;
  imageWidth: number;
  sourceUrl: string;
  title: string;
  text: string;
  videoSrc?: string;
  captionsSrc?: string;
}
export const journal: JournalEntry[] = [
  {
    image: 'instagram/lirios-amarillos',
    imageWidth: 480,
    sourceUrl: 'https://www.instagram.com/frisson.pee/p/DcZYyrakYgB/',
    title: 'Un instante de sol',
    text: 'Lirios amarillos y flores violetas en un ramo de Frisson envuelto en papel kraft',
  },
  {
    image: 'instagram/flores-amarillas',
    imageWidth: 478,
    sourceUrl: 'https://www.instagram.com/frisson.pee/p/DdfRSXekcwA/',
    title: 'Flores, libros y luz',
    text: 'Rosas amarillas, girasol y margaritas de Frisson sobre una mesa de madera iluminada por el sol',
  },
  {
    image: 'instagram/ramo-delicado',
    imageWidth: 640,
    sourceUrl: 'https://www.instagram.com/frisson.pee/p/DcTt_AsRiDL/',
    title: 'La belleza de lo sencillo',
    text: 'Ramo de flores rosadas, lilas y eucalipto con un lazo crema y la tarjeta de Frisson',
  },
  {
    image: 'instagram/lirios-y-gerbera',
    imageWidth: 640,
    sourceUrl: 'https://www.instagram.com/frisson.pee/p/DcSiHGbja65/',
    title: 'A flor de piel',
    text: 'Una mano sostiene un ramo de Frisson con lirios blancos, gerbera roja y flores violetas entre libros',
  },
];
