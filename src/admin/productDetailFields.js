import { getDefaultRatingReviews, getProductDetailContent } from '../utils/productContent';

export function objectToRows(obj = {}) {
  const entries = Object.entries(obj || {});
  if (!entries.length) return [{ key: '', value: '' }];
  return entries.map(([key, value]) => ({ key, value: String(value) }));
}

export function rowsToObject(rows) {
  return (rows || []).reduce((acc, row) => {
    const key = String(row.key || '').trim();
    if (!key) return acc;
    acc[key] = String(row.value || '').trim();
    return acc;
  }, {});
}

export function linesToAboutItems(text) {
  return String(text || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

export function aboutItemsToLines(items) {
  return (items || []).join('\n');
}

export function emptyDetailFormState() {
  return {
    descriptionLong: '',
    discount: '',
    rating: '',
    reviewsCount: '',
    highlightRows: [{ key: '', value: '' }],
    aboutItemsText: '',
    additionalInfoRows: [{ key: '', value: '' }],
  };
}

export function productToDetailFormState(product) {
  if (!product) return emptyDetailFormState();
  return {
    descriptionLong: product.descriptionLong || product.description || '',
    discount: product.discount || '',
    rating: product.rating != null ? String(product.rating) : '',
    reviewsCount: product.reviewsCount != null ? String(product.reviewsCount) : '',
    highlightRows: objectToRows(product.highlights),
    aboutItemsText: aboutItemsToLines(product.aboutItems),
    additionalInfoRows: objectToRows(product.additionalInfo),
  };
}

export function buildDetailDraftProduct({
  title,
  description,
  gender,
  subCategory,
  fabricTags,
  price,
  originalPrice,
}) {
  return {
    title,
    description,
    gender,
    subCategory,
    category: gender === 'gents' ? 'men' : 'women',
    fabricTags,
    price: Number(price) || 0,
    originalPrice: Number(originalPrice) || Number(price) || 0,
  };
}

export function fillDetailFormFromDefaults(form, draftProduct) {
  const content = getProductDetailContent(draftProduct);
  if (!content) return form;

  const price = Number(draftProduct.price) || 0;
  const originalPrice = Number(draftProduct.originalPrice) || price;
  const autoDiscount =
    originalPrice > price
      ? `${Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF`
      : 'SPECIAL OFFER';
  const { rating, reviewsCount } = getDefaultRatingReviews(draftProduct);

  return {
    descriptionLong: form.descriptionLong.trim() || content.descriptionLong || '',
    discount: form.discount.trim() || autoDiscount,
    rating: form.rating.trim() || String(rating),
    reviewsCount: form.reviewsCount.trim() || String(reviewsCount),
    highlightRows:
      form.highlightRows.some((r) => r.key.trim()) ?
        form.highlightRows
      : objectToRows(content.highlights),
    aboutItemsText:
      form.aboutItemsText.trim() || aboutItemsToLines(content.aboutItems),
    additionalInfoRows:
      form.additionalInfoRows.some((r) => r.key.trim()) ?
        form.additionalInfoRows
      : objectToRows(content.additionalInfo),
  };
}

export function detailFormToPayload(form) {
  const highlights = rowsToObject(form.highlightRows);
  const additionalInfo = rowsToObject(form.additionalInfoRows);
  const aboutItems = linesToAboutItems(form.aboutItemsText);

  return {
    descriptionLong: form.descriptionLong.trim(),
    discount: form.discount.trim(),
    rating: form.rating.trim() ? Number(form.rating) : undefined,
    reviewsCount: form.reviewsCount.trim() ? Number(form.reviewsCount) : undefined,
    highlights: Object.keys(highlights).length ? highlights : undefined,
    aboutItems: aboutItems.length ? aboutItems : undefined,
    additionalInfo: Object.keys(additionalInfo).length ? additionalInfo : undefined,
  };
}
