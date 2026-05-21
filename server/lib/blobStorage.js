export function useBlobPersistence() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

/** Upload binary to Vercel Blob (public URL for storefront/admin). */
export async function uploadBufferToBlob(pathname, buffer, contentType) {
  const { put } = await import('@vercel/blob');
  const blob = await put(pathname, buffer, {
    access: 'public',
    addRandomSuffix: true,
    contentType,
  });
  return blob.url;
}
