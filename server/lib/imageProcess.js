import crypto from 'crypto';
import sharp from 'sharp';
import fs from 'fs';
import { uploadBufferToRemote, useRemoteMediaUpload } from './blobStorage.js';

/** Matches storefront product cards & PDP (3:4 portrait, ~700px catalog width). */
export const PRODUCT_IMAGE_WIDTH = 700;
export const PRODUCT_IMAGE_HEIGHT = Math.round((PRODUCT_IMAGE_WIDTH * 4) / 3);

function uniqueWebpName(file) {
  if (file?.filename) return `${file.filename}.webp`;
  const stamp = crypto.randomBytes(16).toString('hex');
  return `${stamp}.webp`;
}

async function productImageBufferFromPath(inputPath) {
  return sharp(inputPath)
    .rotate()
    .resize(PRODUCT_IMAGE_WIDTH, PRODUCT_IMAGE_HEIGHT, {
      fit: 'cover',
      position: 'centre',
    })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
}

async function productImageBufferFromUpload(file) {
  const input = file.buffer || file.path;
  if (!input) {
    throw new Error('Uploaded image could not be read.');
  }

  return sharp(input)
    .rotate()
    .resize(PRODUCT_IMAGE_WIDTH, PRODUCT_IMAGE_HEIGHT, {
      fit: 'cover',
      position: 'centre',
    })
    .webp({ quality: 82, effort: 4 })
    .toBuffer();
}

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

export async function saveUploadedProductImages(files, uploadDir) {
  const urls = [];
  for (const f of files) {
    const finalName = uniqueWebpName(f);

    if (useRemoteMediaUpload()) {
      const buffer = await productImageBufferFromUpload(f);
      if (f.path && fs.existsSync(f.path)) fs.unlinkSync(f.path);
      const url = await uploadBufferToRemote(
        `public/product-media/${finalName}`,
        buffer,
        'image/webp'
      );
      if (!url) {
        throw new Error('Live image upload is not configured. Add Vercel Blob or GITHUB_TOKEN.');
      }
      urls.push(url);
    } else {
      const finalPath = `${uploadDir}/${finalName}`;
      if (f.buffer) {
        const buffer = await productImageBufferFromUpload(f);
        fs.writeFileSync(finalPath, buffer);
      } else {
        await processProductUpload(f.path, finalPath);
      }
      urls.push(`/product-media/${finalName}`);
    }
  }
  return urls;
}
