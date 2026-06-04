import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSlider from './components/HeroSlider';
import TrendsSection from './components/TrendsSection';
import OfferSection from './components/OfferSection';
import SiteTopAdStrip from './components/SiteTopAdStrip';
import HomeAdSlot from './components/HomeAdSlot';
import GiftCollectionSection from './components/GiftCollectionSection';
import CategoriesSection from './components/CategoriesSection';
import ReviewsSection from './components/ReviewsSection';
import Footer from './components/Footer';
import InfoPage from './components/InfoPage';
import { getInfoPage } from './data/footerInfoPages';
import MenuDrawer from './components/MenuDrawer';
import SearchDrawer from './components/SearchDrawer';
import CartDrawer from './components/CartDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import { loadWishlist, saveWishlist, isInWishlist } from './utils/wishlistStorage';
import UserAuthModal from './components/UserAuthModal';
import AccountDrawer from './components/AccountDrawer';
import QuickViewModal from './components/QuickViewModal';
import MobileNavbar from './components/MobileNavbar';
import ProductDetailPage from './components/ProductDetailPage';
import CollectionListingPage from './components/CollectionListingPage';
import { products as initialProducts } from './data/products';
import {
  fetchStoreAdSlots,
  fetchStoreCoupons,
  fetchStoreProducts,
  fetchStoreSettings,
  fetchStoreGiftCombos,
  submitStoreOrder,
} from './api/storeApi';
import { applySiteSettingsToDocument } from './utils/siteSettings';
import { adSlotsToCodeMap } from './utils/adSlots';
import { resetAdDedupe } from './utils/adDedupe';
import { userMe } from './api/userApi';
import { getUserToken, setUserToken } from './api/client';
import CheckoutFlow from './checkout/CheckoutFlow';
import { saveCheckoutState } from './checkout/checkoutStorage';
import { normalizeCheckoutSlug } from './checkout/checkoutRoutes';
import './App.css';

