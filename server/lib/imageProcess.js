import sharp from 'sharp';
import fs from 'fs';
import { uploadBufferToRemote, useRemoteMediaUpload } from './blobStorage.js';

/** Matches storefront product cards & PDP (3:4 portrait, ~700px catalog width). */
export const PRODUCT_IMAGE_WIDTH = 700;
export const PRODUCT_IMAGE_HEIGHT = Math.round((PRODUCT_IMAGE_WIDTH * 4) / 3);

export async function processProductUpload(inputPath, outputPath) {
  await sharp(inputPath)
    .rotate()
    .resize(PRODUCT_IMAGE_WIDTH, PRODUCT_IMAGE_HEIGHT, {
      fit: 'cover',
      position: 'centre',
    })
    .webp({ quality: 82, effort: 4 })
    .toFile(outputPath);

  if (inputPath !== outputPath && fs.existsSync(inputPath)) {
    fs.unlinkSync(inputPath);
  }
}

async function productImageBuffer(inputPath) {
  return sharp(inputPath)
    .rotate()
    .resize(PRODUCT_IMAGE_WIDTH, PRODUCT_IMAGE_HEIGHT, {
      fit: 'cover',
      position: 'centre',
    })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
}

export async function saveUploadedProductImages(files, uploadDir) {
  const urls = [];
  for (const f of files) {
    const finalName = `${f.filename}.webp`;

    if (useRemoteMediaUpload()) {
      const buffer = await productImageBuffer(f.path);
      if (f.path && fs.existsSync(f.path)) fs.unlinkSync(f.path);
      const url = await uploadBufferToRemote(
        `public/product-media/${finalName}`,
        buffer,
        'image/webp'
      );
      urls.push(url);
    } else {
      const finalPath = `${uploadDir}/${finalName}`;
      await processProductUpload(f.path, finalPath);
      urls.push(`/product-media/${finalName}`);
    }
  }
  return urls;
}
