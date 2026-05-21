import sharp from 'sharp';
import fs from 'fs';

const MAX_WIDTH = 1400;

/** Save combo image to public/combos as WebP */
export async function saveComboImages(files, uploadDir) {
  const urls = [];
  for (const file of files) {
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const finalName = `combo-${stamp}.webp`;
    const finalPath = `${uploadDir}/${finalName}`;

    await sharp(file.path)
      .rotate()
      .resize(MAX_WIDTH, null, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 88, effort: 4 })
      .toFile(finalPath);

    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    urls.push(`/combos/${finalName}`);
  }
  return urls;
}
