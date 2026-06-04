import { useEffect, useState } from 'react';

const FALLBACK_SRC =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 400 500"><rect fill="#f5f0eb" width="400" height="500"/><text x="200" y="255" text-anchor="middle" fill="#9a8a82" font-family="system-ui,sans-serif" font-size="16">Image unavailable</text></svg>',
  );

/** Product image with safe fallback when file is missing or fails to load. */
export default function ProductImage({ src, alt, className = '', loading = 'lazy', decoding = 'async' }) {
  const [currentSrc, setCurrentSrc] = useState(src || FALLBACK_SRC);

  useEffect(() => {
    setCurrentSrc(src || FALLBACK_SRC);
  }, [src]);

  return (
    <img
      src={currentSrc}
      alt={alt || ''}
      className={className}
      loading={loading}
      decoding={decoding}
      onError={() => {
        if (currentSrc !== FALLBACK_SRC) setCurrentSrc(FALLBACK_SRC);
      }}
    />
  );
}

export { FALLBACK_SRC };
