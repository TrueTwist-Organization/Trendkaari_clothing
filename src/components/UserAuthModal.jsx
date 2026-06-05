import { useState } from 'react';
import { SITE_LOGO_ALT, SITE_LOGO_SRC, SITE_NAME } from '../constants/brand';
import { X } from 'lucide-react';
import { userLogin, userRegister } from '../api/userApi';
import { setUserToken } from '../api/client';
import './UserAuthModal.css';

export default function UserAuthModal({ isOpen, onClose, onSuccess, initialMode = 'login' }) {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setError('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let data;
      if (mode === 'register') {
        data = await userRegister({ name, email, password, phone });
      } else {
        data = await userLogin(email, password);
      }
      setUserToken(data.token);
      onSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-auth-overlay" role="dialog" aria-modal="true">
      <div className="user-auth-backdrop" onClick={onClose} aria-hidden="true" />
      <div className="user-auth-panel">
        <button type="button" className="user-auth-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>

        <div className="user-auth-brand">
          <img src={SITE_LOGO_SRC} alt={SITE_LOGO_ALT} className="user-auth-logo" width={260} height={64} />
          <span className="user-auth-badge">{SITE_NAME}</span>
          <h2>{mode === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p>
            {mode === 'login'
              ? 'Login to shop and place your order'
              : 'Register to start shopping ethnic wear'}
          </p>
        </div>

        <form className="user-auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label className="user-auth-field">
              Full Name
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
              />
            </label>
          )}

          <label className="user-auth-field">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@email.com"
            />
          </label>

          {mode === 'register' && (
            <label className="user-auth-field">
              Phone (optional)
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
            </label>
          )}

          <label className="user-auth-field">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder={mode === 'register' ? 'Min 6 characters' : 'Your password'}
            />
          </label>

          {error && <p className="user-auth-error">{error}</p>}

          <button type="submit" className="btn btn-primary user-auth-submit" disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'LOGIN & SHOP' : 'CREATE ACCOUNT'}
          </button>
        </form>

        <p className="user-auth-switch">
          {mode === 'login' ? (
            <>
              New here?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('register');
                  resetForm();
                }}
              >
                Create account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  resetForm();
                }}
              >
                Login
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
