import { useEffect, useState } from 'react';
import { fetchAdminSettings, saveAdminSettings } from '../../api/adminApi';

const EMPTY = {
  siteName: '',
  tagline: '',
  seoKeywords: '',
  metaDescription: '',
  footerText: '',
};

export default function SettingsPage({ onToast }) {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdminSettings()
      .then((d) => setForm({ ...EMPTY, ...d.settings }))
      .catch((err) => onToast?.(err.message, 'error'))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const patch = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = await saveAdminSettings(form);
      setForm({ ...EMPTY, ...data.settings });
      onToast('Settings saved — visible on storefront');
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-cyber-page">
        <span className="admin-chrome-loader admin-chrome-loader--lg" />
      </div>
    );
  }

  return (
    <div className="admin-cyber-page">
      <header className="admin-cyber-page__head">
        <h1>Settings</h1>
        <p>Configure your store details and SEO</p>
      </header>

      <form className="glass-panel admin-cyber-card admin-settings-form" onSubmit={handleSubmit}>
        <label className="admin-cyber-label">
          Site Name
          <input
            className="admin-cyber-input"
            value={form.siteName}
            onChange={(e) => patch('siteName', e.target.value)}
            required
          />
        </label>
        <label className="admin-cyber-label">
          Tagline
          <input
            className="admin-cyber-input"
            value={form.tagline}
            onChange={(e) => patch('tagline', e.target.value)}
          />
        </label>
        <label className="admin-cyber-label">
          SEO Keywords
          <input
            className="admin-cyber-input"
            value={form.seoKeywords}
            onChange={(e) => patch('seoKeywords', e.target.value)}
            placeholder="shopping, ethnic wear, kurtas"
          />
        </label>
        <label className="admin-cyber-label">
          Meta Description
          <textarea
            className="admin-cyber-input admin-cyber-textarea"
            rows={3}
            value={form.metaDescription}
            onChange={(e) => patch('metaDescription', e.target.value)}
          />
        </label>
        <label className="admin-cyber-label">
          Footer Text
          <textarea
            className="admin-cyber-input admin-cyber-textarea"
            rows={4}
            value={form.footerText}
            onChange={(e) => patch('footerText', e.target.value)}
          />
        </label>
        <button type="submit" className="admin-cyber-btn admin-cyber-btn--primary" disabled={saving}>
          {saving ? <span className="admin-chrome-loader" /> : 'Save Settings'}
        </button>
      </form>
    </div>
  );
}
