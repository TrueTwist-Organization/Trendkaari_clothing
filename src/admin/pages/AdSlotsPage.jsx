import { useEffect, useState } from 'react';
import { Copy, Save } from 'lucide-react';
import { fetchAdminAdSlots, saveAdminAdSlots } from '../../api/adminApi';
import { AD_PLACEMENT_DEFINITIONS, AD_PLACEMENT_SECTIONS } from '../../constants/adPlacements';
import { mergeAdSlotsForAdmin } from '../../utils/adSlots';
import { bumpAdSlotsVersion } from '../../utils/adSlotsSync';
import { CHECKOUT_STEPS } from '../../checkout/checkoutSteps';

function buildDefaultRows() {
  return mergeAdSlotsForAdmin([]);
}

function isCheckoutStepPlacement(key) {
  return key.startsWith('checkout_step_');
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

  const applyCheckoutFallbackToAllSteps = (position) => {
    const sourceKey =
      position === 'bottom' ? 'checkout_all_steps_bottom' : 'checkout_all_steps_top';
    const source = rows.find((r) => r.placement === sourceKey);
    const code = String(source?.code || '').trim();
    if (!code) {
      onToast(`Paste ad code in "${sourceKey}" first`, 'error');
      return;
    }
    setRows((prev) =>
      prev.map((row) => {
        if (!isCheckoutStepPlacement(row.placement)) return row;
        if (position === 'bottom' && !row.placement.endsWith('_bottom')) return row;
        if (position === 'top' && !row.placement.endsWith('_top')) return row;
        return { ...row, code };
      })
    );
    onToast(`Copied to all checkout step ${position} slots`);
  };

  const handleSaveAll = async () => {
    const filledRows = rows.filter((row) => String(row.code || '').trim());
    const previouslySaved = rows.filter((row) => row.updatedAt);
    const removedCount = previouslySaved.filter((row) => !String(row.code || '').trim()).length;

    if (!filledRows.length && !previouslySaved.length) {
      onToast('All slots are already empty', 'error');
      return;
    }

    if (!filledRows.length) {
      const ok = window.confirm(
        'Remove all ads from the live site? Every slot will be cleared. Click OK to confirm.'
      );
      if (!ok) return;
    }

    setSaving(true);
    try {
      const slots = rows.reduce((acc, row) => {
        acc[row.placement] = row.code;
        return acc;
      }, {});
      const filledOnForm = filledRows.length;
      const result = await saveAdminAdSlots(slots);
      const saved = result?.saved ?? result?.activeAdSlots ?? 0;
      if (result?.error && saved === 0) {
        onToast(
          result.error || 'Save failed — reload the page (Ctrl+F5) and try Save All again.',
          'error'
        );
        return;
      }
      if (saved >= 0) {
        if (filledOnForm > 0 && saved < filledOnForm) {
          onToast(
            `Only ${saved} of ${filledOnForm} slot(s) saved — check for blocked script tags and try again.`,
            'error'
          );
        } else if (!filledOnForm) {
          onToast('All ads removed from the live site');
        } else if (removedCount > 0) {
          onToast(`${saved} slot(s) saved — ${removedCount} removed from live site`);
        } else {
          onToast(`${saved} ad slot(s) saved — persists across refreshes`);
        }
        setRows(mergeAdSlotsForAdmin(result?.adSlots || []));
        bumpAdSlotsVersion();
      }
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const rowByPlacement = Object.fromEntries(rows.map((row) => [row.placement, row]));

  const renderPlacementCard = (row) => (
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
  );

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
        <strong>Remove ads</strong>
        <p>
          Clear the textarea for any slot you do not want, then click <strong>Save All Slots</strong>.
          Cleared slots are removed from the live site. To remove every ad, clear all boxes and save
          (you will be asked to confirm).
        </p>
        <p>
          After opening this page, wait until your saved codes appear before saving. If boxes look
          empty unexpectedly, <strong>reload the page</strong> first. Check{' '}
          <a href="/api/health" target="_blank" rel="noreferrer">
            /api/health
          </a>{' '}
          — <code>activeAdSlots</code> should stay &gt; 0 after save.
        </p>
        <p>
          <strong>Checkout tip:</strong> paste once in <code>checkout_all_steps_top</code> /{' '}
          <code>checkout_all_steps_bottom</code> — shows on every checkout page automatically. Or use
          the buttons below to copy to all per-page slots ({CHECKOUT_STEPS.length} pages + error).
        </p>
        <div className="admin-ad-bulk-actions">
          <button
            type="button"
            className="admin-cyber-btn"
            onClick={() => applyCheckoutFallbackToAllSteps('top')}
          >
            <Copy size={14} /> Copy fallback top → all checkout steps
          </button>
          <button
            type="button"
            className="admin-cyber-btn"
            onClick={() => applyCheckoutFallbackToAllSteps('bottom')}
          >
            <Copy size={14} /> Copy fallback bottom → all checkout steps
          </button>
        </div>
      </div>

      <div className="admin-ad-placement-list">
        {AD_PLACEMENT_SECTIONS.map((section) => {
          const sectionRows = section.keys
            .map((key) => rowByPlacement[key])
            .filter(Boolean);
          if (!sectionRows.length) return null;

          return (
            <section key={section.id} className="admin-ad-placement-section">
              <header className="admin-ad-placement-section__head">
                <h2>{section.title}</h2>
                <span className="admin-ad-placement-section__count">
                  {sectionRows.length} slot{sectionRows.length === 1 ? '' : 's'}
                </span>
              </header>
              <div className="admin-ad-placement-section__grid">
                {sectionRows.map(renderPlacementCard)}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
