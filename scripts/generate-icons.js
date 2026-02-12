import { writeFileSync, mkdirSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

function createPNG(width, height, bgR, bgG, bgB) {
  const pixels = Buffer.alloc(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    pixels[i * 4] = bgR;
    pixels[i * 4 + 1] = bgG;
    pixels[i * 4 + 2] = bgB;
    pixels[i * 4 + 3] = 255;
  }

  const lr = 0x38, lg = 0xBD, lb = 0xF8;
  const m = Math.floor(width * 0.28);
  const bw = Math.max(Math.floor(width * 0.09), 2);
  const topY = m;
  const botY = height - m;
  const leftX = m;
  const rightX = width - m;
  const midY = Math.floor(height * 0.48);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let draw = false;
      if (x >= leftX && x < leftX + bw && y >= topY && y < botY) draw = true;
      if (y >= topY && y < topY + bw && x >= leftX && x < rightX) draw = true;
      if (y >= midY && y < midY + bw && x >= leftX && x < Math.floor(rightX - m * 0.4)) draw = true;
      if (draw) {
        const idx = (y * width + x) * 4;
        pixels[idx] = lr;
        pixels[idx + 1] = lg;
        pixels[idx + 2] = lb;
      }
    }
  }

  const rawData = Buffer.alloc(height * (1 + width * 4));
  for (let y = 0; y < height; y++) {
    rawData[y * (1 + width * 4)] = 0;
    pixels.copy(rawData, y * (1 + width * 4) + 1, y * width * 4, (y + 1) * width * 4);
  }

  const compressed = deflateSync(rawData);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6;

  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeB = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeB, data]);
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < crcData.length; i++) {
    crc ^= crcData[i];
    for (let j = 0; j < 8; j++) crc = (crc >>> 1) ^ (crc & 1 ? 0xEDB88320 : 0);
  }
  crc ^= 0xFFFFFFFF;
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc >>> 0, 0);
  return Buffer.concat([len, typeB, data, crcBuf]);
}

mkdirSync('public', { recursive: true });

const sizes = [
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

for (const { name, size } of sizes) {
  const png = createPNG(size, size, 0x0F, 0x17, 0x2A);
  writeFileSync(`public/${name}`, png);
  console.log(`Created public/${name} (${size}x${size})`);
}

console.log('Done! PWA icons generated.');
