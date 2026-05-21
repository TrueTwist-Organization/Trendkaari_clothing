import { useEffect, useRef, useState } from 'react';
import { Gift, Plus, Edit, Trash2, Upload, RotateCcw } from 'lucide-react';
import {
  createGiftCombo,
  deleteGiftCombo,
  fetchAdminGiftCombos,
  seedDefaultGiftCombos,
  updateGiftCombo,
  uploadGiftComboImages,
} from '../../api/adminApi';

const THEMES = [
  { value: 'emerald', label: 'Emerald' },
  { value: 'burgundy', label: 'Burgundy' },
  { value: 'navy', label: 'Navy' },
];

function emptyForm() {
  return {
    id: '',
    active: true,
    sortOrder: 0,
    theme: 'emerald',
    badge: '',
    name: '',
    description: '',
    heroImage: '',
    comboImagesText: '',
    productId: '',
    partnerProductId: '',
    price: '',
  };
}

function comboToForm(combo) {
  return {
    id: combo.id,
    active: combo.active !== false,
    sortOrder: combo.sortOrder ?? 0,
    theme: combo.theme || 'emerald',
    badge: combo.badge || '',
    name: combo.name || '',
    description: combo.description || '',
    heroImage: combo.heroImage || '',
    comboImagesText: (combo.comboImages || []).join('\n'),
    productId: combo.productId ?? '',
    partnerProductId: combo.partnerProductId ?? '',
    price: combo.price ?? '',
  };
}