export default function App() {
  // Global synchronized states
  const [productsList, setProductsList] = useState(initialProducts);

  // Helper to parse URL route
  const getRouteInfo = () => {
    if (typeof window !== 'undefined') {
      const segments = window.location.pathname.split('/').filter(Boolean);
      if (segments[0] === 'category') {
        return {
          viewMode: 'home',
          activeCategory: decodeURIComponent(segments[1] || 'all'),
          selectedProduct: null,
          isCategoryPage: true,
          infoSlug: null,
        };
      } else if (segments[0] === 'product') {
        const prodId = parseInt(segments[1]);
        const found = initialProducts.find(p => p.id === prodId);
        return {
          viewMode: 'product-detail',
          activeCategory: 'all',
          selectedProduct: found || null,
          isCategoryPage: false,
          infoSlug: null,
        };
      } else if (segments[0] === 'checkout') {
        const slug = normalizeCheckoutSlug(segments[1] || 'bag');
        return {
          viewMode: 'checkout',
          checkoutSlug: slug,
          activeCategory: 'all',
          selectedProduct: null,
          isCategoryPage: false,
          infoSlug: null,
        };
      } else if (segments[0] === 'info' && segments[1]) {
        const slug = decodeURIComponent(segments[1]);
        return {
          viewMode: getInfoPage(slug) ? 'info' : 'home',
          activeCategory: 'all',
          selectedProduct: null,
          isCategoryPage: false,
          infoSlug: getInfoPage(slug) ? slug : null,
          checkoutSlug: null,
        };
      }
    }
    return {
      viewMode: 'home',
      activeCategory: 'all',
      selectedProduct: null,
      isCategoryPage: false,
      infoSlug: null,
      checkoutSlug: null,
    };
  };

  const initialRoute = getRouteInfo();

  const [activeCategory, setActiveCategory] = useState(initialRoute.activeCategory);
  const [selectedProduct, setSelectedProduct] = useState(initialRoute.selectedProduct);
  const [viewMode, setViewMode] = useState(initialRoute.viewMode);
  const [isCategoryPage, setIsCategoryPage] = useState(initialRoute.isCategoryPage);
  const [infoSlug, setInfoSlug] = useState(initialRoute.infoSlug ?? null);
  const [checkoutSlug, setCheckoutSlug] = useState(initialRoute.checkoutSlug ?? 'bag');

  const [cartItems, setCartItems] = useState([]);
  const [wishlistItems, setWishlistItems] = useState(() => loadWishlist());
  
  // Drawer visibility states
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [pendingCheckout, setPendingCheckout] = useState(false);

  // Simulated Orders database (synced with API when server running)
  const [orders, setOrders] = useState([
    {
      id: 'ORD-894103',
      customerName: 'Aishwarya Sen',
      email: 'aishwarya@yahoo.com',
      phone: '+91 98845 22912',
      address: 'Apt 2B, Gulmohar Court, Sector 15, Vashi, Navi Mumbai, 400703',
      items: [
        {
          id: 1001,
          title: 'Sage Green Cotton Straight Kurta',
          price: 1499,
          selectedSize: 'M',
          quantity: 1,
          image: '/kurtas/Kurtas/1/040A2925_700x.webp'
        }
      ],
      subtotal: 1499,
      discount: 100,
      grandTotal: 1399,
      status: 'Delivered',
      date: '17/05/2026, 04:32 PM'
    },
    {
      id: 'ORD-304212',
      customerName: 'Priya Mukherjee',
      email: 'priya.m@gmail.com',
      phone: '+91 98302 11985',
      address: 'Flat 502, Prestige Tower, Salt Lake, Kolkata, 700091',
      items: [
        {
          id: 1011,
          title: 'Exquisite Emerald Green Silk Lehenga Set',
          price: 2499,
          selectedSize: 'XL',
          quantity: 1,
          image: '/lehengas/Lehengas/1/040A3523_700x.webp'
        }
      ],
      subtotal: 2499,
      discount: 0,
      grandTotal: 2499,
      status: 'Shipped',
      date: '18/05/2026, 11:15 AM'
    }
  ]);

  // Active Dynamic Coupons database
  const [coupons, setCoupons] = useState([
    { code: 'SALE100', discount: 20, discountType: 'flat', minPurchase: 199 },
    { code: 'FESTIVE50', discount: 50, discountType: 'flat', minPurchase: 499 },
  ]);
  const [siteSettings, setSiteSettings] = useState(null);
  const [adCodes, setAdCodes] = useState({});
  const [giftCombos, setGiftCombos] = useState([]);

  // Router Nav Handlers
  const navigateToRoute = (routePath, isNewTab = false) => {
    if (isNewTab) {
      window.open(routePath, '_blank');
      return;
    }

    window.history.pushState({}, '', routePath);
    
    // Parse new route
    const segments = routePath.split('/').filter(Boolean);
    if (segments[0] === 'category') {
      const cat = decodeURIComponent(segments[1] || 'all');
      setActiveCategory(cat);
      setViewMode('home');
      setSelectedProduct(null);
      setIsCategoryPage(true);
      setInfoSlug(null);
      window.scrollTo(0, 0);
    } else if (segments[0] === 'product') {
      const prodId = parseInt(segments[1]);
      const found = productsList.find(p => p.id === prodId);
      setSelectedProduct(found || null);
      setViewMode('product-detail');
      setIsCategoryPage(false);
      setInfoSlug(null);
      window.scrollTo(0, 0);
    } else if (segments[0] === 'checkout') {
      const slug = normalizeCheckoutSlug(segments[1] || 'bag');
      if (!segments[1]) {
        window.history.replaceState({}, '', `/checkout/${slug}`);
      }
      setCheckoutSlug(slug);
      setViewMode('checkout');
      setActiveCategory('all');
      setSelectedProduct(null);
      setIsCategoryPage(false);
      setInfoSlug(null);
      setIsCartOpen(false);
      window.scrollTo(0, 0);
    } else if (segments[0] === 'info' && segments[1]) {
      const slug = decodeURIComponent(segments[1]);
      if (getInfoPage(slug)) {
        setInfoSlug(slug);
        setViewMode('info');
        setActiveCategory('all');
        setSelectedProduct(null);
        setIsCategoryPage(false);
        window.scrollTo(0, 0);
      } else {
        navigateToRoute('/');
      }
    } else {
      setActiveCategory('all');
      setViewMode('home');
      setSelectedProduct(null);
      setIsCategoryPage(false);
      setInfoSlug(null);
      setCheckoutSlug('bag');
      window.scrollTo(0, 0);
    }
  };

  // Load catalog + ad slots from API
  useEffect(() => {
    fetchStoreProducts().then((list) => {
      if (list?.length) setProductsList(list);
    });
    fetchStoreCoupons().then((list) => {
      if (list?.length) setCoupons(list);
    });
    fetchStoreSettings().then((s) => {
      if (s) setSiteSettings(applySiteSettingsToDocument(s));
    });
    fetchStoreGiftCombos().then((list) => {
      if (list?.length) setGiftCombos(list);
    });
  }, []);

  const reloadAdCodes = () =>
    fetchStoreAdSlots().then((list) => {
      if (list?.length) setAdCodes(adSlotsToCodeMap(list));
    });

  useEffect(() => {
    reloadAdCodes();
    const retry1 = window.setTimeout(reloadAdCodes, 2500);
    const retry2 = window.setTimeout(reloadAdCodes, 8000);
    return () => {
      window.clearTimeout(retry1);
      window.clearTimeout(retry2);
    };
  }, []);

  // Refresh ads when navigating (checkout, category, product) so slots mount with codes ready
  useEffect(() => {
    reloadAdCodes();
  }, [viewMode, isCategoryPage, checkoutSlug, selectedProduct?.id]);

  // Restore user session from token
  useEffect(() => {
    if (!getUserToken()) return;
    userMe()
      .then((data) => setUser(data.user))
      .catch(() => setUserToken(null));
  }, []);

  // Listen to popstate event (browser back/forward button clicks)
  useEffect(() => {
    const handlePopState = () => {
      const route = getRouteInfo();
      setActiveCategory(route.activeCategory);
      setViewMode(route.viewMode);
      setSelectedProduct(route.selectedProduct);
      setIsCategoryPage(route.isCategoryPage);
      setInfoSlug(route.infoSlug ?? null);
      setCheckoutSlug(route.checkoutSlug ?? 'bag');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [productsList]);

  useEffect(() => {
    document.body.classList.toggle('category-page', isCategoryPage);
    document.body.classList.toggle('info-page', viewMode === 'info');
    document.body.classList.toggle('checkout-page', viewMode === 'checkout');
    return () => {
      document.body.classList.remove('category-page');
      document.body.classList.remove('info-page');
      document.body.classList.remove('checkout-page');
    };
  }, [isCategoryPage, viewMode]);

  /* Pause top-bar animation while scrolling (reduces visible “shake”) */
  useEffect(() => {
    let scrollEndTimer;
    const onScroll = () => {
      document.body.classList.add('is-scrolling');
      clearTimeout(scrollEndTimer);
      scrollEndTimer = setTimeout(() => {
        document.body.classList.remove('is-scrolling');
      }, 180);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(scrollEndTimer);
      document.body.classList.remove('is-scrolling');
    };
  }, []);

  const buildLocalOrder = (orderDetails) => ({
    id: 'ORD-' + Math.floor(100000 + Math.random() * 900000),
    customerName: orderDetails.name,
    email: orderDetails.email,
    phone: orderDetails.phone,
    address: orderDetails.address,
    items: orderDetails.items,
    subtotal: orderDetails.subtotal,
    discount: orderDetails.discount ?? 0,
    grandTotal: orderDetails.grandTotal,
    status: 'Pending',
    paymentStatus: orderDetails.paymentMethod === 'cod' ? 'COD' : 'Paid',
    paymentMethod: orderDetails.paymentMethod,
    date: new Date().toLocaleString('en-IN', { hour12: true }),
    createdAt: new Date().toISOString(),
    trackingId: 'TRK' + Math.floor(100000000 + Math.random() * 900000000),
    eta: '3–5 days',
  });

  const handleOpenCheckout = (seed) => {
    if (cartItems.length === 0) return;
    const partial = { step: 0 };
    if (seed?.appliedCoupon) {
      partial.coupon = { code: seed.appliedCoupon.code, applied: seed.appliedCoupon };
    }
    saveCheckoutState(partial);
    setIsCartOpen(false);
    navigateToRoute('/checkout/bag');
  };

  const handleExitCheckout = () => {
    navigateToRoute('/');
  };

  const handleNavigateCheckout = (path) => {
    if (typeof path === 'string' && path.startsWith('/')) {
      navigateToRoute(path);
    }
  };

  const handleCheckoutPlaceOrder = async (orderDetails) => {
    try {
      const result = await submitStoreOrder(orderDetails);
      const newOrder = result?.order;
      if (!newOrder) {
        throw new Error('We could not complete your order due to a technical issue.');
      }

      if (result.emailSent !== true) {
        setOrders((prev) => [newOrder, ...prev]);
        throw new Error(
          'Confirmation email could not be sent. Please try checkout again in a few minutes.'
        );
      }

      setOrders((prev) => [newOrder, ...prev]);
      const refreshed = await fetchStoreProducts();
      if (refreshed?.length) setProductsList(refreshed);
      setCartItems([]);
      return {
        order: {
          ...newOrder,
          trackingId: newOrder.trackingId || 'TRK' + Math.floor(100000000 + Math.random() * 900000000),
          eta: newOrder.eta || '3–5 days',
        },
        emailSent: true,
      };
    } catch (err) {
      if (err?.status === 401) {
        setPendingCheckout(true);
        setAuthModalMode('login');
        setIsAuthModalOpen(true);
        throw new Error(err?.message || 'Please sign in to place your order.');
      }
      throw new Error(
        err?.message || 'We could not complete your order due to a technical issue. Please try again.'
      );
    }
  };

  // Shopper Shopping Bag Actions
  const handleAddToCart = (product, size, qty = 1) => {
    if (!size) {
      alert("Please select a size first!");
      return;
    }

    setCartItems((prevItems) => {
      const existingIdx = prevItems.findIndex(
        (item) => item.id === product.id && item.selectedSize === size
      );

      if (existingIdx > -1) {
        const updated = [...prevItems];
        updated[existingIdx].quantity += qty;
        return updated;
      } else {
        return [...prevItems, { ...product, selectedSize: size, quantity: qty }];
      }
    });

    setIsCartOpen(true);
  };

  const handleUpdateQty = (productId, size, newQty) => {
    if (newQty < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId && item.selectedSize === size
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const handleRemoveItem = (productId, size) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.id === productId && item.selectedSize === size))
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleSelectCategory = (category) => {
    if (category === 'all') {
      navigateToRoute('/');
    } else {
      navigateToRoute(`/category/${encodeURIComponent(category)}`);
    }
  };

  const findCatalogProduct = (id) => {
    if (id == null || id === '') return null;
    const num = Number(id);
    return productsList.find(
      (p) => p.id === id || p.id === num || String(p.id) === String(id),
    );
  };

  const mergeProductForDetail = (payload) => {
    const id = payload?.id ?? payload?.productId;
    if (!id && !payload?.isGiftCombo) return null;

    const base = findCatalogProduct(id);
    const hero = payload.heroImage || payload.image;
    const fromPayload = payload.images?.length ? [...payload.images] : null;

    if (!base) {
      if (!payload?.isGiftCombo) return null;
      const images = fromPayload?.length
        ? fromPayload
        : hero
          ? [hero]
          : [];
      return {
        ...payload,
        id: payload.id ?? payload.productId,
        title: payload.title || payload.name,
        image: images[0] || hero || '',
        images: images.length ? images : hero ? [hero] : [],
        sizes: payload.sizes?.length ? payload.sizes : ['S', 'M', 'L', 'XL'],
      };
    }

    const catalog = base.images?.length ? [...base.images] : [base.image];
    const mergedList = fromPayload?.length
      ? fromPayload
      : hero
        ? [hero, ...catalog.filter((url) => url && url !== hero)]
        : catalog;
    const uniqueImages = [...new Set(mergedList.filter(Boolean))];

    return {
      ...base,
      title: payload.name || payload.title || base.title,
      description: payload.description || base.description,
      descriptionLong: payload.descriptionLong || payload.description || base.descriptionLong,
      price: payload.price ?? base.price,
      originalPrice: payload.originalPrice ?? base.originalPrice,
      discount: payload.discount ?? base.discount,
      image: uniqueImages[0] || base.image,
      images: uniqueImages.length ? uniqueImages : [base.image],
      aboutItems: payload.aboutItems?.length ? payload.aboutItems : base.aboutItems,
      highlights:
        payload.highlights && Object.keys(payload.highlights).length
          ? payload.highlights
          : base.highlights,
      isGiftCombo: payload.isGiftCombo ?? false,
      comboBadge: payload.comboBadge,
      comboIncludes: payload.comboIncludes,
      partnerProduct: payload.partnerProduct ?? null,
      comboGiftId: payload.comboGiftId,
    };
  };

  const handleOpenQuickView = (payload) => {
    const id = payload?.id ?? payload?.productId;
    if (!id) return;

    const merged = mergeProductForDetail(payload);
    if (merged) {
      setSelectedProduct(merged);
      setViewMode('product-detail');
      setIsCategoryPage(false);
      setInfoSlug(null);
      setActiveCategory('all');
      window.history.pushState({}, '', `/product/${id}`);
      window.scrollTo(0, 0);
      return;
    }

    navigateToRoute(`/product/${id}`);
  };

  const handleCloseQuickView = () => {
    setSelectedProduct(null);
    setIsQuickViewOpen(false);
  };

  const handleUserLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
    if (pendingCheckout) {
      setPendingCheckout(false);
      navigateToRoute('/checkout/bag');
    }
  };

  const handleOpenProfile = () => {
    if (user) {
      setIsAccountOpen(true);
    } else {
      setAuthModalMode('login');
      setIsAuthModalOpen(true);
    }
  };

  const handleRequireLogin = () => {
    setPendingCheckout(true);
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const handleUserLogout = () => {
    setUser(null);
  };

  const handleAddToWishlist = (product, selectedSize) => {
    if (!product?.id) return;
    setWishlistItems((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        setIsWishlistOpen(true);
        return prev;
      }
      const next = [
        ...prev,
        {
          ...product,
          selectedSize: selectedSize || product.sizes?.[0] || null,
          savedAt: Date.now(),
        },
      ];
      saveWishlist(next);
      return next;
    });
    setIsWishlistOpen(true);
  };

  const handleRemoveFromWishlist = (productId) => {
    setWishlistItems((prev) => {
      const next = prev.filter((item) => item.id !== productId);
      saveWishlist(next);
      return next;
    });
  };

  const handleOpenWishlist = () => {
    setIsWishlistOpen(true);
  };

  const handleNavigateInfoPage = (slug) => {
    navigateToRoute(`/info/${encodeURIComponent(slug)}`);
  };

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
      return;
    }
    navigateToRoute('/');
  };

  const handleScrollToSection = (sectionId) => {
    const scroll = () =>
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    if (viewMode === 'home' && !isCategoryPage) {
      scroll();
      return;
    }

    navigateToRoute('/');
    setTimeout(scroll, 350);
  };

  const adPageKey =
    viewMode === 'checkout'
      ? `checkout-${checkoutSlug}`
      : viewMode === 'product-detail'
        ? `product-${selectedProduct?.id || 'none'}`
        : isCategoryPage
          ? `category-${activeCategory}`
          : viewMode === 'info'
            ? `info-${infoSlug}`
            : 'home';
  resetAdDedupe(adPageKey);

  return (
    <div className="app-container">
      
      {/* Sticky Header */}
      <Header
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        wishlistCount={wishlistItems.length}
        user={user}
        solidHeader={viewMode === 'product-detail' || isCategoryPage || viewMode === 'info'}
        onOpenMenu={() => setIsMenuOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenWishlist={handleOpenWishlist}
        onOpenProfile={handleOpenProfile}
        onLogoClick={() => {
          navigateToRoute('/');
        }}
      />

      {viewMode !== 'checkout' && (
        <SiteTopAdStrip
          globalCode={adCodes.site_common_ad || adCodes.global_banner}
          globalSlotKey={adCodes.site_common_ad ? 'site_common_ad' : 'global_banner'}
          homeBelowHeaderCode={adCodes.home_below_header}
          showHomeSlot={viewMode === 'home' && !isCategoryPage}
        />
      )}

      {/* Main Page Layout */}
      <main className={`main-content ${viewMode === 'checkout' ? 'main-content--checkout' : ''}`}>
        
        {viewMode === 'info' ? (
          <InfoPage
            slug={infoSlug}
            onBack={handleGoBack}
            onBackToHome={() => navigateToRoute('/')}
            onOpenAccount={handleOpenProfile}
          />
        ) : viewMode === 'checkout' ? null : viewMode === 'home' ? (
          <>
            {isCategoryPage ? (
              <CollectionListingPage
                adCodes={adCodes}
                activeCategory={activeCategory}
                onSelectCategory={handleSelectCategory}
                onAddToCart={handleAddToCart}
                onOpenQuickView={handleOpenQuickView}
                onBack={handleGoBack}
                products={productsList}
              />
            ) : (
              <>
                <HeroSlider onSelectCategory={handleSelectCategory} />
                <HomeAdSlot adCodes={adCodes} placement="home_after_hero" />

                <TrendsSection onSelectCategory={handleSelectCategory} />
                <HomeAdSlot adCodes={adCodes} placement="home_after_trends" />

                <OfferSection onSelectCategory={handleSelectCategory} />
                <HomeAdSlot adCodes={adCodes} placement="home_main" />
                <HomeAdSlot adCodes={adCodes} placement="home_after_promo" />

                <HomeAdSlot adCodes={adCodes} placement="home_before_categories" />
                <CategoriesSection
                  activeCategory={activeCategory}
                  onSelectCategory={handleSelectCategory}
                  onAddToCart={handleAddToCart}
                  onOpenQuickView={handleOpenQuickView}
                  products={productsList}
                />
                <HomeAdSlot adCodes={adCodes} placement="home_between_categories_gift" />

                <GiftCollectionSection
                  onSelectCategory={handleSelectCategory}
                  onSelectProduct={handleOpenQuickView}
                  products={productsList}
                  giftCombos={giftCombos}
                />
                <HomeAdSlot adCodes={adCodes} placement="home_after_gift" />

                <HomeAdSlot adCodes={adCodes} placement="home_before_reviews" />
                <ReviewsSection />
                <HomeAdSlot adCodes={adCodes} placement="home_after_reviews" />
              </>
            )}
          </>
        ) : (
          <ProductDetailPage
            product={selectedProduct}
            adCodes={adCodes}
            onBack={handleGoBack}
            onBackToHome={() => {
              if (activeCategory && activeCategory !== 'all') {
                navigateToRoute(`/category/${encodeURIComponent(activeCategory)}`);
              } else {
                navigateToRoute('/');
              }
            }}
            onAddToCart={handleAddToCart}
            onAddToWishlist={handleAddToWishlist}
            isInWishlist={selectedProduct ? isInWishlist(wishlistItems, selectedProduct.id) : false}
            allProducts={productsList}
            onSelectProduct={(p) => navigateToRoute(`/product/${p.id}`)}
            coupons={coupons}
          />
        )}

      </main>

      {/* Footer */}
      <Footer
        onSelectCategory={handleSelectCategory}
        onOpenAccount={handleOpenProfile}
        onScrollToSection={handleScrollToSection}
        onNavigateInfoPage={handleNavigateInfoPage}
        siteSettings={siteSettings}
      />

      {/* Slide-out Drawers & Overlay views */}
      
      <MenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onSelectCategory={handleSelectCategory}
      />

      <SearchDrawer
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onOpenQuickView={handleOpenQuickView}
        onSelectCategory={handleSelectCategory}
        products={productsList}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        coupons={coupons}
        onOpenCheckout={handleOpenCheckout}
        user={user}
        adAboveCheckout={adCodes.cart_above_checkout || adCodes.site_common_ad}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlistItems}
        onRemoveItem={handleRemoveFromWishlist}
        onAddToCart={handleAddToCart}
        onSelectProduct={(p) => navigateToRoute(`/product/${p.id}`)}
      />

      <CheckoutFlow
        isOpen={viewMode === 'checkout'}
        stepSlug={checkoutSlug}
        onNavigateCheckout={handleNavigateCheckout}
        onClose={handleExitCheckout}
        cartItems={cartItems}
        coupons={coupons}
        user={user}
        adCodes={adCodes}
        onUserLogin={handleUserLoginSuccess}
        onPlaceOrder={handleCheckoutPlaceOrder}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onContinueShopping={() => {
          handleExitCheckout();
          navigateToRoute('/');
        }}
        onReviewCart={() => {
          handleExitCheckout();
          setIsCartOpen(true);
        }}
        allProducts={productsList}
        onAddToCart={handleAddToCart}
        onSelectProduct={(p) => navigateToRoute(`/product/${p.id}`)}
      />

      <UserAuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingCheckout(false);
        }}
        onSuccess={handleUserLoginSuccess}
        initialMode={authModalMode}
      />

      <AccountDrawer
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        user={user}
        onLogout={handleUserLogout}
      />

      <QuickViewModal
        product={selectedProduct}
        isOpen={isQuickViewOpen}
        onClose={handleCloseQuickView}
        onAddToCart={handleAddToCart}
        onAddToWishlist={handleAddToWishlist}
        isInWishlist={selectedProduct ? isInWishlist(wishlistItems, selectedProduct.id) : false}
        allProducts={productsList}
        onSelectProduct={(p) => navigateToRoute(`/product/${p.id}`)}
        coupons={coupons}
      />

      {/* Mobile Bottom sticky bar */}
      <MobileNavbar
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
        onOpenWishlist={handleOpenWishlist}
        onOpenProfile={handleOpenProfile}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={cartItems.reduce((acc, item) => acc + item.quantity, 0)}
        isCartOpen={isCartOpen}
      />

    </div>
  );
}
