export const MERCHANT_PRODUCT_CURRENCY = 'USD';

export const PRODUCT_CURRENCIES = ['USD', 'UGX', 'KES', 'TZS', 'RWF', 'EUR', 'GBP'];
export const DEFAULT_PREVIEW_CURRENCY = 'UGX';

export const normalizeCurrency = (code) => {
  if (!code) return 'UGX';
  const upper = String(code).toUpperCase();
  return upper === 'KSH' ? 'KES' : upper;
};

const CURRENCY_SYMBOLS = {
  UGX: 'USh',
  KES: 'KSh',
  TZS: 'TSh',
  RWF: 'FRw',
  USD: 'US$',
  EUR: '€',
  GBP: '£',
};

export const getCurrencySymbol = (currency) =>
  CURRENCY_SYMBOLS[normalizeCurrency(currency)] || normalizeCurrency(currency);

/** eBay-style local buyer price: "USh 247,930" */
export const formatPublicLocalPrice = (amount, currency) => {
  const sym = getCurrencySymbol(currency);
  const value = Math.round(Number(amount) || 0);
  return `${sym} ${value.toLocaleString()}`;
};

/** eBay-style USD reference price: "US$65.99" */
export const formatPublicUsdPrice = (amount) => {
  const value = Number(amount) || 0;
  return `US$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatMoney = (amount, currency = 'UGX') => {
  const value = Math.round(Number(amount) || 0);
  return `${normalizeCurrency(currency)} ${value.toLocaleString()}`;
};

export const getProductListingPrice = (product) => {
  if (!product) return 0;
  if (product.listing_price != null && product.listing_price > 0) return product.listing_price;
  if (product.platform_fee == null || product.vat == null || product.base_price == null) {
    return product.base_price || 0;
  }
  const afterFee = product.base_price * (1 + product.platform_fee / 100);
  return afterFee * (1 + product.vat / 100);
};

/** Discounted buyer listing (USD) — mirrors backend compute_discounted_listing_price. */
export const getProductDiscountedListingPrice = (product) => {
  if (!product) return null;
  if (product.discounted_listing_price != null && product.discounted_listing_price > 0) {
    return Number(product.discounted_listing_price);
  }
  const pct = Number(product.effective_discount_pct ?? product.discount_pct) || 0;
  if (pct <= 0 || product.base_price == null) return null;
  const fee = Number(product.platform_fee ?? 0);
  const vat = Number(product.vat ?? 0);
  const discountedBase = product.base_price * (1 - pct / 100);
  const afterFee = discountedBase * (1 + fee / 100);
  return Number((afterFee * (1 + vat / 100)).toFixed(2));
};

export const productHasDiscount = (product) => {
  const original = getProductListingPrice(product);
  const discounted = getProductDiscountedListingPrice(product);
  return discounted != null && discounted < original;
};

export const convertWithRates = (amount, fromCurrency, toCurrency, rates = {}) => {
  const from = normalizeCurrency(fromCurrency);
  const to = normalizeCurrency(toCurrency);
  const value = Number(amount) || 0;
  if (from === to) return Math.round(value);
  const direct = rates[`${from}-${to}`];
  if (direct) return Math.round(value * direct);
  const viaUsd = rates[`${from}-USD`] && rates[`USD-${to}`];
  if (viaUsd) return Math.round(value * rates[`${from}-USD`] * rates[`USD-${to}`]);
  return null;
};

export const enrichProductForViewer = (product, viewerCurrency, fxRates = {}) => {
  if (!product) return product;
  const viewer = normalizeCurrency(viewerCurrency);
  const listing = getProductListingPrice(product);
  const discountedListing = getProductDiscountedListingPrice(product);
  let enriched = { ...product };

  if (viewer !== MERCHANT_PRODUCT_CURRENCY) {
    const hasDisplay =
      product.display_listing_price != null &&
      product.display_currency &&
      normalizeCurrency(product.display_currency) === viewer;

    if (!hasDisplay) {
      const converted = convertWithRates(listing, MERCHANT_PRODUCT_CURRENCY, viewer, fxRates);
      if (converted != null) {
        enriched = {
          ...enriched,
          currency: MERCHANT_PRODUCT_CURRENCY,
          display_currency: viewer,
          display_listing_price: converted,
        };
      }
    } else {
      enriched = {
        ...enriched,
        display_currency: normalizeCurrency(product.display_currency),
        display_listing_price: Math.round(Number(product.display_listing_price)),
      };
    }

    const hasDisplayDiscount =
      product.display_discounted_listing_price != null &&
      product.display_currency &&
      normalizeCurrency(product.display_currency) === viewer;

    if (hasDisplayDiscount) {
      enriched.display_discounted_listing_price = Math.round(
        Number(product.display_discounted_listing_price)
      );
    } else if (discountedListing != null) {
      const convertedDiscount = convertWithRates(
        discountedListing,
        MERCHANT_PRODUCT_CURRENCY,
        viewer,
        fxRates
      );
      if (convertedDiscount != null) {
        enriched = {
          ...enriched,
          display_currency: enriched.display_currency || viewer,
          display_discounted_listing_price: convertedDiscount,
        };
      }
    }

    // Full local price must always accompany a discounted local price
    if (
      enriched.display_discounted_listing_price != null &&
      enriched.display_listing_price == null
    ) {
      const convertedFull = convertWithRates(listing, MERCHANT_PRODUCT_CURRENCY, viewer, fxRates);
      if (convertedFull != null) {
        enriched.display_currency = enriched.display_currency || viewer;
        enriched.display_listing_price = convertedFull;
      }
    }
  }

  return enriched;
};

export const getPublicPriceDisplay = (product, viewerCurrency = 'UGX', fxRates = {}) => {
  const usdOriginal = Number(getProductListingPrice(product).toFixed(2));
  const usdDiscountedRaw = getProductDiscountedListingPrice(product);
  const usdDiscounted =
    usdDiscountedRaw != null ? Number(usdDiscountedRaw.toFixed(2)) : null;
  const hasDiscount = usdDiscounted != null && usdDiscounted < usdOriginal;
  const viewer = normalizeCurrency(viewerCurrency);

  let localOriginal =
    product?.display_listing_price != null
      ? Math.round(Number(product.display_listing_price))
      : null;
  let localDiscounted =
    product?.display_discounted_listing_price != null
      ? Math.round(Number(product.display_discounted_listing_price))
      : null;
  const localCurrency = product?.display_currency
    ? normalizeCurrency(product.display_currency)
    : viewer;

  if (localOriginal == null && viewer !== MERCHANT_PRODUCT_CURRENCY) {
    localOriginal = convertWithRates(usdOriginal, MERCHANT_PRODUCT_CURRENCY, viewer, fxRates);
  }
  if (localDiscounted == null && hasDiscount && viewer !== MERCHANT_PRODUCT_CURRENCY) {
    localDiscounted = convertWithRates(
      usdDiscounted,
      MERCHANT_PRODUCT_CURRENCY,
      viewer,
      fxRates
    );
  }
  if (localDiscounted != null && localOriginal == null && viewer !== MERCHANT_PRODUCT_CURRENCY) {
    localOriginal = convertWithRates(usdOriginal, MERCHANT_PRODUCT_CURRENCY, viewer, fxRates);
  }

  const showLocal =
    localOriginal != null &&
    normalizeCurrency(localCurrency) !== MERCHANT_PRODUCT_CURRENCY;

  return {
    usdAmount: usdOriginal,
    usdDiscountedAmount: hasDiscount ? usdDiscounted : null,
    localAmount: showLocal ? localOriginal : null,
    localDiscountedAmount: showLocal && hasDiscount ? localDiscounted : null,
    localCurrency: showLocal ? localCurrency : viewer,
    showBoth: showLocal,
    hasDiscount,
  };
};

export const isFreeDelivery = (product) => product?.free_delivery === true;

/** Public card delivery line — only shown when free delivery is enabled. */
export const getProductDeliveryLabel = (product) => {
  if (isFreeDelivery(product)) {
    return { text: 'Free delivery', isFree: true };
  }
  return null;
};

/** Promotion badge / code / expiry for product cards (from unified backend sale context). */
export const getProductPromotionDisplay = (product) => {
  if (!product) return null;
  const badge = product.promotion_badge;
  const code = product.promo_code;
  const endsAt = product.promotion_ends_at;
  const hasDiscount =
    productHasDiscount(product) ||
    (product.effective_discount_pct != null && product.effective_discount_pct > 0);
  if (!badge && !code && !endsAt && !hasDiscount) return null;

  let endsLabel = null;
  if (endsAt) {
    const end = new Date(endsAt);
    if (!Number.isNaN(end.getTime())) {
      endsLabel = end.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
  }

  return {
    badge: badge || (hasDiscount && product.effective_discount_pct
      ? `${Math.round(product.effective_discount_pct)}% off`
      : null),
    code: code || null,
    endsLabel,
    name: product.promotion_name || null,
  };
};

export const getDualPriceLabel = (product) => {
  const currency = normalizeCurrency(product?.currency || MERCHANT_PRODUCT_CURRENCY);
  const listing = getProductListingPrice(product);
  const primary = formatMoney(listing, currency);

  if (
    product?.display_currency &&
    product?.display_listing_price != null &&
    normalizeCurrency(product.display_currency) !== currency
  ) {
    return {
      primary,
      secondary: `≈ ${formatMoney(product.display_listing_price, product.display_currency)}`,
    };
  }

  return { primary, secondary: null };
};
