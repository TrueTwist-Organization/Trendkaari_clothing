const API_BASE = import.meta.env.VITE_API_URL || '';

export function getAdminToken() {
  return localStorage.getItem('flexfit_admin_token');
}

export function setAdminToken(token) {
  if (token) localStorage.setItem('flexfit_admin_token', token);
  else localStorage.removeItem('flexfit_admin_token');
}

export function getUserToken() {
  return localStorage.getItem('flexfit_user_token');
}

export function setUserToken(token) {
  if (token) localStorage.setItem('flexfit_user_token', token);
  else localStorage.removeItem('flexfit_user_token');
}

function isLocalDevHost() {
  if (typeof window === 'undefined') return false;
  return /localhost|127\.0\.0\.1/.test(window.location.hostname);
}

function friendlyApiError(path, res, data) {
  if (data?.error) {
    return data.error;
  }
  if (res.status === 404 && path.startsWith('/api/')) {
    return isLocalDevHost()
      ? 'API route not found. Stop the dev server (Ctrl+C) and run npm run dev again to load the latest API.'
      : 'Live API route not found. Redeploy the site on Vercel and try again.';
  }
  if (res.status === 413) {
    return 'Request too large for the server. Save fewer ad slots at once or try again.';
  }
  if (res.status === 502 || res.status === 503 || res.status === 504) {
    return isLocalDevHost()
      ? 'API server is offline. Run: npm run dev (website + API together).'
      : 'Live API timed out. Wait a few seconds and try again.';
  }
  if (res.status === 401) {
    return 'Invalid email or password.';
  }
  return res.statusText || 'Request failed';
}

function parseApiResponseBody(res, rawText) {
  const trimmed = String(rawText || '').trim();
  if (!trimmed) return {};

  try {
    return JSON.parse(trimmed);
  } catch {
    if (trimmed.startsWith('<')) {
      throw new Error(
        isLocalDevHost()
          ? 'API returned HTML instead of JSON. Run npm run dev (website + API together).'
          : 'Live API returned an error page instead of JSON. Wait a moment and try again, or redeploy on Vercel.'
      );
    }
    throw new Error(
      isLocalDevHost()
        ? 'Invalid API response. Restart: npm run dev'
        : 'Live API returned invalid data. Try again in a few seconds.'
    );
  }
}

async function readResponsePayload(res) {
  const rawText = await res.text();
  const contentType = res.headers.get('content-type') || '';

  if (contentType.includes('application/json') || rawText.trim().startsWith('{') || rawText.trim().startsWith('[')) {
    return parseApiResponseBody(res, rawText);
  }

  if (!res.ok) {
    throw new Error(friendlyApiError(res.url || '', res, {}));
  }

  throw new Error(
    isLocalDevHost()
      ? 'API returned HTML instead of JSON. Run npm run dev (website + API together).'
      : 'Live API returned an error page. Try again shortly or redeploy on Vercel.'
  );
}

/** Store/public endpoints — no admin token required */
export async function publicApiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (!(options.body instanceof FormData) && options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      isLocalDevHost()
        ? 'Cannot reach API server. Run: npm run dev'
        : 'Cannot reach live API. Check your internet connection and try again.'
    );
  }

  const data = await readResponsePayload(res).catch((err) => {
    if (!res.ok) {
      throw new Error(friendlyApiError(path, res, {}));
    }
    throw err;
  });

  if (!res.ok) {
    const err = new Error(friendlyApiError(path, res, data));
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function userApiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getUserToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!(options.body instanceof FormData) && options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      isLocalDevHost()
        ? 'Cannot reach API server. Run: npm run dev'
        : 'Cannot reach live API. Check your internet connection and try again.'
    );
  }

  const data = await readResponsePayload(res).catch((err) => {
    if (!res.ok) {
      throw new Error(friendlyApiError(path, res, {}));
    }
    throw err;
  });

  if (!res.ok) {
    const err = new Error(friendlyApiError(path, res, data));
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function apiFetch(path, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getAdminToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!(options.body instanceof FormData) && options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error(
      isLocalDevHost()
        ? 'Cannot reach API server. Run in terminal: npm run dev (from the Fashion folder).'
        : 'Cannot reach live admin API. Check your connection and try again.'
    );
  }

  const data = await readResponsePayload(res).catch((err) => {
    if (!res.ok) {
      throw new Error(friendlyApiError(path, res, {}));
    }
    throw err;
  });

  if (!res.ok) {
    const err = new Error(friendlyApiError(path, res, data));
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function checkApiHealth() {
  try {
    const res = await fetch(`${API_BASE}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}
