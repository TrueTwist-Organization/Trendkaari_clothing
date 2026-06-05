/** Admin-created SKUs live above catalog IDs so sync never overwrites them. */
export const ADMIN_PRODUCT_ID_BASE = 900_000;

export function nextAdminProductId(products = []) {
  let maxAdmin = ADMIN_PRODUCT_ID_BASE - 1;
  for (const p of products) {
    const id = Number(p.id) || 0;
    if (
      id >= ADMIN_PRODUCT_ID_BASE ||
      p.source === 'admin' ||
      p.adminCreated === true
    ) {
      maxAdmin = Math.max(maxAdmin, id);
    }
  }
  return maxAdmin + 1;
}
