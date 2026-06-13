import React, { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { queryKeys } from '../lib/queryKeys';
import {
  useCategories,
  useProducts,
  useGeoCurrency,
  useFxRates,
} from '../hooks/queries';
import { 
  Package, Plus, X, ArrowRight, ArrowLeft, Check, Tag, 
  Search, Filter, ChevronRight, MoreVertical, Eye, 
  Trash2, Edit3, ShoppingCart, Activity, Layers, Upload, Image as ImageIcon, ChevronDown, DollarSign,
  Info, Calendar, BarChart, Percent, AlertCircle, HelpCircle, Loader2
} from 'lucide-react';
import './ProductList.css';
import { useNavigate } from 'react-router-dom';
import { alertSuccess, alertError, confirmDelete } from '../utils/swal';
import {
  MERCHANT_PRODUCT_CURRENCY,
  DEFAULT_PREVIEW_CURRENCY,
  normalizeCurrency,
  formatMoney,
  getPublicPriceDisplay,
  enrichProductForViewer,
  formatPublicLocalPrice,
  formatPublicUsdPrice,
  getProductDeliveryLabel,
  isFreeDelivery,
  getProductPromotionDisplay,
} from '../utils/currency';

const getStockLabel = (product) => {
  const qty = product?.stock_quantity ?? 0;
  if (qty <= 0) return { text: 'Out of Stock', className: 'hidden' };
  return { text: `${qty} in stock`, className: 'active' };
};

const PublicCardPrice = ({ display, size = 'local', style, className }) => {
  const isLocal = size === 'local';
  const resolvedClass = className || (isLocal ? 'card-price-local' : 'card-price-usd');
  const format = isLocal
    ? (amount) => formatPublicLocalPrice(amount, display.localCurrency)
    : formatPublicUsdPrice;
  const original = isLocal ? display.localAmount : display.usdAmount;
  const current = isLocal
    ? (display.localDiscountedAmount ?? display.localAmount)
    : (display.usdDiscountedAmount ?? display.usdAmount);

  if (display.hasDiscount) {
    return (
      <p className={resolvedClass} style={style}>
        <span className="price-original">{format(original)}</span>
        <span className="price-discounted">{format(current)}</span>
        <span className="price-tax"> + tax</span>
      </p>
    );
  }

  return (
    <p className={resolvedClass} style={style}>
      {format(current)}<span className="price-tax"> + tax</span>
    </p>
  );
};

const ProductList = () => {
  const queryClient = useQueryClient();
  const { data: geoData, isSuccess: geoReady } = useGeoCurrency();
  const { data: fxRates = {} } = useFxRates();
  const { data: categories = [] } = useCategories();

  const viewerCurrency = useMemo(() => {
    if (geoReady && geoData?.currency && !geoData?.error) {
      return normalizeCurrency(geoData.currency);
    }
    return DEFAULT_PREVIEW_CURRENCY;
  }, [geoData, geoReady]);

  const { data: rawProducts = [] } = useProducts(viewerCurrency, geoReady);

  const refreshProducts = () => {
    queryClient.invalidateQueries({ queryKey: ['products'] });
    queryClient.invalidateQueries({ queryKey: queryKeys.stats });
  };

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('ADD'); // ADD, EDIT, VIEW
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [menuOpenSku, setMenuOpenSku] = useState(null);
  const [isPublishing, setIsPublishing] = useState(false);
  
  const [viewImageIndex, setViewImageIndex] = useState(0);
  
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    categoryId: '',
    stockQuantity: '',
    discountPct: '',
    promoCode: '',
    minimumOrderQty: '',
    vatPct: '18',
    freeDelivery: 'no',
    bulkTiers: [],
  });

  const [pricePreview, setPricePreview] = useState({
    base_price: 0,
    platform_fee_pct: null,
    vat_pct: null,
    platform_fee_amount: 0,
    vat_amount: 0,
    listing_price: 0,
    previewUnavailable: false,
  });

  const products = useMemo(
    () => rawProducts.map((p) => enrichProductForViewer(p, viewerCurrency, fxRates)),
    [rawProducts, viewerCurrency, fxRates]
  );

  const [productImages, setProductImages] = useState([]);
  const navigate = useNavigate();

  const selectedCategory = categories.find((c) => String(c.id) === String(formData.categoryId));
  const categoryChannel = selectedCategory?.channel || 'BOTH';
  const showRetailFields = categoryChannel === 'RETAIL' || categoryChannel === 'BOTH';
  const showWholesaleFields = categoryChannel === 'WHOLESALE' || categoryChannel === 'BOTH';

  const fetchPricePreview = async (basePrice, vatPct, viewerCcy) => {
    const price = parseFloat(basePrice);
    const vat = parseFloat(vatPct);
    if (!price || price <= 0) {
      setPricePreview({
        base_price: 0,
        platform_fee_pct: null,
        vat_pct: vat || null,
        platform_fee_amount: 0,
        vat_amount: 0,
        listing_price: 0,
        previewUnavailable: false,
      });
      return;
    }
    try {
      const res = await api.post('/pricing/preview', {
        base_price: price,
        vat_pct: Number.isFinite(vat) ? vat : undefined,
        currency: MERCHANT_PRODUCT_CURRENCY,
        viewer_currency: viewerCcy ? normalizeCurrency(viewerCcy) : undefined,
      });
      setPricePreview({ ...res.data, previewUnavailable: false });
    } catch {
      setPricePreview({
        base_price: price,
        platform_fee_pct: null,
        vat_pct: null,
        platform_fee_amount: 0,
        vat_amount: 0,
        listing_price: 0,
        previewUnavailable: true,
      });
    }
  };

  useEffect(() => {
    if (formData.basePrice) {
      fetchPricePreview(formData.basePrice, formData.vatPct, viewerCurrency);
    }
  }, [formData.basePrice, formData.vatPct, viewerCurrency]);

  useEffect(() => {
    const handleClickOutside = () => setMenuOpenSku(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const openDrawer = (mode, product = null) => {
    setDrawerMode(mode);
    setSelectedProduct(product);
    setViewImageIndex(0);
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        basePrice: product.base_price.toString(),
        categoryId: product.category_id || '',
        stockQuantity: product.stock_quantity?.toString() || '',
        discountPct: product.discount_pct?.toString() || '',
        promoCode: product.promo_code || '',
        minimumOrderQty: product.minimum_order_qty?.toString() || '',
        vatPct: (product.vat ?? 18).toString(),
        freeDelivery: isFreeDelivery(product) ? 'yes' : 'no',
        bulkTiers: product.bulk_tiers || [],
      });
      setProductImages(product.images ? product.images.map(img => img.base64_content) : []);
    } else {
      setFormData({ name: '', description: '', basePrice: '', categoryId: '', stockQuantity: '', discountPct: '', promoCode: '', minimumOrderQty: '', vatPct: '18', freeDelivery: 'no', bulkTiers: [] });
      setProductImages([]);
    }
    setStep(1);
    setIsDrawerOpen(true);
    setMenuOpenSku(null);
  };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      const payload = {
        name: formData.name,
        description: formData.description,
        base_price: parseFloat(formData.basePrice),
        category_id: formData.categoryId || null,
        stock_quantity: parseInt(formData.stockQuantity || '0', 10),
        discount_pct: formData.discountPct ? parseFloat(formData.discountPct) : null,
        promo_code: formData.promoCode || null,
        minimum_order_qty: formData.minimumOrderQty ? parseInt(formData.minimumOrderQty, 10) : null,
        vat: formData.vatPct !== '' ? parseFloat(formData.vatPct) : null,
        currency: MERCHANT_PRODUCT_CURRENCY,
        free_delivery: formData.freeDelivery === 'yes',
        bulk_tiers: formData.bulkTiers.filter((t) => t.min_quantity && t.discount_pct),
        images: productImages.map((img, idx) => ({ base64_content: img, sort_order: idx })),
      };

      if (drawerMode === 'EDIT') {
        await api.patch(`/products/${selectedProduct.sku}`, payload);
      } else {
        await api.post('/products/', payload);
      }
      
      refreshProducts();
      setIsDrawerOpen(false);
      alertSuccess('Product Saved', 'Your product has been saved successfully.');
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message = typeof detail === 'string'
        ? detail
        : Array.isArray(detail)
          ? detail.map((e) => e.msg).join(', ')
          : 'Could not save the product. Please try again.';
      alertError('Operation Failed', message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDeleteProduct = async (sku) => {
    const result = await confirmDelete({
      title: 'Delete Product?',
      text: 'This action cannot be undone.',
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/products/${sku}`);
        alertSuccess('Deleted', 'Product removed successfully.');
        refreshProducts();
      } catch (err) {
        alertError('Delete Failed', 'Failed to delete product. Please try again.');
      }
    }
  };

  const getCategoryName = (id) => {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : 'General';
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = activeFilter === 'All' || getCategoryName(p.category_id) === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const toggleMenu = (e, sku) => {
    e.stopPropagation();
    setMenuOpenSku(menuOpenSku === sku ? null : sku);
  };

  return (
    <div className="product-list-container animate-fade">
      <div className="page-header-refined">
        <div className="title-group">
          <h1>Product Inventory</h1>
          <p>You have {products.length} active listings.</p>
        </div>
        <div className="header-actions">
           <button className="btn-secondary-expert" onClick={() => navigate('/dashboard/categories')}>
             <Layers size={18} /> Categories
          </button>
          <button className="btn-add-product" onClick={() => openDrawer('ADD')}>
            <div className="icon-box"><Plus size={20} /></div>
            <span>New Product</span>
          </button>
        </div>
      </div>

      <div className="stats-grid-compact">
        <div className="stat-card-refined glass">
          <div className="icon indigo"><Layers size={20} /></div>
          <div className="info">
            <span className="lbl">Total Items</span>
            <span className="val">{products.length}</span>
          </div>
        </div>
        <div className="stat-card-refined glass">
          <div className="icon emerald"><Check size={20} /></div>
          <div className="info">
            <span className="lbl">Public</span>
            <span className="val">{products.filter(p => p.is_active).length}</span>
          </div>
        </div>
        <div className="stat-card-refined glass">
          <div className="icon amber"><BarChart size={20} /></div>
          <div className="info">
            <span className="lbl">Categories</span>
            <span className="val">{categories.length}</span>
          </div>
        </div>
      </div>

      <div className="inventory-controls glass">
        <div className="search-box-refined">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by name or SKU..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-chips">
          <button 
            className={`chip ${activeFilter === 'All' ? 'active' : ''}`}
            onClick={() => setActiveFilter('All')}
          >
            All
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id} 
              className={`chip ${activeFilter === cat.name ? 'active' : ''}`}
              onClick={() => setActiveFilter(cat.name)}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="product-grid-refined">
        {filteredProducts.map(product => {
          const display = getPublicPriceDisplay(product, viewerCurrency, fxRates);
          const delivery = getProductDeliveryLabel(product);
          const promo = getProductPromotionDisplay(product);
          return (
            <div key={product.sku} className="product-card-public animate-fade">
              <div className="card-media">
                <div className="media-placeholder">
                  {product.images?.[0] ? (
                    <img src={product.images[0].base64_content} alt={product.name} className="product-main-img" />
                  ) : <Package size={48} strokeWidth={1} />}
                </div>
                <div className={`badge ${product.is_active ? 'active' : 'hidden'}`}>
                  {product.is_active ? 'Live' : 'Draft'}
                </div>
                {promo?.badge && (
                  <div className="card-promo-badge">{promo.badge}</div>
                )}
                <div className="card-menu-container">
                   <button className="menu-trigger-btn public-card-menu" onClick={(e) => toggleMenu(e, product.sku)}>
                      <MoreVertical size={18} />
                   </button>
                   {menuOpenSku === product.sku && (
                     <div className="card-dropdown glass animate-slide-up" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openDrawer('VIEW', product)}><Eye size={16} /> View Details</button>
                        <button onClick={() => openDrawer('EDIT', product)}><Edit3 size={16} /> Edit Product</button>
                        <hr />
                        <button className="danger" onClick={() => handleDeleteProduct(product.sku)}><Trash2 size={16} /> Delete</button>
                     </div>
                   )}
                </div>
              </div>
              <div className="card-content-public">
                <h3 className="card-title-public" title={product.name}>{product.name}</h3>
                <PublicCardPrice
                  display={display}
                  size={display.showBoth ? 'local' : 'usd'}
                  className="card-price-local"
                />
                <p className="card-source">Pochi</p>
                {delivery && (
                  <p className="card-delivery is-free">{delivery.text}</p>
                )}
                {promo?.code && (
                  <p className="card-promo-code">
                    <Tag size={12} /> Code <strong>{promo.code}</strong>
                    {promo.endsLabel ? ` · ends ${promo.endsLabel}` : ''}
                  </p>
                )}
                {display.showBoth && (
                  <PublicCardPrice display={display} size="usd" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Professional Drawer */}
      <div className={`expert-drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}>
        <div className="expert-drawer" onClick={e => e.stopPropagation()}>
          <div className="drawer-nav">
            <div className="nav-header">
              <div className="icon-badge">
                {drawerMode === 'VIEW' ? <Eye size={24} /> : drawerMode === 'EDIT' ? <Edit3 size={24} /> : <Plus size={24} />}
              </div>
              <div className="text">
                <h2>{drawerMode === 'VIEW' ? 'Product Inspection' : drawerMode === 'EDIT' ? 'Edit Listing' : 'New Product Listing'}</h2>
                <p>{drawerMode === 'VIEW' ? selectedProduct?.sku : `Configure your catalog item`}</p>
              </div>
            </div>
            <button className="drawer-close-btn" onClick={() => setIsDrawerOpen(false)}><X /></button>
          </div>

          <div className="drawer-main">
            {drawerMode !== 'VIEW' && (
              <div className="expert-stepper">
                <div className={`step-pill ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}></div>
                <div className={`step-pill ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}></div>
                <div className={`step-pill ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}></div>
              </div>
            )}

            {drawerMode === 'VIEW' ? (
              <div className="view-panel animate-fade">
                 <div className="view-visual glass">
                    {productImages[viewImageIndex] ? (
                      <img src={productImages[viewImageIndex]} alt="Main" className="main-view-img" />
                    ) : <Package size={64} />}
                    
                    {productImages.length > 1 && (
                      <div className="view-thumbnails">
                        {productImages.map((img, idx) => (
                          <div 
                            key={idx} 
                            className={`thumb-card ${viewImageIndex === idx ? 'active' : ''}`}
                            onClick={() => setViewImageIndex(idx)}
                          >
                            <img src={img} alt="Thumb" />
                          </div>
                        ))}
                      </div>
                    )}
                 </div>
                 <div className="view-details-grid">
                    <div className="detail-box">
                       <label>Name</label>
                       <p>{selectedProduct?.name}</p>
                    </div>
                    <div className="detail-box">
                       <label>Category</label>
                       <p>{getCategoryName(selectedProduct?.category_id)}</p>
                    </div>
                    <div className="detail-box full">
                       <label>Description</label>
                       <p>{selectedProduct?.description || 'No description provided.'}</p>
                    </div>
                    <div className="detail-box highlight public-price-detail">
                       <label>Public pricing preview</label>
                       {selectedProduct && (() => {
                         const enriched = enrichProductForViewer(selectedProduct, viewerCurrency, fxRates);
                         const display = getPublicPriceDisplay(enriched, viewerCurrency, fxRates);
                         return (
                           <div className="public-price-detail-ebay">
                             <PublicCardPrice
                               display={display}
                               size={display.showBoth ? 'local' : 'usd'}
                               className="card-price-local"
                               style={{ color: 'inherit' }}
                             />
                             <p className="card-source" style={{ color: 'inherit' }}>Pochi</p>
                             {(() => {
                               const delivery = getProductDeliveryLabel(selectedProduct);
                               return delivery ? (
                                 <p className="card-delivery is-free" style={{ color: 'inherit' }}>
                                   {delivery.text}
                                 </p>
                               ) : null;
                             })()}
                             <PublicCardPrice display={display} size="usd" style={{ color: 'inherit' }} />
                           </div>
                         );
                       })()}
                       <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8 }}>
                         Base: {formatMoney(selectedProduct?.base_price, MERCHANT_PRODUCT_CURRENCY)}
                         {selectedProduct?.platform_fee != null && ` + ${selectedProduct.platform_fee}% platform fee`}
                         {selectedProduct?.vat != null && ` + ${selectedProduct.vat}% tax`}
                       </p>
                    </div>
                    <div className="detail-box">
                       <label>Stock Quantity</label>
                       <p>{selectedProduct?.stock_quantity > 0 ? `${selectedProduct.stock_quantity} units available` : 'Out of stock — edit product and set Stock Quantity on step 1'}</p>
                    </div>
                 </div>
              </div>
            ) : step === 1 ? (
              <div className="form-card animate-fade">
                <div className="form-card-header">
                  <div className="icon"><Info size={20} /></div>
                  <h3>General Information</h3>
                </div>
                <div className="expert-form">
                  <div className="form-field">
                    <label>Product Title <HelpCircle size={14} className="label-tip" /></label>
                    <div className="input-wrapper">
                      <ShoppingCart size={18} className="field-icon" />
                      <input 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        placeholder="e.g. Premium Arabica Coffee" 
                      />
                    </div>
                    <p className="field-help">Keep it short and descriptive (max 60 chars).</p>
                  </div>
                  <div className="form-field">
                    <label>Stock Quantity <HelpCircle size={14} className="label-tip" /></label>
                    <div className="input-wrapper">
                      <Package size={18} className="field-icon" />
                      <input
                        type="number"
                        min="0"
                        value={formData.stockQuantity}
                        onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                        placeholder="e.g. 100"
                      />
                    </div>
                    <p className="field-help">Units available for sale. Products with 0 stock show as Out of Stock in the Pochi app.</p>
                  </div>
                  <div className="form-field">
                    <label>Market Category</label>
                    <div className="input-wrapper">
                      <Layers size={18} className="field-icon" />
                      <select 
                        value={formData.categoryId} 
                        onChange={e => setFormData({...formData, categoryId: e.target.value})}
                      >
                        <option value="">Choose a category...</option>
                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            ) : step === 2 ? (
              <div className="form-card animate-fade">
                <div className="form-card-header">
                  <div className="icon"><ImageIcon size={20} /></div>
                  <h3>Product Media</h3>
                </div>
                <div className="expert-form">
                  <input type="file" id="p-img" multiple accept="image/*" onChange={(e) => {
                     const files = Array.from(e.target.files);
                     files.forEach(file => {
                        const reader = new FileReader();
                        reader.onloadend = () => setProductImages(prev => [...prev, reader.result]);
                        reader.readAsDataURL(file);
                     });
                  }} hidden />
                  <label htmlFor="p-img" className="modern-upload-zone glass">
                    <Upload size={32} />
                    <h4>Click to upload photos</h4>
                    <p>Up to 5 high-quality images</p>
                  </label>
                  <div className="gallery-preview-grid">
                    {productImages.map((img, idx) => (
                      <div key={idx} className="modern-preview-card">
                        <img src={img} alt="Preview" />
                        <button className="remove-badge" onClick={() => setProductImages(prev => prev.filter((_, i) => i !== idx))}><X size={12} /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="form-card animate-fade">
                <div className="form-card-header">
                  <div className="icon"><DollarSign size={20} /></div>
                  <h3>Pricing & Description</h3>
                </div>
                <div className="expert-form">
                  <div className="form-field">
                    <label>Base Selling Price (USD)</label>
                    <div className="input-wrapper">
                      <DollarSign size={18} className="field-icon" />
                      <input 
                        type="number" 
                        value={formData.basePrice} 
                        onChange={e => setFormData({...formData, basePrice: e.target.value})} 
                      />
                    </div>
                    <p className="field-help">Prices are stored in USD. Buyers see a local price in their region.</p>
                  </div>
                  <div className="form-field">
                    <label>Tax / VAT (%)</label>
                    <div className="input-wrapper">
                      <Percent size={18} className="field-icon" />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={formData.vatPct}
                        onChange={(e) => setFormData({ ...formData, vatPct: e.target.value })}
                        placeholder="e.g. 18"
                      />
                    </div>
                    <p className="field-help">Enter the tax rate you pay to the tax authority. This is added to the buyer price.</p>
                  </div>
                  <div className="form-field">
                    <label>Delivery</label>
                    <div className="input-wrapper">
                      <select
                        value={formData.freeDelivery}
                        onChange={(e) => setFormData({ ...formData, freeDelivery: e.target.value })}
                      >
                        <option value="no">Delivery not included (buyer pays shipping)</option>
                        <option value="yes">Free delivery</option>
                      </select>
                    </div>
                    <p className="field-help">
                      Card preview:{' '}
                      {formData.freeDelivery === 'yes' ? (
                        <span className="delivery-preview-free">Free delivery</span>
                      ) : (
                        <span className="delivery-preview-paid">Hidden on card</span>
                      )}
                    </p>
                  </div>
                  {showRetailFields && (
                    <>
                      <div className="form-field">
                        <label>Retail Discount (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={formData.discountPct}
                          onChange={(e) => setFormData({ ...formData, discountPct: e.target.value })}
                        />
                      </div>
                      <div className="form-field">
                        <label>Promo Code (optional)</label>
                        <input
                          value={formData.promoCode}
                          onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                          placeholder="SUMMER10"
                        />
                        <p className="field-help">Label for checkout — discount % above sets the price shown on cards.</p>
                      </div>
                    </>
                  )}
                  {showWholesaleFields && (
                    <>
                      <div className="form-field">
                        <label>Minimum Order Quantity (MOQ)</label>
                        <input
                          type="number"
                          min="1"
                          value={formData.minimumOrderQty}
                          onChange={(e) => setFormData({ ...formData, minimumOrderQty: e.target.value })}
                        />
                      </div>
                      <div className="form-field">
                        <label>Wholesale Promo Code (optional)</label>
                        <input
                          value={formData.promoCode}
                          onChange={(e) => setFormData({ ...formData, promoCode: e.target.value })}
                          placeholder="BULK-SUMMER"
                        />
                      </div>
                      <div className="form-field full">
                        <label>Bulk Pricing Tiers</label>
                        {formData.bulkTiers.map((tier, idx) => (
                          <div key={idx} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <input
                              type="number"
                              placeholder="Min qty"
                              value={tier.min_quantity}
                              onChange={(e) => {
                                const tiers = [...formData.bulkTiers];
                                tiers[idx] = { ...tiers[idx], min_quantity: parseInt(e.target.value, 10) };
                                setFormData({ ...formData, bulkTiers: tiers });
                              }}
                            />
                            <input
                              type="number"
                              placeholder="Discount %"
                              value={tier.discount_pct}
                              onChange={(e) => {
                                const tiers = [...formData.bulkTiers];
                                tiers[idx] = { ...tiers[idx], discount_pct: parseFloat(e.target.value) };
                                setFormData({ ...formData, bulkTiers: tiers });
                              }}
                            />
                            <button type="button" onClick={() => setFormData({ ...formData, bulkTiers: formData.bulkTiers.filter((_, i) => i !== idx) })}>Remove</button>
                          </div>
                        ))}
                        <button type="button" className="btn-secondary-expert" onClick={() => setFormData({ ...formData, bulkTiers: [...formData.bulkTiers, { min_quantity: '', discount_pct: '' }] })}>
                          Add Tier
                        </button>
                      </div>
                    </>
                  )}
                  <div className="pricing-calculator-card">
                    {pricePreview.previewUnavailable ? (
                      <p style={{ fontSize: 13, color: 'var(--danger, #c0392b)' }}>
                        Price preview unavailable. Check your connection or try again.
                      </p>
                    ) : (
                      <>
                        <div className="calc-row"><span>Base Price (your revenue)</span><span>{formatMoney(parseFloat(formData.basePrice || 0), MERCHANT_PRODUCT_CURRENCY)}</span></div>
                        <div className="calc-row"><span>Platform Fee ({pricePreview.platform_fee_pct ?? '—'}%)</span><span>{formatMoney(pricePreview.platform_fee_amount || 0, MERCHANT_PRODUCT_CURRENCY)}</span></div>
                        <div className="calc-row"><span>Tax / VAT ({pricePreview.vat_pct ?? '—'}%)</span><span>{formatMoney(pricePreview.vat_amount || 0, MERCHANT_PRODUCT_CURRENCY)}</span></div>
                        <div className="calc-row total"><span>Buyer Price (USD)</span><span className="final-price">{formatMoney(pricePreview.listing_price || 0, MERCHANT_PRODUCT_CURRENCY)}</span></div>
                        {pricePreview.display_listing_price != null && pricePreview.display_currency && (
                          <div className="calc-row"><span>Local estimate</span><span>≈ {formatMoney(pricePreview.display_listing_price, pricePreview.display_currency)}</span></div>
                        )}
                      </>
                    )}
                    <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
                      Platform fee is set by Pochi. Tax rate is set by you per product.
                    </p>
                  </div>
                  <div className="form-field">
                    <label>Full Description</label>
                    <textarea 
                      value={formData.description} 
                      onChange={e => setFormData({...formData, description: e.target.value})} 
                      rows="5"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {drawerMode !== 'VIEW' && (
            <div className="drawer-footer">
              {step > 1 && (
                <button className="btn-secondary-expert" onClick={() => setStep(step - 1)} disabled={isPublishing}>
                  <ArrowLeft size={18} /> Previous
                </button>
              )}
              <button 
                className="btn-primary-expert" 
                onClick={() => step < 3 ? setStep(step + 1) : handlePublish()}
                disabled={isPublishing}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="spinner-icon animate-spin" size={18} />
                    <span>Publishing...</span>
                  </>
                ) : (
                  <>
                    {step === 3 ? 'Publish Listing' : 'Continue'} <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
