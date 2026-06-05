import React, { useState, useEffect, Suspense, lazy } from 'react';
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
import {
  fetchStoreAdSlots,
  fetchStoreCoupons,
  fetchStoreProducts,
  fetchStoreSettings,
  fetchStoreGiftCombos,
  submitStoreOrder,
} from './api/storeApi';
import { loadCatalogProducts } from './utils/loadCatalog';
import { CATALOG_VERSION_KEY } from './utils/catalogSync';
import { applySiteSettingsToDocument } from './utils/siteSettings';
import { adSlotsToCodeMap } from './utils/adSlots';
import { resetAdDedupe } from './utils/adDedupe';
import { runWhenIdle } from './utils/scheduleAdFit';
import { userMe } from './api/userApi';
import { getUserToken, setUserToken } from './api/client';
import { saveCheckoutState } from './checkout/checkoutStorage';
import { normalizeCheckoutSlug } from './checkout/checkoutRoutes';
import {
  mergeProductForDetail,
  parseRouteFromPath,
  resolveProductPage,
} from './utils/resolveProductPage';
import './App.css';

const ProductDetailPage = lazy(() => import('./components/ProductDetailPage'));
const CollectionListingPage = lazy(() => import('./components/CollectionListingPage'));
const CheckoutFlow = lazy(() => import('./checkout/CheckoutFlow'));

function RouteFallback() {
  return <div className="route-loading" aria-hidden="true" />;
}

function resolveAppRoute(pathname, productsList, giftCombos = []) {
  const route = parseRouteFromPath(pathname);
  if (route.viewMode === 'info' && route.infoSlug && !getInfoPage(route.infoSlug)) {
    return {
      viewMode: 'home',
      activeCategory: 'all',
      selectedProduct: null,
      isCategoryPage: false,
      infoSlug: null,
      checkoutSlug: null,
    };
  }
  if (route.viewMode === 'checkout') {
    route.checkoutSlug = normalizeCheckoutSlug(route.checkoutSlug || 'bag');
  }
  if (route.productId) {
    route.selectedProduct = resolveProductPage(route.productId, productsList, giftCombos, {
      preferGiftCombo: true,
    });
  }
  return route;
}

export default function App() {
  // Global synchronized states
  const [productsList, setProductsList] = useState([]);

  const [giftCombos, setGiftCombos] = useState([]);

  const getRouteInfo = () => {
    if (typeof window === 'undefined') {
      return resolveAppRoute('/', [], []);
    }
    return resolveAppRoute(window.location.pathname, productsList, giftCombos);
  };

  const bootRoute =
    typeof window !== 'undefined'
      ? resolveAppRoute(window.location.pathname, [], [])
      : resolveAppRoute('/', [], []);

  const [activeCategory, setActiveCategory] = useState(bootRoute.activeCategory);
  const [selectedProduct, setSelectedProduct] = useState(bootRoute.selectedProduct);
  const [viewMode, setViewMode] = useState(bootRoute.viewMode);
  const [isCategoryPage, setIsCategoryPage] = useState(bootRoute.isCategoryPage);
  const [infoSlug, setInfoSlug] = useState(bootRoute.infoSlug ?? null);
  const [checkoutSlug, setCheckoutSlug] = useState(bootRoute.checkoutSlug ?? 'bag');

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
      const prodId = parseInt(segments[1], 10);
      const found = resolveProductPage(prodId, productsList, giftCombos, {
        preferGiftCombo: false,
      });
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

  useEffect(() => {
    fetchStoreSettings().then((s) => {
      if (s) setSiteSettings(applySiteSettingsToDocument(s));
    });

    runWhenIdle(() => {
      fetchStoreCoupons().then((list) => {
        if (list?.length) setCoupons(list);
      });
      fetchStoreGiftCombos().then((list) => {
        if (list?.length) setGiftCombos(list);
      });
      fetchStoreAdSlots().then((list) => {
        if (list?.length) setAdCodes(adSlotsToCodeMap(list));
      });
    });
  }, []);

  // Load catalog first; refetch when tab visible, admin adds product, or on interval
  useEffect(() => {
    const applyCatalog = (list) => {
      if (list?.length) setProductsList(list);
    };

    const refreshCatalog = () => loadCatalogProducts({ force: true }).then(applyCatalog);

    loadCatalogProducts().then(applyCatalog);

    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      refreshCatalog();
    };
    document.addEventListener('visibilitychange', onVisible);

    const onStorage = (e) => {
      if (e.key === CATALOG_VERSION_KEY) refreshCatalog();
    };
    window.addEventListener('storage', onStorage);

    const pollId = window.setInterval(() => {
      if (document.visibilityState === 'visible') refreshCatalog();
    }, 20_000);

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('storage', onStorage);
      window.clearInterval(pollId);
    };
  }, []);

  // Resolve PDP after catalog / gift combos load (direct URL, refresh)
  useEffect(() => {
    if (viewMode !== 'product-detail') return;
    const route = parseRouteFromPath(window.location.pathname);
    if (!route.productId) return;
    if (selectedProduct?.id === route.productId) return;
    if (!productsList.length) return;

    const resolved = resolveProductPage(route.productId, productsList, giftCombos, {
      preferGiftCombo: true,
    });
    if (resolved) setSelectedProduct(resolved);
  }, [productsList, giftCombos, viewMode, selectedProduct?.id]);

  // Resolve PDP after catalog loads (direct URL / refresh)
  useEffect(() => {
    if (viewMode !== 'product-detail' || productsList.length) return;
    const route = parseRouteFromPath(window.location.pathname);
    if (!route.productId) return;

    loadCatalogProducts().then((list) => {
      if (!list?.length) return;
      setProductsList(list);
      const resolved = resolveProductPage(route.productId, list, giftCombos, {
        preferGiftCombo: true,
      });
      if (resolved) setSelectedProduct(resolved);
    });
  }, [viewMode, giftCombos, productsList.length]);

  useEffect(() => {
    const retry = window.setTimeout(() => {
      fetchStoreAdSlots().then((list) => {
        if (list?.length) setAdCodes(adSlotsToCodeMap(list));
      });
    }, 4000);
    return () => window.clearTimeout(retry);
  }, []);

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
  }, [productsList, giftCombos]);

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

      const orderHasEmail = Boolean(
        orderDetails.email?.trim() && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orderDetails.email.trim())
      );
      if (orderHasEmail && result.emailSent !== true) {
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

  const handleOpenQuickView = (payload) => {
    const id = payload?.id ?? payload?.productId;
    if (!id) return;

    const merged = mergeProductForDetail(payload, productsList);
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
        <Suspense fallback={<RouteFallback />}>
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
                <HomeAdSlot adCodes={adCodes} placement="home_after_promo" />

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

                <ReviewsSection />
                <HomeAdSlot adCodes={adCodes} placement="home_after_reviews" />
              </>
            )}
          </>
        ) : viewMode === 'product-detail' && !selectedProduct ? (
          !productsList.length ? (
            <RouteFallback />
          ) : (
          <div className="product-not-found container">
            <h1>Product not found</h1>
            <p>This item may have been removed or the link is incorrect.</p>
            <button type="button" className="btn btn-primary" onClick={() => navigateToRoute('/')}>
              Back to home
            </button>
          </div>
          )
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

        </Suspense>
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

      <Suspense fallback={null}>
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
      </Suspense>

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
