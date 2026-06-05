import sharp from 'sharp';
import fs from 'fs';

const BANNER_WIDTH = 1920;
const BANNER_HEIGHT = 600;

export async function saveAdSlotImage(file, uploadDir) {
  const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const finalName = `ad-${stamp}.webp`;
  const finalPath = `${uploadDir}/${finalName}`;

  await sharp(file.path)
    .rotate()
    .resize(BANNER_WIDTH, BANNER_HEIGHT, { fit: 'cover', position: 'centre' })
    .webp({ quality: 85, effort: 4 })
    .toFile(finalPath);

  if (file.path && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }

  return `/ad-slots/${finalName}`;
}
