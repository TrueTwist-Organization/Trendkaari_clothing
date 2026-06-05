import { useEffect, useMemo, useState } from 'react';
import { getProductImageCandidates } from '../utils/productImages';

const FALLBACK_SRC =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect fill="#f5f0eb" width="400" height="500"/><text x="200" y="255" text-anchor="middle" fill="#9a8a82" font-family="system-ui,sans-serif" font-size="16">Image unavailable</text></svg>',
  );

/** Product image with safe fallback when file is missing or fails to load. */
export default function ProductImage({
  src,
  images,
  product,
  alt,
  className = '',
  loading = 'lazy',
  decoding = 'async',
}) {
  const candidates = useMemo(() => {
    const fromProduct = product ? getProductImageCandidates(product) : [];
    const merged = [src, ...(Array.isArray(images) ? images : []), ...fromProduct]
      .map((value) => String(value || '').trim())
      .filter(Boolean);
    return [...new Set(merged)];
  }, [src, images, product]);

  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [candidates.join('|')]);

  const currentSrc = candidates[index] || FALLBACK_SRC;

  return (
    <img
      src={currentSrc}
      alt={alt || ''}
      className={className}
      loading={loading}
      decoding={decoding}
      onError={() => {
        if (index + 1 < candidates.length) {
          setIndex((prev) => prev + 1);
          return;
        }
        if (currentSrc !== FALLBACK_SRC) {
          setIndex(candidates.length);
        }
      }}
    />
  );
}

export { FALLBACK_SRC };
