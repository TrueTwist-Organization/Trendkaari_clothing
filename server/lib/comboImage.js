import sharp from 'sharp';
import fs from 'fs';
import { uploadBufferToBlob, useBlobPersistence } from './blobStorage.js';

const MAX_WIDTH = 1400;

/** Save combo image as WebP (local public/combos or Vercel Blob on production). */
export async function saveComboImages(files, uploadDir) {
  const urls = [];
  for (const file of files) {
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const finalName = `combo-${stamp}.webp`;

    const buffer = await sharp(file.path)
      .rotate()
      .resize(MAX_WIDTH, null, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 88, effort: 4 })
      .toBuffer();

    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    if (useBlobPersistence()) {
      const url = await uploadBufferToBlob(
        `trendkaari/combos/${finalName}`,
        buffer,
        'image/webp'
      );
      urls.push(url);
    } else {
      const finalPath = `${uploadDir}/${finalName}`;
      fs.writeFileSync(finalPath, buffer);
      urls.push(`/combos/${finalName}`);
    }
  }
  return urls;
}
