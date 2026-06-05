import React, { useState, useEffect, useMemo } from 'react';
import { SlidersHorizontal, ArrowUpDown, ChevronDown, Check, Eye, ShoppingCart, Star } from 'lucide-react';
import './CollectionListingPage.css';
import ProductDiscountChip from './ProductDiscountChip';
import { filterProductsByCategory, getCategoryDisplayName } from '../utils/categoryFilter';
import {
  matchesPriceFilter,
  PRICE_FILTER_MAX,
  PRICE_FILTER_MIN,
  PRICE_FILTER_OPTIONS,
} from '../utils/priceFilters';
import { findMenuGroupForTag, MENU_MEN_GROUPS, MENU_WOMEN_GROUPS } from '../data/navCategories';
import PageBackButton from './PageBackButton';
import PlacedAdSlot from './PlacedAdSlot';
import { scrollToPageTop } from '../utils/scrollToTop';
import ProductImage from './ProductImage';
import { getProductHoverImage, getProductPrimaryImage, getProductGalleryImages } from '../utils/productImages';
import { getAdCode } from '../utils/resolveAdCode';

const MOBILE_TABS_MQ = '(max-width: 768px)';

function QuickTabButton({ cat, isActive, onSelect }) {
  return (
    <button
      type="button"
      className={`quick-tab-btn${isActive ? ' active' : ''}`}
      onClick={() => onSelect(cat)}
    >
      {cat.toUpperCase()}
    </button>
  );
}

