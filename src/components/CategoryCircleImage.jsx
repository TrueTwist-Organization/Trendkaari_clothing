import { useEffect, useState } from 'react';

const CUTOUT_CACHE_VERSION = '14';

export default function CategoryCircleImage({
  src,
  alt,
  cutoutId,
  imageFocus = 'full',
}) {
  const cutoutSrc = cutoutId
    ? `/category-cutouts/${cutoutId}.png?v=${CUTOUT_CACHE_VERSION}`
    : null;
  const [imgSrc, setImgSrc] = useState(cutoutSrc || src);
  const [isCutout, setIsCutout] = useState(Boolean(cutoutSrc));

  useEffect(() => {
    if (!cutoutSrc) {
      setImgSrc(src);
      setIsCutout(false);
      return;
    }

    const probe = new Image();
    probe.onload = () => {
      setImgSrc(cutoutSrc);
      setIsCutout(true);
    };
    probe.onerror = () => {
      setImgSrc(src);
      setIsCutout(false);
    };
    probe.src = cutoutSrc;
  }, [src, cutoutSrc]);

  return (
    <span className="category-circle-visual">
      <span className="category-circle-bg" aria-hidden="true" />
      <img
        src={imgSrc}
        alt={alt}
        className={[
          'category-circle-img',
          isCutout ? 'is-cutout' : 'is-photo',
          imageFocus === 'lower' ? 'is-lower-focus' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        loading="lazy"
        decoding="async"
      />
    </span>
  );
}
