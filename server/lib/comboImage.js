import sharp from 'sharp';
import fs from 'fs';
import { uploadBufferToRemote, useRemoteMediaUpload } from './blobStorage.js';

const MAX_WIDTH = 1400;

async function comboImageBuffer(file) {
  const input = file.buffer || file.path;
  if (!input) {
    throw new Error('Uploaded combo image could not be read.');
  }

  return sharp(input)
    .rotate()
    .resize(MAX_WIDTH, null, { fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 88, effort: 4 })
    .toBuffer();
}

export async function saveComboImages(files, uploadDir) {
  const urls = [];
  for (const file of files) {
    const stamp = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const finalName = `combo-${stamp}.webp`;
    const buffer = await comboImageBuffer(file);

    if (file.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }

    if (useRemoteMediaUpload()) {
      const url = await uploadBufferToRemote(
        `public/combos/${finalName}`,
        buffer,
        'image/webp'
      );
      if (!url) {
        throw new Error('Live image upload is not configured. Add Vercel Blob or GITHUB_TOKEN.');
      }
      urls.push(url);
    } else {
      const finalPath = `${uploadDir}/${finalName}`;
      fs.writeFileSync(finalPath, buffer);
      urls.push(`/combos/${finalName}`);
    }
  }
  return urls;
}
