import { buildDetailDraftProduct, fillDetailFormFromDefaults } from './productDetailFields';

function KeyValueEditor({ title, rows, onChange }) {
  return (
    <div className="admin-cyber-detail-block">
      <div className="admin-cyber-detail-block__head">
        <h4>{title}</h4>
        <button
          type="button"
          className="admin-cyber-btn admin-cyber-btn--ghost"
          onClick={() => onChange([...rows, { key: '', value: '' }])}
        >
          + Add row
        </button>
      </div>
      {rows.map((row, idx) => (
        <div key={idx} className="admin-cyber-form-grid admin-cyber-form-grid--2">
          <input
            className="admin-cyber-input"
            placeholder="Label"
            value={row.key}
            onChange={(e) => {
              const next = rows.map((r, i) =>
                i === idx ? { ...r, key: e.target.value } : r
              );
              onChange(next);
            }}
          />
          <input
            className="admin-cyber-input"
            placeholder="Value"
            value={row.value}
            onChange={(e) => {
              const next = rows.map((r, i) =>
                i === idx ? { ...r, value: e.target.value } : r
              );
              onChange(next);
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default function AdminProductDetailsForm({
  form,
  onChange,
  title,
  description,
  gender,
  subCategory,
  fabricTags,
  price,
  originalPrice,
}) {
  const patch = (partial) => onChange({ ...form, ...partial });

  const handleFillDefaults = () => {
    const draft = buildDetailDraftProduct({
      title,
      description,
      gender,
      subCategory,
      fabricTags,
      price,
      originalPrice,
    });
    onChange(fillDetailFormFromDefaults(form, draft));
  };

  return (
    <div className="admin-cyber-details-step">
      <p className="admin-cyber-details-hint">
        Same sections customers see on the product page. Each product gets its own suggested copy
        (by title, category & fabric). Leave fields empty and trendkaari auto-fills unique defaults on
        publish.
      </p>
      <button type="button" className="admin-cyber-btn" onClick={handleFillDefaults}>
        Fill with suggested defaults
      </button>

      <label className="admin-cyber-label">
        Long product description
        <textarea
          className="admin-cyber-input admin-cyber-textarea"
          rows={5}
          value={form.descriptionLong}
          onChange={(e) => patch({ descriptionLong: e.target.value })}
          placeholder="Shown under Product description on the storefront"
        />
      </label>

      <div className="admin-cyber-form-grid admin-cyber-form-grid--3">
        <label className="admin-cyber-label">
          Discount badge
          <input
            className="admin-cyber-input"
            value={form.discount}
            onChange={(e) => patch({ discount: e.target.value })}
            placeholder="e.g. 50% OFF"
          />
        </label>
        <label className="admin-cyber-label">
          Rating (0–5)
          <input
            type="number"
            min="0"
            max="5"
            step="0.1"
            className="admin-cyber-input"
            value={form.rating}
            onChange={(e) => patch({ rating: e.target.value })}
            placeholder="4.8"
          />
        </label>
        <label className="admin-cyber-label">
          Review count
          <input
            type="number"
            min="0"
            className="admin-cyber-input"
            value={form.reviewsCount}
            onChange={(e) => patch({ reviewsCount: e.target.value })}
            placeholder="12"
          />
        </label>
      </div>

      <KeyValueEditor
        title="Top highlights (product page)"
        rows={form.highlightRows}
        onChange={(highlightRows) => patch({ highlightRows })}
      />

      <label className="admin-cyber-label">
        About this item (one point per line)
        <textarea
          className="admin-cyber-input admin-cyber-textarea"
          rows={6}
          value={form.aboutItemsText}
          onChange={(e) => patch({ aboutItemsText: e.target.value })}
          placeholder={'PREMIUM FABRIC: …\nDESIGN & CRAFT: …'}
        />
      </label>

      <KeyValueEditor
        title="Additional information"
        rows={form.additionalInfoRows}
        onChange={(additionalInfoRows) => patch({ additionalInfoRows })}
      />
    </div>
  );
}
