import fs from 'node:fs/promises';
import sharp from 'sharp';
import { openSync } from 'fontkit';
import { socialImage } from '../src/config/seo.ts';

const root = new URL('../', import.meta.url);
const localPath = (file) => new URL(file.replace(/^\//, ''), root).pathname;
const font = openSync(
  localPath('public/fonts/cormorant-garamond-light-logo.woff2'),
);
const css = await fs.readFile(new URL('src/styles/global.css', root), 'utf8');
const color = (name) =>
  css.match(new RegExp(`--color-${name}:\\s*([^;]+);`))[1].trim();
const ink = color('ink');
const paper = color('paper');

// Las proporciones y el espaciado siguen la variante stacked de BrandLogo.astro.
const scale = 2.25;
const gap = 8 * scale;
const sprigWidth = 64 * scale;
const sprigHeight = 96 * scale;
const wordmarkSize = 36 * scale;
const separatorHeight = 6 * scale;
const captionSize = 14 * scale;
const logoHeight =
  sprigHeight + wordmarkSize + separatorHeight + captionSize + gap * 3;
const top = (socialImage.height - logoHeight) / 2;
const centerX = socialImage.width / 2;

// Los glifos se convierten en trazados para conservar la fuente sin depender
// de las fuentes instaladas en el sistema que regenera la imagen.
function lettering(value, size, tracking, y) {
  const run = font.layout(value);
  const factor = size / font.unitsPerEm;
  const width = run.advanceWidth * factor + (run.glyphs.length - 1) * tracking;
  const baseline =
    y +
    (size - (font.ascent - font.descent) * factor) / 2 +
    font.ascent * factor;
  let x = centerX - width / 2;
  const paths = run.glyphs.map((glyph, index) => {
    const position = run.positions[index];
    const shape = `<path transform="translate(${x + position.xOffset * factor} ${baseline - position.yOffset * factor}) scale(${factor} ${-factor})" d="${glyph.path.toSVG()}"/>`;
    x += position.xAdvance * factor + tracking;
    return shape;
  });
  return { width, svg: `<g fill="${ink}">${paths.join('')}</g>` };
}

const wordmarkTop = top + sprigHeight + gap;
const wordmark = lettering(
  'frisson.',
  wordmarkSize,
  wordmarkSize * 0.05,
  wordmarkTop,
);
const separatorTop = wordmarkTop + wordmarkSize + gap;
const caption = lettering(
  'floristería',
  captionSize,
  captionSize * 0.025,
  separatorTop + separatorHeight + gap,
);
const separatorWidth = wordmark.width * 0.75;
const separatorY = separatorTop + separatorHeight / 2;
const diamondSize = 4 * scale;
const lineInset = diamondSize / 2 + gap;
const ornament = `<g stroke="${ink}" stroke-opacity="0.6" stroke-width="${scale}">
  <path d="M${centerX - separatorWidth / 2} ${separatorY}H${centerX - lineInset}"/>
  <path d="M${centerX + lineInset} ${separatorY}H${centerX + separatorWidth / 2}"/>
</g>
<rect x="${centerX - diamondSize / 2}" y="${separatorY - diamondSize / 2}" width="${diamondSize}" height="${diamondSize}" fill="${ink}" transform="rotate(45 ${centerX} ${separatorY})"/>`;

// Igual que la máscara CSS del logo: conservar el alfa y aplicar el color ink.
const alpha = await sharp(localPath('public/images/brand/frisson-sprig.png'))
  .resize(sprigWidth, sprigHeight, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .ensureAlpha()
  .extractChannel('alpha')
  .toBuffer();
const sprig = await sharp({
  create: {
    width: sprigWidth,
    height: sprigHeight,
    channels: 3,
    background: ink,
  },
})
  .joinChannel(alpha)
  .png()
  .toBuffer();

await sharp({
  create: {
    width: socialImage.width,
    height: socialImage.height,
    channels: 3,
    background: paper,
  },
})
  .composite([
    {
      input: sprig,
      left: Math.round(centerX - sprigWidth / 2),
      top: Math.round(top),
    },
    {
      input: Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${socialImage.width}" height="${socialImage.height}">${wordmark.svg}${ornament}${caption.svg}</svg>`,
      ),
      left: 0,
      top: 0,
    },
  ])
  .png({ compressionLevel: 9 })
  .toFile(localPath(`public${socialImage.path}`));

console.log(
  `${socialImage.path} · ${socialImage.width} × ${socialImage.height} · fondo ${paper}`,
);
