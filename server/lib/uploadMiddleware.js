import multer from 'multer';
import { useRemoteMediaUpload } from './blobStorage.js';

/** Vercel serverless FS is read-only — keep uploads in memory and push to Blob/GitHub. */
export function shouldUseMemoryUpload() {
  return Boolean(process.env.VERCEL) || useRemoteMediaUpload();
}

export function createImageUpload({ dest, maxFiles = 12, maxFileSize = 8 * 1024 * 1024 } = {}) {
  if (shouldUseMemoryUpload()) {
    return multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: maxFileSize, files: maxFiles },
    });
  }

  return multer({
    dest,
    limits: { fileSize: maxFileSize, files: maxFiles },
  });
}

/** Wrap multer so upload failures return JSON (not HTML "Request failed"). */
export function handleMultipartUpload(uploadMiddleware, fieldName, maxCount) {
  return (req, res, next) => {
    uploadMiddleware.array(fieldName, maxCount)(req, res, (err) => {
      if (!err) return next();

      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'Image too large. Each photo must be under 8 MB.' });
      }
      if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ error: `Too many images. Maximum ${maxCount} photos allowed.` });
      }

      console.error('[upload]', err);
      return res.status(400).json({
        error: err.message || 'Image upload failed. Try smaller JPG/PNG/WebP files.',
      });
    });
  };
}
