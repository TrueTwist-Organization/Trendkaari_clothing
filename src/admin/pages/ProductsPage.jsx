import { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  createProduct,
  deleteProduct,
  fetchAdminProducts,
  syncAdminCatalog,
  updateProduct,
} from '../../api/adminApi';
import { fetchStoreProducts } from '../../api/storeApi';
import { fetchApiHealth, getAdminToken, setAdminToken } from '../../api/client';
import { resetCatalogCache } from '../../utils/loadCatalog';
import { bumpCatalogVersion } from '../../utils/catalogSync';
import { getProductGalleryImages, getProductPrimaryImage } from '../../utils/productImages';
import {
  FABRIC_TAGS,
  GENTS_CATEGORIES,
  hexForProductColor,
  LADIES_CATEGORIES,
  PRODUCT_COLORS,
  sizesForGender,
} from '../constants';
import AdminProductDetailsForm from '../AdminProductDetailsForm';
import {
  detailFormToPayload,
  emptyDetailFormState,
  productToDetailFormState,
} from '../productDetailFields';

const STEPS = ['Basic Info', 'Taxonomy', 'Storefront Details', 'Variants', 'Media'];

function emptyVariant(gender) {
  const stockBySize = {};
  sizesForGender(gender).forEach((sz) => {
    stockBySize[sz] = 5;
  });
  return {
    id: crypto.randomUUID(),
    color: PRODUCT_COLORS[0].value,
    colorHex: PRODUCT_COLORS[0].hex,
    stockBySize,
  };
}

function colorOptionsForVariant(currentColor) {
  if (!currentColor || PRODUCT_COLORS.some((c) => c.value === currentColor)) {
    return PRODUCT_COLORS;
  }
  return [
    ...PRODUCT_COLORS,
    { value: currentColor, label: currentColor, hex: hexForProductColor(currentColor) },
  ];
}

