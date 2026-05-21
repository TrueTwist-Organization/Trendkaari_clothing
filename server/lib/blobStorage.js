import { uploadFileToGitHub, useGitHubPersistence } from './githubStore.js';

export function useBlobPersistence() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export function useRemoteMediaUpload() {
  return useBlobPersistence() || useGitHubPersistence();
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

export async function uploadBufferToRemote(pathname, buffer, contentType) {
  if (useGitHubPersistence()) {
    return uploadFileToGitHub(pathname, buffer, `media: ${pathname}`);
  }
  if (useBlobPersistence()) {
    return uploadBufferToBlob(pathname, buffer, contentType);
  }
  return null;
}