export default function CollectionListingPage({
  activeCategory,
  onSelectCategory,
  onAddToCart,
  onOpenQuickView,
  onBack,
  products = [],
  adCodes = {},
}) {
  const hasGridAd = Boolean(
    getAdCode(adCodes, 'ads_every_2_products'),
  );
  const [selectedSizes, setSelectedSizes] = useState({});
  const [sortBy, setSortBy] = useState('featured');
  const [filters, setFilters] = useState({
    price: [],
    fabric: [],
    size: [],
    color: []
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [isMobileTabs, setIsMobileTabs] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_TABS_MQ).matches : false,
  );

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_TABS_MQ);
    const onChange = (e) => setIsMobileTabs(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Reset page filters when category changes
  useEffect(() => {
    setFilters({
      price: [],
      fabric: [],
      size: [],
      color: []
    });
    scrollToPageTop();
  }, [activeCategory]);

  const handleSizeSelect = (productId, size) => {
    setSelectedSizes(prev => ({
      ...prev,
      [productId]: size
    }));
  };

  const handleAddClick = (product) => {
    const size = selectedSizes[product.id] || (product.sizes && product.sizes[0]);
    onAddToCart(product, size);
  };

  // Get description for each category matching Libas brand guidelines
  const getCategoryDetails = () => {
    const cat = activeCategory.toLowerCase();
    switch (cat) {
      case 'kurtas':
        return {
          title: "KURTAS FOR WOMEN",
          tagline: "Classy everyday staples and intricate festive straight kurtis",
          description: "Elevate your style with Libas' majestic kurtas for women. Perfect for office wear or high-festive settings, crafted in premium fabrics like silk blend, premium cotton, and linen with gorgeous yoke block prints."
        };
      case 'suit sets':
        return {
          title: "SUIT SETS FOR WOMEN",
          tagline: "Elegant three-piece coordinated ethnic ensembles",
          description: "Discover opulent, high-craft silk and cotton suit sets. Featuring intricate neck yoke embroidery, matching trousers, and beautiful coordinated dupattas to complete your timeless traditional look."
        };
      case 'sarees':
        return {
          title: "DESIGNER SAREES FOR WOMEN",
          tagline: "Exquisite drapes in luxurious silk and cotton blends",
          description: "Drape yourself in absolute ethnic luxury. Our elegant sarees feature rich metallic prints, intricate Zari woven borders, and premium georgette and silk blends that flows elegantly for weddings and festivals."
        };
      case 'lehengas':
        return {
          title: "FESTIVE LEHENGAS FOR WOMEN",
          tagline: "Opulent wedding and ceremonial lehenga choli sets",
          description: "Become the focal point of every celebration with our opulent bridal and festive lehenga sets. Complete with heavily embroidered details, rich block patterns, and lightweight flared skirts."
        };
      case 'dupatta sets':
        return {
          title: "DUPATTA SETS FOR WOMEN",
          tagline: "Majestic coordinates with block printed dupattas",
          description: "Classic meets contemporary. Complete coordinated dupatta ensembles with traditional block-prints, peplum styling, and gorgeous flared skirts designed for special family gatherings."
        };
      case 'tops':
        return {
          title: "TOPS & TUNICS FOR WOMEN",
          tagline: "Modern fusion cuts and lightweight daily wear short kurtis",
          description: "Elegant modern cuts. Lightweight tops, tunics, and daily wear shirts designed in premium cotton and silk blend weaves, blending contemporary western comfort with classic Indian ethnic charm."
        };
      case 'gents kurtas':
        return {
          title: "GENTS' DESIGNER ETHNIC KURTAS",
          tagline: "Timeless handcrafted kurtas for traditional men",
          description: "Discover Libas' majestic range of designer kurtas for gents. Beautifully crafted in rich fabrics like linen, premium cotton, and khadi weaves, ideal for both smart casual wear and wedding celebrations."
        };
      case 'gents kurta sets':
        return {
          title: "MEN'S KURTA PYJAMA SETS",
          tagline: "Perfect coordinated traditional gents outfits",
          description: "Step into effortless traditional poise with our coordinated men's kurta pajama sets. Designed in luxurious silk and breathable cotton styles to keep you looking your ethnic best."
        };
      case 'sherwanis':
        return {
          title: "MEN'S ROYAL SHERWANIS",
          tagline: "Opulent wedding sherwanis and ceremonial suits",
          description: "Embrace absolute wedding grandeur with our premium royal velvet and raw silk Sherwanis. Finished with meticulous hand embroidery and structured fits for ultimate wedding charm."
        };
      case 'dresses':
        return {
          title: "DRESSES FOR WOMEN",
          tagline: "Effortless western dresses and premium designer ensembles",
          description: "Elevate your western wardrobe with Libas' elegant designer dresses. Woven in rich georgettes, cottons, and luxurious crepe silks, featuring modern flared structures and beautiful prints."
        };
      case 'co-ords':
        return {
          title: "CO-ORD SETS FOR WOMEN",
          tagline: "Matching coordinated modern and lounge sets",
          description: "Discover ultimate symmetry with our chic co-ord sets. Presenting matched notch-collar shirts, relaxed tunic tops, trousers, and palazzos tailored in premium organic linens and soft cottons."
        };
      case 't-shirts':
        return {
          title: "CASUAL T-SHIRTS FOR WOMEN",
          tagline: "Super-soft organic cotton and everyday boyfriend tees",
          description: "Drape yourself in relaxed comfort. Our premium women's casual t-shirts present flattering crewnecks, crop styles, ribbed fits, and playful chest embroideries woven in pre-washed long-staple cotton."
        };
      case 'bottoms':
        return {
          title: "STYLISH BOTTOM WEAR FOR WOMEN",
          tagline: "Tailored cigarette pants, palazzo trousers, and culottes",
          description: "Step in absolute comfort. Explore our collection of premium tailored bottom wear, featuring wide-leg linen trousers, elasticated cigarette pants, and pure cotton palazzos for every top or kurta pairing."
        };
      case 'trackpants':
        return {
          title: "MEN'S ATHLETIC TRACKPANTS",
          tagline: "Quick-dry performance joggers and premium sports trackpants",
          description: "Elevate your training and active lounging with Libas' high-performance Men's trackpants. Tailored in breathable, sweat-wicking premium knit fleece and quick-dry textures for optimal movement."
        };
      case 'jackets':
        return {
          title: "MEN'S LUXURY JACKETS",
          tagline: "Premium leather biker jackets, denims, puffer coats, and varsities",
          description: "Unleash bold seasonal outerwear. Our Men's jacket range showcases raw tan leather biker fits, heavy stonewashed denim trucking jackets, and urban varsity bombers crafted in exceptionally rich, durable fabrics."
        };
      case 'hoodies':
        return {
          title: "MEN'S WINTER HOODIES & COZY SWEATERS",
          tagline: "Ultra-plush fleece pullover hoodies and French terry loungewear",
          description: "Brave the chill in ultimate high-fashion style. Woven in 100% genuine French cotton terry and premium insulating fleece, these pullovers feature classic kangaroo pockets and tailored ribbed cuffs."
        };
      case 'blazers':
        return {
          title: "MEN'S ETHNIC & WEDDING BLAZERS",
          tagline: "Bandhgalas, velvet blazers & ceremonial tailoring",
          description: "Elevate wedding and festive looks with structured ethnic blazers, royal velvet Bandhgalas, and ceremony-ready tailoring — designed to pair with kurtas and traditional ensembles."
        };
      case 'gents co-ords':
        return {
          title: "MEN'S ETHNIC CO-ORD SETS",
          tagline: "Matching kurta-style & festive coordinated sets",
          description: "Ready-to-wear ethnic co-ord sets in premium linen and cotton blends — perfect for receptions, Eid, and celebrations when you want a polished match without the styling effort."
        };
      case 'shirts':
        return {
          title: "MEN'S CLASSIC & CASUAL SHIRTS",
          tagline: "Breathable summer linen shirts, tailored Oxfords, and premium satin party shirts",
          description: "A masterclass in tailored menswear. From crisp pure cotton Oxford dress shirts to lightweight garment-washed summer linen shirts, each piece offers breathable luxury and clean modern contours."
        };
      case 'gents t-shirts':
        return {
          title: "MEN'S PREMIUM CASUAL T-SHIRTS",
          tagline: "Luxury Supima crewnecks, classic pique polos, and oversized streetwear tees",
          description: "Redefine daily casual essentials. Woven in ultra-soft organic long-staple cotton and silky Supima blends, our Men's t-shirts offer supreme color retention, anti-pilling, and a gorgeous drape."
        };
      case 'pants':
        return {
          title: "MEN'S TAILORED PANTS & CHINOS",
          tagline: "Structured cigarette chinos, summer linen trousers, and smart cargo joggers",
          description: "Step out with tailored confidence. Featuring double-washed structured chinos, premium wide-leg French linen trousers, and elasticated streetwear jogger pants detailed with premium hardware."
        };
      case 'jeans':
        return {
          title: "MEN'S PREMIUM DENIM JEANS",
          tagline: "Stonewashed baggy denims, classic indigo straight fits, and vintage whiskered jeans",
          description: "Embrace authentic heritage denim craftsmanship. Our Men's jeans present pre-shrunk heavyweight raw cotton, classic vintage fades, loose baggy fits, and subtle distressed details for unmatched premium style."
        };
      case 'women-traditional':
        return {
          title: "WOMEN'S TRADITIONAL WEAR",
          tagline: "Kurtas, sarees, lehengas & festive ethnic ensembles",
          description: "Explore handcrafted Indian ethnic wear for every celebration — dupatta sets, suit sets, sarees, lehengas, and timeless kurtas woven in premium cotton and silk blends."
        };
      case 'women-western':
        return {
          title: "WOMEN'S WESTERN WEAR",
          tagline: "Dresses, co-ords, tops & contemporary everyday style",
          description: "Modern silhouettes for work, brunch, and travel — dresses, co-ord sets, tops, t-shirts, and bottom wear in breathable fabrics with a polished trendkaari finish."
        };
      case 'men-traditional':
        return {
          title: "MEN'S TRADITIONAL WEAR",
          tagline: "Kurtas, ethnic co-ords, jackets & wedding blazers",
          description: "Celebrate in style with handcrafted kurtas, ethnic co-ord sets, statement jackets, plus wedding-ready blazers — curated for festivals, weddings, and ceremonial dressing."
        };
      case 'men-western':
        return {
          title: "MEN'S WESTERN WEAR",
          tagline: "Shirts, tees, pants, denim & athleisure",
          description: "Everyday essentials and smart casuals — shirts, t-shirts, trousers, jeans, hoodies, and track pants designed for comfort, fit, and modern Indian lifestyles."
        };
      default:
        return {
          title: "EXQUISITE INDIAN ETHNIC WEAR",
          tagline: "Discover premium handcrafted traditional collections",
          description: "Explore the complete boutique collection of luxurious, handcrafted women's and men's wear, from matching suit sets and lightweight kurtas to elegant designer sarees and modern tops."
        };
    }
  };

  const info = getCategoryDetails();

  // 1. Initial Filtering by Category tag or wear group (traditional / western)
  let items = filterProductsByCategory(products, activeCategory);

  // 2. Interactive Filtering Logic
  if (filters.price.length > 0) {
    items = items.filter((item) =>
      filters.price.some((range) => matchesPriceFilter(item.price, range))
    );
  }

  if (filters.fabric.length > 0) {
    items = items.filter(item => {
      const title = item.title.toLowerCase();
      return filters.fabric.some(fab => {
        if (fab === 'cotton') return title.includes('cotton') || title.includes('khadi');
        if (fab === 'silk') return title.includes('silk');
        if (fab === 'velvet') return title.includes('velvet');
        if (fab === 'linen') return title.includes('linen');
        return false;
      });
    });
  }

  if (filters.size.length > 0) {
    items = items.filter(item => {
      return filters.size.some(sz => item.sizes && item.sizes.includes(sz));
    });
  }

  if (filters.color.length > 0) {
    items = items.filter(item => {
      const title = item.title.toLowerCase();
      return filters.color.some(col => {
        if (col === 'green') return title.includes('green') || title.includes('olive') || title.includes('emerald');
        if (col === 'blue') return title.includes('blue') || title.includes('navy') || title.includes('indigo');
        if (col === 'wine') return title.includes('wine') || title.includes('magenta') || title.includes('purple');
        if (col === 'yellow') return title.includes('yellow') || title.includes('mustard') || title.includes('saffron');
        if (col === 'pink') return title.includes('pink') || title.includes('peach') || title.includes('rose');
        if (col === 'white') return title.includes('white') || title.includes('ivory') || title.includes('cream');
        return false;
      });
    });
  }

  // 3. Sorting Logic
  const sortedItems = [...items].sort((a, b) => {
    if (sortBy === 'priceLow') return a.price - b.price;
    if (sortBy === 'priceHigh') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return b.id - a.id; // Featured/Default (Recent arrivals)
  });

  const toggleFilter = (type, val) => {
    setFilters(prev => {
      const active = prev[type].includes(val)
        ? prev[type].filter(item => item !== val)
        : [...prev[type], val];
      return { ...prev, [type]: active };
    });
  };

  const clearAllFilters = () => {
    setFilters({
      price: [],
      fabric: [],
      size: [],
      color: []
    });
  };

  const tabList = useMemo(() => {
    const cat = activeCategory.toLowerCase();
    const group = findMenuGroupForTag(cat);
    if (group) return group.categories.map((c) => c.tag);
    const menGroup = MENU_MEN_GROUPS.find((g) => g.categories.some((c) => c.tag === cat));
    if (menGroup) return menGroup.categories.map((c) => c.tag);
    const womenGroup = MENU_WOMEN_GROUPS.find((g) => g.categories.some((c) => c.tag === cat));
    if (womenGroup) return womenGroup.categories.map((c) => c.tag);
    return ['dupatta sets', 'kurtas', 'suit sets', 'sarees', 'lehengas', 'tops'];
  }, [activeCategory]);

  const breadcrumbLabel = getCategoryDisplayName(activeCategory);
  const activeCat = (activeCategory || '').toLowerCase();
  const activeWearGroup = findMenuGroupForTag(activeCat);

  const isWearGroupActive = (groupId) =>
    activeCat === groupId || activeWearGroup?.id === groupId;

  const isSubCategoryActive = (tag) => activeCat === tag.toLowerCase();

  const handleSidebarCategory = (slug) => {
    onSelectCategory(slug);
    setFiltersOpen(false);
    scrollToPageTop();
  };

  const handleQuickTabSelect = (cat) => {
    onSelectCategory(cat);
    scrollToPageTop();
  };

  const quickTabsTrack = isMobileTabs ? [...tabList, ...tabList] : tabList;

  return (
    <div className="collection-listing-page-wrapper">
      <PlacedAdSlot adCodes={adCodes} placement="category_top" variant="section" />

      {/* 1. Header Banner & Editorial Section */}
      <div className="collection-banner-header">
        {/* Subtle floral star patterns in corners */}
        <svg className="banner-star banner-star-1" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
        </svg>
        <svg className="banner-star banner-star-2" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" />
        </svg>

        <div className="container">
          {/* Breadcrumbs Row with Back Button on the Left */}
          <div className="collection-breadcrumbs-row">
            <PageBackButton onClick={onBack || (() => onSelectCategory('all'))} />

            <div className="collection-breadcrumbs">
              <span className="bread-crumb-link" onClick={() => onSelectCategory('all')}>Home</span>
              <span className="bread-crumb-sep">/</span>
              <span className="bread-crumb-link" onClick={() => onSelectCategory('all')}>Collections</span>
              <span className="bread-crumb-sep">/</span>
              <span className="bread-crumb-current">{breadcrumbLabel}</span>
            </div>
          </div>

          {/* Editorial Texts */}
          <h1 className="collection-main-title">{info.title}</h1>
          <p className="collection-tagline">{info.tagline}</p>
          <p className="collection-editorial-desc">{info.description}</p>
          <span className="collection-total-count">{items.length} exquisite items found</span>
        </div>
      </div>

      <PlacedAdSlot adCodes={adCodes} placement="category_after_banner" variant="section" />

      <PlacedAdSlot adCodes={adCodes} placement="category_before_quick_tabs" variant="section" />

      {/* 2. Quick Navigation Tabs — mobile: auto-scroll; desktop: manual scroll */}
      <div className={`collection-quick-tabs-bar${isMobileTabs ? ' collection-quick-tabs-bar--auto' : ''}`}>
        <div className="container collection-quick-tabs-layout">
          <span className="quick-tab-title">Jump to Collection:</span>
          <div className="collection-tabs-scroll-wrap">
            <div
              className={`collection-tabs-track${isMobileTabs ? ' collection-tabs-track--auto' : ''}`}
              role="list"
            >
              {quickTabsTrack.map((cat, index) => (
                <QuickTabButton
                  key={`${cat}-${index}`}
                  cat={cat}
                  isActive={activeCategory.toLowerCase() === cat}
                  onSelect={handleQuickTabSelect}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <PlacedAdSlot adCodes={adCodes} placement="category_after_quick_tabs" variant="section" />

      {/* 3. Main Workspace: left sidebar filters & right product listing */}
      <div className="container collection-main-workspace-grid">

        <button
          type="button"
          className="collection-mobile-filter-toggle"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
        >
          <SlidersHorizontal size={16} />
          {filtersOpen ? 'Hide filters' : 'Show filters'}
          {(filters.price.length + filters.fabric.length + filters.size.length + filters.color.length) > 0 && (
            <span className="collection-filter-count">
              {filters.price.length + filters.fabric.length + filters.size.length + filters.color.length}
            </span>
          )}
        </button>
        
        {/* ==================== LEFT FILTER SIDEBAR ==================== */}
        <aside className={`collection-filters-sidebar ${filtersOpen ? 'is-open' : ''}`}>
          
          <div className="sidebar-filter-header">
            <div className="header-label-group">
              <SlidersHorizontal size={16} />
              <span className="filter-title-bold">REFINE PRODUCTS</span>
            </div>
            <button className="clear-all-filter-btn" onClick={clearAllFilters}>
              CLEAR ALL
            </button>
          </div>

          <PlacedAdSlot
            adCodes={adCodes}
            placement="category_sidebar_top"
            variant="sidebar"
          />

          {/* CATEGORY — Women / Men → Traditional & Western */}
          <div className="filter-group-block filter-group-block--category">
            <h4 className="filter-group-title">CATEGORY</h4>

            <p className="filter-gender-label">Women</p>
            {MENU_WOMEN_GROUPS.map((group) => (
              <div key={group.id} className="filter-cat-wear-block">
                <button
                  type="button"
                  className={`filter-cat-wear-btn ${isWearGroupActive(group.id) ? 'active' : ''}`}
                  onClick={() => handleSidebarCategory(group.id)}
                >
                  {group.label}
                </button>
                <ul className="filter-cat-sublist">
                  {group.categories.map((cat) => (
                    <li key={cat.tag}>
                      <button
                        type="button"
                        className={`filter-cat-link ${isSubCategoryActive(cat.tag) ? 'active' : ''}`}
                        onClick={() => handleSidebarCategory(cat.tag)}
                      >
                        {cat.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <p className="filter-gender-label filter-gender-label--men">Men</p>
            {MENU_MEN_GROUPS.map((group) => (
              <div key={group.id} className="filter-cat-wear-block">
                <button
                  type="button"
                  className={`filter-cat-wear-btn ${isWearGroupActive(group.id) ? 'active' : ''}`}
                  onClick={() => handleSidebarCategory(group.id)}
                >
                  {group.label}
                </button>
                <ul className="filter-cat-sublist">
                  {group.categories.map((cat) => (
                    <li key={cat.tag}>
                      <button
                        type="button"
                        className={`filter-cat-link ${isSubCategoryActive(cat.tag) ? 'active' : ''}`}
                        onClick={() => handleSidebarCategory(cat.tag)}
                      >
                        {cat.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* FILTER: PRICE */}
          <div className="filter-group-block">
            <h4 className="filter-group-title">PRICE RANGE</h4>
            <p className="filter-price-hint">
              All styles ₹{PRICE_FILTER_MIN} – ₹{PRICE_FILTER_MAX}
            </p>
            <div className="filter-options-stack">
              {PRICE_FILTER_OPTIONS.map((opt) => (
                <label key={opt.val} className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.price.includes(opt.val)}
                    onChange={() => toggleFilter('price', opt.val)}
                    className="custom-checkbox-input"
                  />
                  <span className="checkbox-dummy"></span>
                  <span className="option-label-text">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* FILTER: FABRICS */}
          <div className="filter-group-block">
            <h4 className="filter-group-title">FABRIC SPECIALTY</h4>
            <div className="filter-options-stack">
              {[
                { val: 'cotton', label: '100% Pure Cotton' },
                { val: 'silk', label: 'Silk Blend Accent' },
                { val: 'velvet', label: 'Opulent Velvet' },
                { val: 'linen', label: 'Linen Comfort' }
              ].map(opt => (
                <label key={opt.val} className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.fabric.includes(opt.val)}
                    onChange={() => toggleFilter('fabric', opt.val)}
                    className="custom-checkbox-input"
                  />
                  <span className="checkbox-dummy"></span>
                  <span className="option-label-text">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* FILTER: SIZES */}
          <div className="filter-group-block">
            <h4 className="filter-group-title">FILTER BY SIZE</h4>
            <div className="size-buttons-inline-grid">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(sz => {
                const isActive = filters.size.includes(sz);
                return (
                  <button
                    key={sz}
                    className={`sidebar-size-pill ${isActive ? 'active' : ''}`}
                    onClick={() => toggleFilter('size', sz)}
                  >
                    {sz}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FILTER: COLORS */}
          <div className="filter-group-block">
            <h4 className="filter-group-title">COLOR PALETTE</h4>
            <div className="filter-options-stack">
              {[
                { val: 'green', label: 'Green / Olive' },
                { val: 'blue', label: 'Indigo / Midnight Blue' },
                { val: 'wine', label: 'Wine / Purple / Magenta' },
                { val: 'yellow', label: 'Yellow / Saffron' },
                { val: 'pink', label: 'Pink / Peach / Coral' },
                { val: 'white', label: 'Ivory White / Cream' }
              ].map(opt => (
                <label key={opt.val} className="filter-checkbox-label">
                  <input
                    type="checkbox"
                    checked={filters.color.includes(opt.val)}
                    onChange={() => toggleFilter('color', opt.val)}
                    className="custom-checkbox-input"
                  />
                  <span className="checkbox-dummy"></span>
                  <span className="option-label-text">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <PlacedAdSlot
            adCodes={adCodes}
            placement="category_sidebar_middle"
            variant="sidebar"
          />

          <PlacedAdSlot
            adCodes={adCodes}
            placement="category_sidebar_bottom"
            variant="sidebar"
          />

          {/* Trust Banner Inside Sidebar */}
          <div className="sidebar-trust-ad">
            <span className="ad-bold">100% ORIGINAL PRODUCTS</span>
            <span className="ad-small">Easy 7 Days Return Policy</span>
          </div>

        </aside>

        {/* ==================== RIGHT PRODUCT LISTING SECTION ==================== */}
        <main className="collection-listing-main-content">
          <PlacedAdSlot
            adCodes={adCodes}
            placement="category_above_sort"
            variant="container"
          />

          {/* Top Bar: Items count and Sorting dropdown */}
          <div className="collection-sorting-topbar">
            <span className="listing-count-label">
              Showing <strong>{sortedItems.length}</strong> of <strong>{items.length}</strong> styles
            </span>
            
            <div className="sorting-selector-group">
              <span className="sort-by-text-label">SORT BY:</span>
              <div className="custom-select-wrapper">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="sorting-dropdown-element"
                >
                  <option value="featured">New & Featured</option>
                  <option value="priceLow">Price: Low to High</option>
                  <option value="priceHigh">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
                <ChevronDown size={14} className="dropdown-caret-arrow" />
              </div>
            </div>
          </div>

          <PlacedAdSlot
            adCodes={adCodes}
            placement="category_below_sort"
            variant="container"
          />

          <div className="category-mobile-sidebar-ads" aria-label="Promotions">
            <PlacedAdSlot
              adCodes={adCodes}
              placement="category_sidebar_top"
              ownerKey="category_sidebar_top_mobile"
              variant="container"
            />
            <PlacedAdSlot
              adCodes={adCodes}
              placement="category_sidebar_middle"
              ownerKey="category_sidebar_middle_mobile"
              variant="container"
            />
            <PlacedAdSlot
              adCodes={adCodes}
              placement="category_sidebar_bottom"
              ownerKey="category_sidebar_bottom_mobile"
              variant="container"
            />
          </div>

          {/* Listing Grid */}
          {sortedItems.length > 0 ? (
            <div className="collection-products-grid" id="catalog-products-list">
              {sortedItems.map((product, index) => {
                const currentSelectedSize = selectedSizes[product.id] || "";
                
                // Secondary image for hover swap effect
                const gallery = getProductGalleryImages(product);
                const primaryImage = getProductPrimaryImage(product);
                const hasSecondaryImage = gallery.length > 1;
                const hoverImage = getProductHoverImage(product);
                const showMidGridAd =
                  hasGridAd &&
                  (index + 1) % 2 === 0 &&
                  index < sortedItems.length - 1;

                return (
                  <React.Fragment key={product.id}>
                  <div className="collection-item-card hover-zoom-container">
                    
                    {/* Image Area with Premium Hover Image Swap */}
                    <div 
                      className="card-media-viewport"
                      onClick={() => onOpenQuickView(product)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Primary Image */}
                      <ProductImage
                        product={product}
                        src={primaryImage}
                        images={gallery}
                        alt={product.title}
                        className="card-img-element main-photo"
                      />
                      
                      {/* Secondary Hover Image (swaps smoothly on hover) */}
                      {hasSecondaryImage && (
                        <ProductImage
                          product={product}
                          src={hoverImage}
                          images={gallery}
                          alt={`${product.title} Alternate View`}
                          className="card-img-element hover-swap-photo"
                        />
                      )}

                      {/* Quick View Button overlay */}
                      <button 
                        className="card-quickview-overlay-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenQuickView(product);
                        }}
                      >
                        <Eye size={14} />
                        <span>QUICK VIEW</span>
                      </button>
                    </div>

                    {/* Info Area */}
                    <div className="card-details-info">
                      
                      {/* Rating pill */}
                      <div className="card-ratings-indicator">
                        <span className="rating-val">{product.rating}</span>
                        <Star size={10} fill="#600b45" stroke="#600b45" />
                        <span className="reviews-num">({product.reviewsCount})</span>
                      </div>

                      {/* Title */}
                      <h3 
                        className="card-product-title"
                        onClick={() => onOpenQuickView(product)}
                      >
                        {product.title}
                      </h3>

                      {/* Price Section */}
                      <div className="card-pricing-row">
                        <span className="price-curr">₹{product.price}</span>
                        <ProductDiscountChip product={product} />
                        <span className="price-orig">₹{product.originalPrice}</span>
                      </div>

                      {/* Sizing list inside card */}
                      <div className="card-sizes-block">
                        <span className="sizes-title-lbl">SIZES:</span>
                        <div className="sizes-scrollable-row">
                          {product.sizes.map(sz => (
                            <button
                              key={sz}
                              className={`card-size-pill ${currentSelectedSize === sz ? 'selected' : ''}`}
                              onClick={() => handleSizeSelect(product.id, sz)}
                            >
                              {sz}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Add To Bag Primary Button */}
                      <button 
                        className="btn btn-primary card-add-to-bag-btn"
                        onClick={() => handleAddClick(product)}
                      >
                        <ShoppingCart size={13} className="bag-icon" />
                        <span>ADD TO BAG</span>
                      </button>

                    </div>

                  </div>
                  {showMidGridAd && (
                    <PlacedAdSlot
                      adCodes={adCodes}
                      placement="ads_every_2_products"
                      ownerKey={`ads_every_2_products_${index}`}
                      allowDuplicateSource
                      variant="grid-full"
                    />
                  )}
                  </React.Fragment>
                );
              })}
            </div>
          ) : null}

          {sortedItems.length > 0 && (
            <PlacedAdSlot
              adCodes={adCodes}
              placement="category_after_grid"
              variant="container"
            />
          )}

          {sortedItems.length === 0 ? (
            <div className="collection-empty-catalog-fallback">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1" className="empty-box-icon">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              <h3>No styles match your selected filters</h3>
              <p>Try clearing some filters or exploring a different category range!</p>
              <button className="btn btn-primary clear-filters-fallback-btn" onClick={clearAllFilters}>
                CLEAR ALL FILTERS
              </button>
            </div>
          ) : null}

        </main>

      </div>

      <PlacedAdSlot adCodes={adCodes} placement="category_page_bottom" variant="section" />
    </div>
  );
}
