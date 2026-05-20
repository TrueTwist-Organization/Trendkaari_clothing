import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { fetchAdminAdSlots, saveAdminAdSlots } from '../../api/adminApi';
import { AD_PLACEMENT_DEFINITIONS, mergeAdSlotsForAdmin } from '../../utils/adSlots';

function buildDefaultRows() {
  return mergeAdSlotsForAdmin([]);
}

export default function AdSlotsPage({ onToast }) {
  const [rows, setRows] = useState(buildDefaultRows);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoadError('');
    return fetchAdminAdSlots()
      .then((d) => setRows(mergeAdSlotsForAdmin(d?.adSlots || [])))
      .catch((err) => {
        setRows(buildDefaultRows());
        setLoadError(
          err.message ||
            'Could not load saved ads. Showing empty slots — save will work after API is online.'
        );
      });
  };

  useEffect(() => {
    load();
  }, []);

  const patchCode = (placement, code) => {
    setRows((prev) => prev.map((r) => (r.placement === placement ? { ...r, code } : r)));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const slots = rows.reduce((acc, row) => {
        acc[row.placement] = row.code;
        return acc;
      }, {});
      await saveAdminAdSlots(slots);
      onToast('All ad slots saved — live on storefront');
      await load();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-cyber-page admin-ad-slots-page">
      <header className="admin-cyber-page__head admin-cyber-page__head--row">
        <div>
          <h1>Ad Slots</h1>
          <p>Manage ad placements — paste HTML / script code per slot ({AD_PLACEMENT_DEFINITIONS.length} slots)</p>
        </div>
        <button
          type="button"
          className="admin-cyber-btn admin-cyber-btn--primary"
          disabled={saving}
          onClick={handleSaveAll}
        >
          {saving ? (
            <span className="admin-chrome-loader" />
          ) : (
            <>
              <Save size={16} /> Save All Slots
            </>
          )}
        </button>
      </header>

      {loadError && (
        <p className="admin-cyber-error admin-cyber-error--banner" role="alert">
          {loadError}
        </p>
      )}

      <div className="admin-ad-waf-banner glass-panel">
        <strong>Script-friendly save</strong>
        <p>
          Paste Google Ad Manager, Tag Manager, or any HTML/script into each box below. Code is
          Base64-encoded when saved so hosting firewalls are less likely to block it.
        </p>
      </div>

      <div className="admin-ad-placement-list">
        {rows.map((row) => (
          <div key={row.placement} className="glass-panel admin-ad-placement-card">
            <div className="admin-ad-placement-card__head">
              <h3>{row.title}</h3>
              <span className="admin-ad-placement-card__key">{row.placement}</span>
            </div>
            <p className="admin-ad-placement-card__desc">{row.description}</p>
            <label className="admin-cyber-label admin-ad-code-label">
              Ad HTML / script
              <textarea
                className="admin-cyber-input admin-ad-code-textarea"
                rows={8}
                value={row.code}
                onChange={(e) => patchCode(row.placement, e.target.value)}
                placeholder={row.placeholder}
                spellCheck={false}
              />
            </label>
            {row.updatedAt && (
              <span className="admin-ad-placement-card__meta">
                Last saved: {new Date(row.updatedAt).toLocaleString('en-IN')}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
