import { applyProductDetailDefaults } from '../../src/utils/productContent.js';

export function enrichProductRecord(product) {
  return applyProductDetailDefaults(product);
}
