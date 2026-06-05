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

function friendlyApiError(path, res, data) {
  if (data?.error) {
    return data.error;
  }
  if (res.status === 404 && path.startsWith('/api/')) {
    return 'API route not found. Stop the dev server (Ctrl+C) and run npm run dev again to load the latest API.';
  }
  if (res.status === 502 || res.status === 503) {
    return 'API server is offline. Run: npm run dev (website + API together).';
  }
  if (res.status === 401) {
    return 'Invalid email or password.';
  }
  return res.statusText || 'Request failed';
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
    throw new Error('Cannot reach API server. Run: npm run dev');
  }

  let data = {};
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => ({}));
  }
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
    throw new Error('Cannot reach API server. Run: npm run dev');
  }

  let data = {};
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json().catch(() => ({}));
  }
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
      'Cannot reach API server. Run in terminal: npm run dev (from the Fashion folder).'
    );
  }

  let data = {};
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await res.json();
    } catch {
      throw new Error('Invalid API response. Restart: npm run dev');
    }
  } else if (!res.ok) {
    throw new Error(friendlyApiError(path, res, data));
  } else {
    throw new Error(
      'API returned HTML instead of JSON. Run npm run dev (website + API together) or check the live API deployment.'
    );
  }
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