export default function ProductsPage({ onToast }) {
  const [products, setProducts] = useState([]);
  const [genderFilter, setGenderFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState(0);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [saveBlocked, setSaveBlocked] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [gender, setGender] = useState('ladies');
  const [subCategory, setSubCategory] = useState('kurtas');
  const [fabricTags, setFabricTags] = useState(['Cotton']);
  const [variants, setVariants] = useState([emptyVariant('ladies')]);
  const [imageFiles, setImageFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [mediaDragOver, setMediaDragOver] = useState(false);
  const [detailForm, setDetailForm] = useState(emptyDetailFormState());
  const fileInputRef = useRef(null);

  const applyProductList = (list) => {
    const rows = Array.isArray(list) ? list : [];
    const filtered =
      genderFilter === 'all' ? rows : rows.filter((p) => p.gender === genderFilter);
    setProducts(filtered);
    return filtered.length;
  };

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      if (!getAdminToken()) {
        setLoadError('Admin session missing. Please logout and login again.');
        setProducts([]);
        return;
      }

      const params = {};
      if (genderFilter !== 'all') params.gender = genderFilter;

      const data = await fetchAdminProducts(params);
      let count = applyProductList(data?.products);

      if (count === 0) {
        const fallback = await fetchStoreProducts();
        if (fallback?.length) {
          count = applyProductList(fallback);
          if (count > 0) {
            setLoadError('');
            onToast?.(`Showing ${count} products from catalog`, 'success');
          }
        }
      }

      if (count === 0 && genderFilter === 'all') {
        setLoadError(
          'API server may be offline. Stop terminal (Ctrl+C), then run: npm run dev — wait for “trendkaari API running”.'
        );
      } else {
        setLoadError('');
      }
    } catch (err) {
      if (err?.status === 401) {
        setAdminToken(null);
        setLoadError('Session expired. Please login again.');
        setProducts([]);
        return;
      }
      try {
        const fallback = await fetchStoreProducts();
        if (applyProductList(fallback) > 0) {
          setLoadError('');
          onToast?.('Loaded products from storefront API', 'warning');
        } else {
          setProducts([]);
          setLoadError(
            err.message || 'Could not load products. Run: npm run dev (both web + api must start).'
          );
        }
      } catch {
        setProducts([]);
        setLoadError(
          'API not reachable. Press Ctrl+C in terminal, then run: npm run dev'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [genderFilter, onToast]);

  const handleSyncCatalog = async () => {
    setSyncing(true);
    try {
      const data = await syncAdminCatalog();
      onToast?.(data.message || `Synced ${data.count} products`);
      await load();
    } catch (err) {
      onToast?.(err.message || 'Sync failed', 'error');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetchApiHealth().then((health) => {
      setSaveBlocked(Boolean(health.ok && health.persistWrites === false));
    });
  }, []);

  const categories = gender === 'gents' ? GENTS_CATEGORIES : LADIES_CATEGORIES;

  useEffect(() => {
    const urls = imageFiles.map((f) => URL.createObjectURL(f));
    setFilePreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [imageFiles]);

  const addImageFiles = (fileList) => {
    const incoming = Array.from(fileList || []).filter((f) =>
      f.type.startsWith('image/')
    );
    if (!incoming.length) return;
    setImageFiles((prev) => [...prev, ...incoming]);
  };

  const removeNewImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (src) => {
    setExistingImages((prev) => prev.filter((s) => s !== src));
  };

  const totalMediaCount = existingImages.filter(Boolean).length + imageFiles.length;

  const resetForm = () => {
    setStep(0);
    setEditing(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setOriginalPrice('');
    setGender('ladies');
    setSubCategory('kurtas');
    setFabricTags(['Cotton']);
    setVariants([emptyVariant('ladies')]);
    setImageFiles([]);
    setFilePreviews([]);
    setExistingImages([]);
    setMediaDragOver(false);
    setDetailForm(emptyDetailFormState());
  };

  const startEdit = (p) => {
    setEditing(p);
    setTitle(p.title);
    setDescription(p.description || '');
    setPrice(String(p.price));
    setOriginalPrice(String(p.originalPrice));
    setGender(p.gender || (p.category === 'men' ? 'gents' : 'ladies'));
    setSubCategory(p.subCategory || p.category);
    setFabricTags(p.fabricTags || ['Cotton']);
    setVariants(p.variants?.length ? p.variants : [emptyVariant(p.gender || 'ladies')]);
    setExistingImages(getProductGalleryImages(p));
    setDetailForm(productToDetailFormState(p));
    setImageFiles([]);
    setStep(0);
    setShowForm(true);
  };

  const buildPayload = () => {
    const payload = {
      title,
      description,
      price: Number(price),
      originalPrice: Number(originalPrice || price),
      gender,
      subCategory,
      fabricTags,
      variants,
      ...detailFormToPayload(detailForm),
    };

    if (editing || existingImages.length) {
      payload.images = existingImages;
      payload.image = existingImages[0] || '';
    }

    return payload;
  };

  const handlePublish = async () => {
    if (!title || !price) {
      onToast('Fill required basic info fields', 'error');
      return;
    }
    if (!editing && imageFiles.length === 0 && existingImages.length === 0) {
      onToast('Add at least one product photo before publishing.', 'error');
      setStep(STEPS.length - 1);
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('data', JSON.stringify(buildPayload()));
      imageFiles.forEach((f) => fd.append('images', f));

      if (editing) {
        await updateProduct(editing.id, fd);
        onToast('Product updated successfully');
      } else {
        await createProduct(fd);
        onToast('Product Architecture Deployed Successfully.');
      }
      setShowForm(false);
      resetForm();
      resetCatalogCache();
      bumpCatalogVersion();
      load();
    } catch (err) {
      onToast(err?.data?.error || err.message || 'Could not publish product. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product from catalog?')) return;
    await deleteProduct(id);
    onToast('Product removed');
    load();
  };

  const updateVariantSize = (vIdx, size, qty) => {
    setVariants((prev) =>
      prev.map((v, i) =>
        i === vIdx ? { ...v, stockBySize: { ...v.stockBySize, [size]: Number(qty) } } : v
      )
    );
  };

  return (
    <div className="admin-cyber-page">
      <header className="admin-cyber-page__head admin-cyber-page__head--row">
        <div>
          <h1>Inventory & Product Management</h1>
          <p>{products.length} active apparel records — add as many products as you need</p>
        </div>
        {!showForm && (
          <div className="admin-cyber-page__actions">
            <button
              type="button"
              className="admin-cyber-btn admin-cyber-btn--ghost"
              disabled={syncing}
              onClick={handleSyncCatalog}
            >
              {syncing ? <span className="admin-chrome-loader" /> : 'Import catalog SKUs'}
            </button>
            <button
              type="button"
              className="admin-cyber-btn admin-cyber-btn--primary"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              <Plus size={16} /> ADD NEW PRODUCT
            </button>
          </div>
        )}
      </header>

      {saveBlocked && (
        <p className="admin-cyber-error admin-cyber-error--banner" role="alert">
          Product saves are disabled on this server. Add BLOB_READ_WRITE_TOKEN in Vercel environment
          variables, then redeploy. Viewing still works from any PC.
        </p>
      )}

      {loadError && !showForm && (
        <p className="admin-cyber-error admin-cyber-error--banner" role="alert">
          {loadError}
        </p>
      )}

      <div className="admin-cyber-filters glass-panel">
        <label>
          Gender
          <select
            className="admin-cyber-input"
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="ladies">Ladies</option>
            <option value="gents">Gents</option>
          </select>
        </label>
      </div>

      {showForm ? (
        <div className="glass-panel admin-cyber-wizard">
          <div className="admin-cyber-wizard__steps">
            {STEPS.map((label, i) => (
              <button
                key={label}
                type="button"
                className={`admin-cyber-step${step === i ? ' is-active' : ''}${i < step ? ' is-done' : ''}`}
                onClick={() => setStep(i)}
              >
                {i + 1}. {label}
              </button>
            ))}
          </div>

          {step === 0 && (
            <div className="admin-cyber-form-grid">
              <label className="admin-cyber-label">
                Product Title *
                <input className="admin-cyber-input" value={title} onChange={(e) => setTitle(e.target.value)} />
              </label>
              <label className="admin-cyber-label">
                Description
                <textarea
                  className="admin-cyber-input admin-cyber-textarea"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </label>
              <label className="admin-cyber-label">
                Sale Price (₹) *
                <input
                  type="number"
                  className="admin-cyber-input"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </label>
              <label className="admin-cyber-label">
                Original Price (₹)
                <input
                  type="number"
                  className="admin-cyber-input"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                />
              </label>
            </div>
          )}

          {step === 1 && (
            <div className="admin-cyber-form-grid">
              <label className="admin-cyber-label">
                Gender *
                <select
                  className="admin-cyber-input"
                  value={gender}
                  onChange={(e) => {
                    const g = e.target.value;
                    setGender(g);
                    setSubCategory(g === 'gents' ? 'shirts' : 'kurtas');
                    setVariants([emptyVariant(g)]);
                  }}
                >
                  <option value="ladies">Ladies</option>
                  <option value="gents">Gents</option>
                </select>
              </label>
              <label className="admin-cyber-label">
                Category *
                <select
                  className="admin-cyber-input"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="admin-cyber-label">
                Fabric Tags
                <div className="admin-cyber-chips">
                  {FABRIC_TAGS.map((tag) => {
                    const on = fabricTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        className={`admin-cyber-chip${on ? ' is-on' : ''}`}
                        onClick={() =>
                          setFabricTags((prev) =>
                            on ? prev.filter((t) => t !== tag) : [...prev, tag]
                          )
                        }
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <AdminProductDetailsForm
              form={detailForm}
              onChange={setDetailForm}
              title={title}
              description={description}
              gender={gender}
              subCategory={subCategory}
              fabricTags={fabricTags}
              price={price}
              originalPrice={originalPrice}
            />
          )}

          {step === 3 && (
            <div className="admin-cyber-variants">
              {variants.map((v, vIdx) => (
                <div key={v.id} className="glass-panel admin-cyber-variant-card">
                  <div className="admin-cyber-form-grid admin-cyber-form-grid--3">
                    <label className="admin-cyber-label">
                      Color
                      <select
                        className="admin-cyber-input"
                        value={v.color}
                        onChange={(e) => {
                          const color = e.target.value;
                          const hex = hexForProductColor(color);
                          setVariants((prev) =>
                            prev.map((x, i) =>
                              i === vIdx ? { ...x, color, colorHex: hex } : x
                            )
                          );
                        }}
                      >
                        {colorOptionsForVariant(v.color).map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="admin-cyber-label">
                      Color Hex
                      <input
                        type="color"
                        className="admin-cyber-input admin-cyber-color"
                        value={v.colorHex}
                        onChange={(e) =>
                          setVariants((prev) =>
                            prev.map((x, i) => (i === vIdx ? { ...x, colorHex: e.target.value } : x))
                          )
                        }
                      />
                    </label>
                  </div>
                  <div className="admin-cyber-size-grid">
                    {sizesForGender(gender).map((sz) => (
                      <label key={sz} className="admin-cyber-label">
                        {sz} Qty
                        <input
                          type="number"
                          min="0"
                          className="admin-cyber-input"
                          value={v.stockBySize[sz] ?? 0}
                          onChange={(e) => updateVariantSize(vIdx, sz, e.target.value)}
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="admin-cyber-btn"
                onClick={() => setVariants((prev) => [...prev, emptyVariant(gender)])}
              >
                + Add Color Variant
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="admin-cyber-media-step">
              <label
                className={`admin-cyber-dropzone${mediaDragOver ? ' is-dragover' : ''}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setMediaDragOver(true);
                }}
                onDragLeave={() => setMediaDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setMediaDragOver(false);
                  addImageFiles(e.dataTransfer.files);
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => {
                    addImageFiles(e.target.files);
                    e.target.value = '';
                  }}
                />
                <span>Drag & drop product photos or click to upload</span>
                <small className="admin-upload-hint">
                  Auto-resized to 700×933 (3:4) — same as storefront product images
                </small>
              </label>

              {totalMediaCount > 0 ? (
                <>
                  <p className="admin-cyber-media-count">
                    {totalMediaCount} photo{totalMediaCount === 1 ? '' : 's'} added
                    {totalMediaCount > 0 && ' — first image is the main product photo'}
                  </p>
                  <div className="admin-cyber-thumb-row">
                    {existingImages.filter(Boolean).map((src, idx) => (
                      <div key={`existing-${src}`} className="admin-cyber-thumb">
                        {idx === 0 && <span className="admin-cyber-thumb__badge">Main</span>}
                        <img src={src} alt="" />
                        <button
                          type="button"
                          className="admin-cyber-thumb__remove"
                          aria-label="Remove image"
                          onClick={() => removeExistingImage(src)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {filePreviews.map((src, idx) => (
                      <div key={`new-${src}`} className="admin-cyber-thumb">
                        {existingImages.filter(Boolean).length === 0 && idx === 0 && (
                          <span className="admin-cyber-thumb__badge">Main</span>
                        )}
                        <img src={src} alt="" />
                        <button
                          type="button"
                          className="admin-cyber-thumb__remove"
                          aria-label="Remove image"
                          onClick={() => removeNewImage(idx)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="admin-cyber-btn admin-cyber-btn--ghost admin-cyber-media-more"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    + Add more photos
                  </button>
                </>
              ) : (
                <p className="admin-cyber-media-empty">No photos yet — add at least one before publishing.</p>
              )}
            </div>
          )}

          <div className="admin-cyber-wizard__actions">
            <button type="button" className="admin-cyber-btn" onClick={() => { setShowForm(false); resetForm(); }}>
              Cancel
            </button>
            {step > 0 && (
              <button type="button" className="admin-cyber-btn" onClick={() => setStep((s) => s - 1)}>
                Back
              </button>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" className="admin-cyber-btn admin-cyber-btn--primary" onClick={() => setStep((s) => s + 1)}>
                Next
              </button>
            ) : (
              <button
                type="button"
                className="admin-cyber-btn admin-cyber-btn--primary"
                disabled={saving}
                onClick={handlePublish}
              >
                {saving ? <span className="admin-chrome-loader" /> : 'PUBLISH PRODUCT'}
              </button>
            )}
          </div>
        </div>
      ) : loading ? (
        <span className="admin-chrome-loader admin-chrome-loader--lg" />
      ) : (
        <div className="admin-cyber-table-wrap glass-panel">
          <table className="admin-cyber-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Gender</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && (
                <tr>
                  <td colSpan={6} className="admin-cyber-table-empty">
                    No products yet. Click <strong>ADD NEW PRODUCT</strong> — there is no limit on how many you can add.
                  </td>
                </tr>
              )}
              {products.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div className="admin-cyber-table-product">
                      <img src={getProductPrimaryImage(p)} alt="" />
                      <div>
                        <strong>{p.title}</strong>
                        <span>SKU LIB-{p.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="capitalize">{p.gender || '—'}</td>
                  <td className="capitalize">{p.subCategory || p.category}</td>
                  <td>₹{p.price}</td>
                  <td>{p.stock ?? 0}</td>
                  <td className="admin-cyber-table-actions">
                    <button type="button" onClick={() => startEdit(p)} aria-label="Edit">
                      <Edit size={14} />
                    </button>
                    <button type="button" onClick={() => handleDelete(p.id)} aria-label="Delete">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
