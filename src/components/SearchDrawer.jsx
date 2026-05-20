import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, ChevronRight, Eye } from 'lucide-react';
import {
  filterProductsBySearchQuery,
  getSearchSectionSuggestions,
  resolveSearchToCategory,
} from '../utils/searchCategories';
import './SearchDrawer.css';

const popularKeywords = [
  { label: 'Sarees', query: 'sarees' },
  { label: 'Kurtas', query: 'kurtas' },
  { label: 'Suit Sets', query: 'suit sets' },
  { label: 'Lehengas', query: 'lehengas' },
  { label: "Men's Kurtas", query: 'gents kurtas' },
  { label: 'Dresses', query: 'dresses' },
];

export default function SearchDrawer({
  isOpen,
  onClose,
  onOpenQuickView,
  onSelectCategory,
  products = [],
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [sectionHints, setSectionHints] = useState([]);
  const [submitHint, setSubmitHint] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setSectionHints([]);
      setSubmitHint('');
    }
  }, [isOpen]);

  useEffect(() => {
    const q = query.trim();
    if (q === '') {
      setResults([]);
      setSectionHints([]);
      setSubmitHint('');
      return;
    }

    setResults(filterProductsBySearchQuery(q, products));
    setSectionHints(getSearchSectionSuggestions(q, products));
    const resolved = resolveSearchToCategory(q, products);
    setSubmitHint(resolved ? `Press Enter → ${resolved.label}` : '');
  }, [query, products]);

  const navigateToSection = useCallback(
    (slug, closeDrawer = true) => {
      if (!slug || !onSelectCategory) return;
      onSelectCategory(slug);
      if (closeDrawer) onClose();
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 200);
    },
    [onSelectCategory, onClose]
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;

    const resolved = resolveSearchToCategory(q, products);
    if (resolved) {
      navigateToSection(resolved.slug);
      return;
    }

    if (sectionHints.length > 0) {
      navigateToSection(sectionHints[0].slug);
      return;
    }

    if (results.length > 0 && results[0].subCategory) {
      navigateToSection(results[0].subCategory.toLowerCase());
    }
  };

  const handleKeywordClick = (searchQuery) => {
    setQuery(searchQuery);
    const resolved = resolveSearchToCategory(searchQuery, products);
    if (resolved) {
      navigateToSection(resolved.slug);
    }
  };

  const handleProductClick = (product) => {
    onOpenQuickView(product);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="search-drawer-overlay active">
      <div className="search-modal-backdrop" onClick={onClose} />

      <div className="search-modal-container">
        <div className="search-modal-header">
          <form className="search-input-form" onSubmit={handleSubmit}>
            <div className="search-input-wrap">
              <Search size={20} className="search-input-icon" aria-hidden />
              <input
                type="search"
                enterKeyHint="search"
                placeholder="Search for products, brands and more"
                className="search-input-field"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoFocus
                aria-label="Search products and collections"
              />
              {query.trim() !== '' && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onClick={() => setQuery('')}
                  aria-label="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button type="submit" className="search-submit-btn" aria-label="Search">
              <Search size={16} strokeWidth={2.5} aria-hidden />
              <span>Search</span>
            </button>
          </form>

          <button type="button" className="search-close-btn" onClick={onClose} aria-label="Close Search">
            <X size={20} />
          </button>
        </div>

        {submitHint && (
          <p className="search-enter-hint" role="status">
            {submitHint}
          </p>
        )}

        <div className="search-modal-body">
          <div className="search-suggestions-panel">
            <h4 className="search-heading text-uppercase letter-spacing-medium">Popular Searches</h4>
            <div className="keywords-flex-row">
              {popularKeywords.map((kw) => (
                <button
                  key={kw.query}
                  type="button"
                  className={`popular-kw-btn ${query.toLowerCase() === kw.query ? 'active' : ''}`}
                  onClick={() => handleKeywordClick(kw.query)}
                >
                  {kw.label}
                  <ChevronRight size={12} className="kw-chevron" />
                </button>
              ))}
            </div>

            {sectionHints.length > 0 && query.trim() !== '' && (
              <div className="search-section-hints">
                <h4 className="search-heading text-uppercase letter-spacing-medium">Collections</h4>
                <ul className="search-section-hints-list">
                  {sectionHints.map((hint) => (
                    <li key={hint.slug}>
                      <button
                        type="button"
                        className="search-section-hint-btn"
                        onClick={() => navigateToSection(hint.slug)}
                      >
                        <span>{hint.label}</span>
                        <ChevronRight size={14} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="search-results-panel">
            <h4 className="search-heading text-uppercase letter-spacing-medium">
              {query.trim() === '' ? 'Discover Trending' : `Products (${results.length})`}
            </h4>

            <div className="search-results-list">
              {query.trim() === '' ? (
                products.slice(0, 4).map((product) => (
                  <div
                    key={product.id}
                    className="search-result-card"
                    onClick={() => handleProductClick(product)}
                    role="button"
                    tabIndex={0}
                  >
                    <img src={product.image} alt={product.title} className="search-result-img" />
                    <div className="search-result-info">
                      <h5 className="search-result-title">{product.title}</h5>
                      <div className="search-result-prices">
                        <span className="search-price-curr">₹{product.price}</span>
                        <span className="search-price-orig">₹{product.originalPrice}</span>
                      </div>
                    </div>
                    <button type="button" className="search-quick-btn" title="Quick View">
                      <Eye size={16} />
                    </button>
                  </div>
                ))
              ) : results.length > 0 ? (
                results.slice(0, 12).map((product) => (
                  <div
                    key={product.id}
                    className="search-result-card"
                    onClick={() => handleProductClick(product)}
                    role="button"
                    tabIndex={0}
                  >
                    <img src={product.image} alt={product.title} className="search-result-img" />
                    <div className="search-result-info">
                      <h5 className="search-result-title">{product.title}</h5>
                      <div className="search-result-prices">
                        <span className="search-price-curr">₹{product.price}</span>
                        <span className="search-price-orig">₹{product.originalPrice}</span>
                      </div>
                    </div>
                    <button type="button" className="search-quick-btn" title="Quick View">
                      <Eye size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="search-no-results">
                  <p className="no-res-text">No matches for &quot;{query}&quot;.</p>
                  <p className="no-res-sub">Try &quot;saree&quot;, &quot;kurta&quot;, &quot;men shirt&quot;, or &quot;western wear&quot; and press Enter.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