function formToPayload(form) {
  const comboImages = form.comboImagesText
    .split(/[\n,]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const heroImage = form.heroImage.trim() || comboImages[0] || '';
  const galleryIds = [form.productId, form.partnerProductId]
    .map((v) => Number(v))
    .filter((n) => !Number.isNaN(n) && n > 0);

  return {
    id: form.id.trim() || undefined,
    active: form.active,
    sortOrder: Number(form.sortOrder) || 0,
    theme: form.theme,
    badge: form.badge.trim(),
    name: form.name.trim(),
    description: form.description.trim(),
    heroImage,
    comboImages: comboImages.length ? comboImages : heroImage ? [heroImage] : [],
    productId: Number(form.productId),
    partnerProductId: form.partnerProductId ? Number(form.partnerProductId) : null,
    galleryProductIds: galleryIds,
    price: Number(form.price),
  };
}

export default function GiftCombosPage({ onToast }) {
  const [combos, setCombos] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const load = () => {
    setLoading(true);
    return fetchAdminGiftCombos()
      .then((d) => setCombos(d.giftCombos || []))
      .catch((err) => onToast(err.message, 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
  };

  const startEdit = (combo) => {
    setEditingId(combo.id);
    setForm(comboToForm(combo));
  };

  const patchForm = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleUpload = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    if (!files.length) return;
    setUploading(true);
    try {
      const { urls } = await uploadGiftComboImages(files);
      const merged = [
        ...form.comboImagesText.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean),
        ...urls,
      ];
      const unique = [...new Set(merged)];
      patchForm('comboImagesText', unique.join('\n'));
      if (!form.heroImage && unique[0]) patchForm('heroImage', unique[0]);
      onToast(`${urls.length} image(s) uploaded to /combos/`);
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = formToPayload(form);
      if (editingId) {
        await updateGiftCombo(editingId, payload);
        onToast('Gift combo updated — live on homepage');
      } else {
        await createGiftCombo(payload);
        onToast('Gift combo added — live on homepage');
      }
      resetForm();
      await load();
    } catch (err) {
      onToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (combo) => {
    if (!window.confirm(`Remove "${combo.name}" from Gift Collection?`)) return;
    try {
      await deleteGiftCombo(combo.id);
      onToast('Combo removed');
      if (editingId === combo.id) resetForm();
      await load();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  const handleRestoreDefaults = async () => {
    if (!window.confirm('Replace all gift combos with the built-in default set?')) return;
    try {
      await seedDefaultGiftCombos();
      onToast('Default combos restored');
      resetForm();
      await load();
    } catch (err) {
      onToast(err.message, 'error');
    }
  };

  return (
    <div className="admin-cyber-page admin-gift-combos-page">
      <header className="admin-cyber-page__head admin-cyber-page__head--row">
        <div>
          <h1>
            <Gift size={22} style={{ verticalAlign: 'middle', marginRight: 8 }} />
            Gift Combos
          </h1>
          <p>Add couple gift boxes for the homepage Gift Collection — images, prices & linked product IDs</p>
        </div>
        <button
          type="button"
          className="admin-cyber-btn admin-cyber-btn--ghost"
          onClick={handleRestoreDefaults}
        >
          <RotateCcw size={16} /> Restore defaults
        </button>
      </header>

      <div className="admin-cyber-grid-2 admin-gift-combos-grid">
        <form className="glass-panel admin-cyber-card admin-gift-combo-form" onSubmit={handleSubmit}>
          <h3>{editingId ? 'Edit combo' : 'New gift combo'}</h3>

          {!editingId && (
            <label className="admin-cyber-label">
              Combo ID (optional slug)
              <input
                className="admin-cyber-input"
                value={form.id}
                onChange={(e) => patchForm('id', e.target.value)}
                placeholder="couple-sunflower-resort"
              />
            </label>
          )}

          <label className="admin-cyber-label">
            Display name *
            <input
              className="admin-cyber-input"
              value={form.name}
              onChange={(e) => patchForm('name', e.target.value)}
              required
            />
          </label>

          <label className="admin-cyber-label">
            Badge (ribbon text)
            <input
              className="admin-cyber-input"
              value={form.badge}
              onChange={(e) => patchForm('badge', e.target.value)}
              placeholder="Resort match"
            />
          </label>

          <label className="admin-cyber-label">
            Short description
            <textarea
              className="admin-cyber-input"
              rows={3}
              value={form.description}
              onChange={(e) => patchForm('description', e.target.value)}
            />
          </label>

          <div className="admin-cyber-form-row">
            <label className="admin-cyber-label">
              Gift price (₹) *
              <input
                className="admin-cyber-input"
                type="number"
                min={1}
                value={form.price}
                onChange={(e) => patchForm('price', e.target.value)}
                required
              />
            </label>
            <label className="admin-cyber-label">
              Sort order
              <input
                className="admin-cyber-input"
                type="number"
                value={form.sortOrder}
                onChange={(e) => patchForm('sortOrder', e.target.value)}
              />
            </label>
          </div>

          <div className="admin-cyber-form-row">
            <label className="admin-cyber-label">
              Box theme
              <select
                className="admin-cyber-input"
                value={form.theme}
                onChange={(e) => patchForm('theme', e.target.value)}
              >
                {THEMES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-cyber-label admin-cyber-label--checkbox">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => patchForm('active', e.target.checked)}
              />
              Show on storefront
            </label>
          </div>

          <div className="admin-cyber-form-row">
            <label className="admin-cyber-label">
              Her product ID *
              <input
                className="admin-cyber-input"
                type="number"
                value={form.productId}
                onChange={(e) => patchForm('productId', e.target.value)}
                required
              />
            </label>
            <label className="admin-cyber-label">
              His product ID
              <input
                className="admin-cyber-input"
                type="number"
                value={form.partnerProductId}
                onChange={(e) => patchForm('partnerProductId', e.target.value)}
              />
            </label>
          </div>

          <label className="admin-cyber-label">
            Hero image URL (card face)
            <input
              className="admin-cyber-input"
              value={form.heroImage}
              onChange={(e) => patchForm('heroImage', e.target.value)}
              placeholder="/combos/combo-example.webp"
            />
          </label>

          <label className="admin-cyber-label">
            Gallery images (one path per line)
            <textarea
              className="admin-cyber-input admin-gift-combo-images-ta"
              rows={5}
              value={form.comboImagesText}
              onChange={(e) => patchForm('comboImagesText', e.target.value)}
              placeholder="/combos/image-1.webp"
            />
          </label>

          <div className="admin-gift-combo-upload-row">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={handleUpload}
            />
            <button
              type="button"
              className="admin-cyber-btn admin-cyber-btn--ghost"
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? (
                <span className="admin-chrome-loader" />
              ) : (
                <>
                  <Upload size={16} /> Upload images
                </>
              )}
            </button>
            <span className="admin-gift-combo-upload-hint">Saved to public/combos/</span>
          </div>

          <div className="admin-cyber-form-actions">
            <button type="submit" className="admin-cyber-btn admin-cyber-btn--primary" disabled={saving}>
              {saving ? <span className="admin-chrome-loader" /> : editingId ? 'Save changes' : 'Add combo'}
            </button>
            {editingId && (
              <button type="button" className="admin-cyber-btn admin-cyber-btn--ghost" onClick={resetForm}>
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="admin-gift-combo-list-wrap">
          <h3 className="admin-gift-combo-list-title">
            Live combos ({combos.length})
          </h3>
          {loading ? (
            <p className="admin-cyber-muted">Loading…</p>
          ) : combos.length === 0 ? (
            <p className="admin-cyber-muted">No combos yet. Add one with the form.</p>
          ) : (
            <ul className="admin-gift-combo-list">
              {combos.map((combo) => (
                <li key={combo.id} className="glass-panel admin-gift-combo-list-item">
                  <div className="admin-gift-combo-list-item__thumb">
                    {combo.heroImage ? (
                      <img src={combo.heroImage} alt="" />
                    ) : (
                      <span>No image</span>
                    )}
                  </div>
                  <div className="admin-gift-combo-list-item__body">
                    <strong>{combo.name}</strong>
                    <span className="admin-gift-combo-list-item__meta">
                      ₹{combo.price?.toLocaleString('en-IN')} · {combo.badge} · order {combo.sortOrder}
                      {!combo.active && ' · hidden'}
                    </span>
                    <span className="admin-gift-combo-list-item__ids">
                      IDs: {combo.productId}
                      {combo.partnerProductId ? ` + ${combo.partnerProductId}` : ''}
                    </span>
                  </div>
                  <div className="admin-gift-combo-list-item__actions">
                    <button
                      type="button"
                      className="admin-cyber-icon-btn"
                      title="Edit"
                      onClick={() => startEdit(combo)}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      type="button"
                      className="admin-cyber-icon-btn admin-cyber-icon-btn--danger"
                      title="Delete"
                      onClick={() => handleDelete(combo)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <button
            type="button"
            className="admin-cyber-btn admin-cyber-btn--ghost admin-gift-combo-add-btn"
            onClick={resetForm}
          >
            <Plus size={16} /> New combo
          </button>
        </div>
      </div>
    </div>
  );
}
