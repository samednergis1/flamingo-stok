import sharp from 'sharp';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logoPath = path.join(__dirname, 'public', 'flamingo-logo.png');
const tempPath = path.join(__dirname, 'public', 'flamingo-logo-transparent.png');

function isBackground(r, g, b, a) {
  if (a < 10) return true;

  const brightness = (r + g + b) / 3;

  // Dark brown logo elements
  if (brightness < 125 && r < 140 && b < 110) return false;

  // Kraft paper: warm light brown
  const warmth = r - b;
  if (brightness > 145 && warmth > 15 && r > g && g > b) return true;

  // Edge anti-aliasing between logo and paper
  if (brightness > 120 && brightness < 175 && warmth > 10) {
    const paperR = 212;
    const paperG = 186;
    const paperB = 154;
    const dist = Math.hypot(r - paperR, g - paperG, b - paperB);
    return dist < 55;
  }

  return brightness > 175;
}

const image = sharp(logoPath);
const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const a = data[i + 3];

  if (isBackground(r, g, b, a)) {
    data[i + 3] = 0;
  } else if (data[i + 3] > 0) {
    // Harden semi-transparent dark pixels
    data[i + 3] = 255;
  }
}

await sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .png()
  .toFile(tempPath);

console.log('Done:', tempPath);
