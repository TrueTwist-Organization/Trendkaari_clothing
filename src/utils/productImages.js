/** Resolve the best product image URL for cards, cart, PDP, and search. */

function cleanUrl(value) {
  const text = String(value || '').trim();
  return text || '';
}

export function getProductImageCandidates(product) {
  if (!product) return [];

  const merged = [
    product.image,
    product.heroImage,
    ...(Array.isArray(product.images) ? product.images : []),
  ]
    .map(cleanUrl)
    .filter(Boolean);

  return [...new Set(merged)];
}

export function getProductPrimaryImage(product) {
  const candidates = getProductImageCandidates(product);
  const remote = candidates.find((url) => /^https?:\/\//i.test(url));
  if (remote) return remote;
  return candidates[0] || '';
}

export function getProductGalleryImages(product) {
  const candidates = getProductImageCandidates(product);
  if (candidates.length) return candidates;
  const primary = getProductPrimaryImage(product);
  return primary ? [primary] : [];
}

export function getProductHoverImage(product) {
  const gallery = getProductGalleryImages(product);
  if (gallery.length > 1) return gallery[1];
  return getProductPrimaryImage(product);
}
