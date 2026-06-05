import { useEffect, useState } from 'react';
import { SITE_LOGO_ALT, SITE_LOGO_SRC, SITE_NAME } from '../constants/brand';
import { adminLogin } from '../api/adminApi';
import { fetchApiHealth, setAdminToken } from '../api/client';

export default function AdminLogin({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [health, setHealth] = useState(null);
  const isLocalDev =
    typeof window !== 'undefined' && /localhost|127\.0\.0\.1/.test(window.location.hostname);

  useEffect(() => {
    fetchApiHealth().then(setHealth);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const latestHealth = await fetchApiHealth();
    setHealth(latestHealth);
    if (!latestHealth.ok) {
      setError(
        isLocalDev
          ? 'API server is offline. Open terminal, go to Fashion folder, run: npm run dev'
          : 'Live API is unreachable. Check your internet connection and try again.'
      );
      return;
    }
    if (!latestHealth.persistWrites) {
      setError(
        'Admin saves are disabled on this server. Add BLOB_READ_WRITE_TOKEN in Vercel env, then redeploy.'
      );
      return;
    }

    setLoading(true);
    try {
      const data = await adminLogin(email.trim(), password);
      setAdminToken(data.token);
      onSuccess(data.admin);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-cyber-login">
      <div className="admin-cyber-login__panel glass-panel">
        <div className="admin-cyber-login__brand">
          <span className="admin-cyber-login__badge">{SITE_NAME} Admin</span>
          <img src={SITE_LOGO_SRC} alt={SITE_LOGO_ALT} className="admin-login-logo" width={280} height={72} />
          <h1>{SITE_NAME}</h1>
          <p>Manage products, orders &amp; storefront offers</p>
        </div>

        {health?.ok === false && (
          <div className="admin-cyber-api-warning glass-panel" role="alert">
            <strong>{isLocalDev ? 'API server not running' : 'Live API unreachable'}</strong>
            <p>
              {isLocalDev ? (
                <>
                  Admin login needs the backend. In terminal run:
                  <code> npm run dev </code>
                </>
              ) : (
                'Cannot reach trendkaari.com API. Check your connection or try again shortly.'
              )}
            </p>
          </div>
        )}
        {health?.ok && health.persistWrites === false && (
          <div className="admin-cyber-api-warning glass-panel" role="alert">
            <strong>Admin saves disabled</strong>
            <p>Add BLOB_READ_WRITE_TOKEN in Vercel → Settings → Environment Variables, then redeploy.</p>
          </div>
        )}

        <form className="admin-cyber-form" onSubmit={handleSubmit}>
          <label className="admin-cyber-label">
            Admin Email
            <input
              type="email"
              className="admin-cyber-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
            />
          </label>
          <label className="admin-cyber-label">
            Password
            <input
              type="password"
              className="admin-cyber-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </label>

          {error && <p className="admin-cyber-error">{error}</p>}

          <button type="submit" className="admin-cyber-btn admin-cyber-btn--primary" disabled={loading}>
            {loading ? <span className="admin-chrome-loader" /> : 'Sign in'}
          </button>
        </form>

        <a href="/" className="admin-cyber-link">
          ← Back to storefront
        </a>
      </div>
    </div>
  );
}
