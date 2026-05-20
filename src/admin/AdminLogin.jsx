import { useEffect, useState } from 'react';
import { SITE_LOGO_ALT, SITE_LOGO_SRC, SITE_NAME } from '../constants/brand';
import { adminLogin } from '../api/adminApi';
import { checkApiHealth, setAdminToken } from '../api/client';

export default function AdminLogin({ onSuccess }) {
  const [email, setEmail] = useState('admin@flexfitstudio.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [apiOnline, setApiOnline] = useState(null);

  useEffect(() => {
    checkApiHealth().then(setApiOnline);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const online = await checkApiHealth();
    setApiOnline(online);
    if (!online) {
      setError('API server is offline. Open terminal, go to Fashion folder, run: npm run dev');
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

        {apiOnline === false && (
          <div className="admin-cyber-api-warning glass-panel" role="alert">
            <strong>API server not running</strong>
            <p>
              Admin login needs the backend. In terminal run:
              <code> npm run dev </code>
            </p>
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
              placeholder="Admin@123"
            />
          </label>

          {error && <p className="admin-cyber-error">{error}</p>}

          <button type="submit" className="admin-cyber-btn admin-cyber-btn--primary" disabled={loading}>
            {loading ? <span className="admin-chrome-loader" /> : 'Sign in'}
          </button>
        </form>

        <div className="admin-cyber-login__hint glass-panel">
          <strong>Default credentials</strong>
          <span>Email: admin@flexfitstudio.com</span>
          <span>Password: Admin@123</span>
        </div>

        <a href="/" className="admin-cyber-link">
          ← Back to storefront
        </a>
      </div>
    </div>
  );
}
