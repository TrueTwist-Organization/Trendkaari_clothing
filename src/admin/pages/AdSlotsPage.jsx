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
      const filledOnForm = Object.values(slots).filter((c) => String(c || '').trim()).length;
      const result = await saveAdminAdSlots(slots);
      const saved = result?.saved ?? result?.activeAdSlots ?? 0;
      if (saved > 0) {
        onToast(`${saved} ad slot(s) saved — persists across refreshes`);
        setRows(mergeAdSlotsForAdmin(result?.adSlots || []));
      } else if (filledOnForm > 0) {
        onToast(
          result?.error ||
            'Save failed: hosting blocked the ad scripts. Hard-refresh (Ctrl+F5) and save again.',
          'error'
        );
      } else {
        onToast(result?.error || 'No slots had code — paste your ad HTML first', 'error');
      }
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
        <strong>Important — avoid losing ads</strong>
        <p>
          After opening this page, wait until your saved codes appear in the boxes below before
          saving. If boxes look empty, <strong>reload the page</strong> first — do not click Save
          with empty boxes (that can wipe live ads). Check{' '}
          <a href="/api/health" target="_blank" rel="noreferrer">
            /api/health
          </a>{' '}
          — <code>activeAdSlots</code> should stay &gt; 0 after save.
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
