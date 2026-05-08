import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Package, Plus, X, ArrowRight, ArrowLeft, Check, Tag, 
  Search, Filter, ChevronRight, MoreVertical, Eye, 
  Trash2, Edit3, ShoppingCart, Activity, Layers, Upload, Image as ImageIcon, ChevronDown, DollarSign,
  Info, Calendar, BarChart, Percent, AlertCircle, HelpCircle
} from 'lucide-react';
import './ProductList.css';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('ADD'); // ADD, EDIT, VIEW
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [menuOpenSku, setMenuOpenSku] = useState(null);
  
  const [viewImageIndex, setViewImageIndex] = useState(0);
  
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    basePrice: '',
    categoryId: ''
  });

  const [productImages, setProductImages] = useState([]); 
  const navigate = useNavigate();

  const PLATFORM_FEE_PERCENT = 0.05;
  const listingPrice = formData.basePrice ? (parseFloat(formData.basePrice) * (1 + PLATFORM_FEE_PERCENT)).toFixed(0) : '0';

  useEffect(() => {
    fetchCategories();
    fetchProducts();
    const handleClickOutside = () => setMenuOpenSku(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://pakacha.com/api/v1/categories/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCategories(res.data);
    } catch (err) {
      console.error('Failed to fetch categories');
    }
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://pakacha.com/api/v1/products/my-products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = (mode, product = null) => {
    setDrawerMode(mode);
    setSelectedProduct(product);
    setViewImageIndex(0);
    if (product) {
      setFormData({
        name: product.name,
        description: product.description || '',
        basePrice: product.base_price.toString(),
        categoryId: product.category_id || ''
      });
      setProductImages(product.images ? product.images.map(img => img.base64_content) : []);
    } else {
      setFormData({ name: '', description: '', basePrice: '', categoryId: '' });
      setProductImages([]);
    }
    setStep(1);
    setIsDrawerOpen(true);
    setMenuOpenSku(null);
  };

  const handlePublish = async () => {
    try {
      const token = localStorage.getItem('token');
      const payload = {
        name: formData.name,
        description: formData.description,
        base_price: parseFloat(formData.basePrice),
        category_id: formData.categoryId || null,
        images: productImages.map((img, idx) => ({ base64_content: img, sort_order: idx }))
      };

      if (drawerMode === 'EDIT') {
        await axios.patch(`http://pakacha.com/api/v1/products/${selectedProduct.sku}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://pakacha.com/api/v1/products/', payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      Swal.fire({ icon: 'success', title: 'Product Saved', timer: 2000, showConfirmButton: false });
      setIsDrawerOpen(false);
      fetchProducts();
    } catch (err) {
      Swal.fire('Error', 'Operation failed', 'error');
    }
  };

  const handleDeleteProduct = async (sku) => {
    const result = await Swal.fire({
      title: 'Delete Product?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://pakacha.com/api/v1/products/${sku}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Deleted!', 'Product removed.', 'success');
        fetchProducts();
      } catch (err) {
        Swal.fire('Error', 'Failed to delete product', 'error');
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

  if (loading && products.length === 0) return <div className="loader">Loading...</div>;

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
        {filteredProducts.map(product => (
            <div key={product.sku} className="product-card-expert glass animate-fade">
              <div className="card-media">
                <div className="media-placeholder">
                  {product.images?.[0] ? (
                    <img src={product.images[0].base64_content} alt={product.name} className="product-main-img" />
                  ) : <Package size={48} strokeWidth={1} />}
                </div>
                <div className={`badge ${product.is_active ? 'active' : 'hidden'}`}>
                  {product.is_active ? 'Public' : 'Private'}
                </div>
                <div className="card-menu-container">
                   <button className="menu-trigger-btn" onClick={(e) => toggleMenu(e, product.sku)}>
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
              <div className="card-content">
                <div className="card-header-row">
                  <span className="category-tag">{getCategoryName(product.category_id)}</span>
                  <span className="sku-id">{product.sku}</span>
                </div>
                <h3>{product.name}</h3>
                <div className="card-footer-row">
                  <div className="price-tag">
                    <span className="currency">UGX</span>
                    <span className="amount">{product.base_price?.toLocaleString()}</span>
                  </div>
                  <button className="view-details-btn" onClick={() => openDrawer('VIEW', product)}>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>
        ))}
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
                    <div className="detail-box highlight">
                       <label>Market Listing Price</label>
                       <p className="price">UGX {selectedProduct?.base_price.toLocaleString()}</p>
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
                    <label>Base Selling Price (UGX)</label>
                    <div className="input-wrapper">
                      <DollarSign size={18} className="field-icon" />
                      <input 
                        type="number" 
                        value={formData.basePrice} 
                        onChange={e => setFormData({...formData, basePrice: e.target.value})} 
                      />
                    </div>
                  </div>
                  <div className="pricing-calculator-card">
                    <div className="calc-row"><span>Base Price</span><span>UGX {parseFloat(formData.basePrice || 0).toLocaleString()}</span></div>
                    <div className="calc-row"><span>Platform Fee (5%)</span><span>UGX {((formData.basePrice || 0) * 0.05).toLocaleString()}</span></div>
                    <div className="calc-row total"><span>Listing Price</span><span className="final-price">UGX {parseFloat(listingPrice).toLocaleString()}</span></div>
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
                <button className="btn-secondary-expert" onClick={() => setStep(step - 1)}>
                  <ArrowLeft size={18} /> Previous
                </button>
              )}
              <button 
                className="btn-primary-expert" 
                onClick={() => step < 3 ? setStep(step + 1) : handlePublish()}
              >
                {step === 3 ? 'Publish Listing' : 'Continue'} <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductList;
