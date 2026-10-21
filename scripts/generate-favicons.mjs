import fs from 'node:fs/promises';
import sharp from 'sharp';

const root = new URL('../', import.meta.url);
const source = await fs.readFile(new URL('public/favicon.svg', root));
const css = await fs.readFile(new URL('src/styles/global.css', root), 'utf8');
const paper = css.match(/--color-paper:\s*([^;]+);/)[1].trim();
const sizes = [16, 32, 48];
const images = await Promise.all(
  sizes.map((size) => sharp(source).resize(size, size).png().toBuffer()),
);

// ICO stores a directory followed by the PNG for each browser icon size.
const directory = Buffer.alloc(6 + sizes.length * 16);
directory.writeUInt16LE(1, 2);
directory.writeUInt16LE(sizes.length, 4);
let offset = directory.length;
images.forEach((image, index) => {
  const entry = 6 + index * 16;
  directory.writeUInt8(sizes[index], entry);
  directory.writeUInt8(sizes[index], entry + 1);
  directory.writeUInt16LE(1, entry + 4);
  directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(image.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += image.length;
});

await Promise.all([
  fs.writeFile(
    new URL('public/favicon.ico', root),
    Buffer.concat([directory, ...images]),
  ),
  // iOS applies its own corner mask; provide an opaque background underneath.
  sharp(source)
    .resize(180, 180)
    .flatten({ background: paper })
    .png()
    .toFile(new URL('public/apple-touch-icon.png', root).pathname),
]);
console.log('Favicon ICO: 16, 32 y 48 px. Icono de Apple: 180 px.');
