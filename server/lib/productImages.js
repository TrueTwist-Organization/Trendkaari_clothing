/** Keep product.image and product.images in sync for admin uploads + storefront cards. */

function cleanUrl(value) {
  const text = String(value || '').trim();
  return text || '';
}

function isRemoteUrl(url) {
  return /^https?:\/\//i.test(url);
}

export function normalizeProductImages(product) {
  if (!product || typeof product !== 'object') return product;

  const merged = [
    ...(Array.isArray(product.images) ? product.images : []),
    product.image,
    product.heroImage,
  ]
    .map(cleanUrl)
    .filter(Boolean);

  const unique = [...new Set(merged)];

  let image = cleanUrl(product.image);
  const remote = unique.filter(isRemoteUrl);
  const local = unique.filter((url) => !isRemoteUrl(url));

  if (remote.length) {
    image = remote.includes(image) ? image : remote[0];
  } else if (local.length) {
    image = local.includes(image) ? image : local[0];
  } else if (unique.length) {
    image = unique[0];
  }

  const images = unique.length ? unique : image ? [image] : [];

  if (images.length && (!image || !images.includes(image))) {
    image = images[0];
  }

  return {
    ...product,
    image: image || '',
    images: images.length ? images : image ? [image] : [],
  };
}

export function mergeUploadedProductImages(data = {}, newImages = [], existing = null) {
  const uploaded = (newImages || []).map(cleanUrl).filter(Boolean);
  const fromPayload = (Array.isArray(data.images) ? data.images : []).map(cleanUrl).filter(Boolean);
  const fromExisting = (existing?.images || []).map(cleanUrl).filter(Boolean);
  const payloadImage = cleanUrl(data.image);
  const existingImage = cleanUrl(existing?.image);

  const merged = uploaded.length
    ? [...uploaded, ...fromPayload, ...fromExisting]
    : [...fromPayload, ...fromExisting, payloadImage, existingImage];

  const unique = [...new Set(merged.map(cleanUrl).filter(Boolean))];

  let image = '';
  if (uploaded.length) image = uploaded[0];
  else if (payloadImage) image = payloadImage;
  else if (unique.length) image = unique[0];
  else image = existingImage;

  if (image.startsWith('/product-media/') && unique.some(isRemoteUrl)) {
    image = unique.find(isRemoteUrl) || image;
  }

  const images = unique.length ? unique : image ? [image] : [];
  if (images.length && (!image || !images.includes(image))) {
    image = images[0];
  }

  return { image: image || '', images };
}
