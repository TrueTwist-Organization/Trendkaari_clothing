const STORE_PATH = 'server/data/store.json';
const DEFAULT_REPO = 'TrueTwist-Organization/Trendkaari_clothing';
const DEFAULT_BRANCH = 'main';

function repoConfig() {
  const full = process.env.GITHUB_REPO || DEFAULT_REPO;
  const [owner, repo] = full.split('/');
  return {
    owner,
    repo,
    branch: process.env.GITHUB_BRANCH || DEFAULT_BRANCH,
    path: STORE_PATH,
  };
}

export function useGitHubPersistence() {
  return Boolean(process.env.GITHUB_TOKEN?.trim());
}

function githubHeaders(json = true) {
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'trendkaari-api',
  };
  const token = process.env.GITHUB_TOKEN?.trim();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (json) headers['Content-Type'] = 'application/json';
  return headers;
}

export async function loadStoreFromGitHub() {
  const { owner, repo, branch, path } = repoConfig();

  if (useGitHubPersistence()) {
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
    const res = await fetch(apiUrl, { headers: githubHeaders(false) });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`GitHub read failed (${res.status})`);
    }
    const meta = await res.json();
    const raw = Buffer.from(meta.content, 'base64').toString('utf8');
    return JSON.parse(raw);
  }

  const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  const res = await fetch(rawUrl, {
    headers: { 'User-Agent': 'trendkaari-api' },
    cache: 'no-store',
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`GitHub raw read failed (${res.status})`);
  }
  return JSON.parse(await res.text());
}

export async function saveStoreToGitHub(store) {
  if (!useGitHubPersistence()) {
    throw new Error('GITHUB_TOKEN is required to save store on Vercel');
  }

  const { owner, repo, branch, path } = repoConfig();
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  const content = Buffer.from(JSON.stringify(store, null, 2), 'utf8').toString('base64');

  let sha;
  const getRes = await fetch(`${apiUrl}?ref=${branch}`, {
    headers: githubHeaders(false),
  });
  if (getRes.ok) {
    const existing = await getRes.json();
    sha = existing.sha;
  }

  const body = {
    message: `chore(store): sync catalog ${new Date().toISOString()}`,
    content,
    branch,
    ...(sha ? { sha } : {}),
  };

  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: githubHeaders(),
    body: JSON.stringify(body),
  });

  if (!putRes.ok) {
    const err = await putRes.text();
    throw new Error(`GitHub save failed (${putRes.status}): ${err.slice(0, 200)}`);
  }
}

/** Upload binary to repo (e.g. public/product-media/…). Returns raw GitHub URL. */
export async function uploadFileToGitHub(repoPath, buffer, message) {
  if (!useGitHubPersistence()) {
    throw new Error('GITHUB_TOKEN is required to upload images on Vercel');
  }

  const { owner, repo, branch } = repoConfig();
  const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${repoPath}`;

  let sha;
  const getRes = await fetch(`${apiUrl}?ref=${branch}`, {
    headers: githubHeaders(false),
  });
  if (getRes.ok) {
    sha = (await getRes.json()).sha;
  }

  const putRes = await fetch(apiUrl, {
    method: 'PUT',
    headers: githubHeaders(),
    body: JSON.stringify({
      message: message || `media: ${repoPath}`,
      content: Buffer.from(buffer).toString('base64'),
      branch,
      ...(sha ? { sha } : {}),
    }),
  });

  if (!putRes.ok) {
    const err = await putRes.text();
    throw new Error(`GitHub upload failed (${putRes.status}): ${err.slice(0, 200)}`);
  }

  return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${repoPath}`;
}
