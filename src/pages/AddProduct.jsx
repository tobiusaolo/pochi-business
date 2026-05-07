import React, { useState } from 'react';
import axios from 'axios';
import { Package, Tag, DollarSign, Info, Plus } from 'lucide-react';
import './AddProduct.css';

const AddProduct = () => {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    basePrice: '',
    categoryId: ''
  });

  const PLATFORM_FEE_PERCENT = 0.05;
  const listingPrice = formData.basePrice ? (parseFloat(formData.basePrice) * (1 + PLATFORM_FEE_PERCENT)).toFixed(2) : '0.00';

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = {
        sku: formData.sku,
        name: formData.name,
        description: formData.description,
        base_price: parseFloat(formData.basePrice),
        listing_price: parseFloat(listingPrice),
        category_id: formData.categoryId || null
      };

      await axios.post('http://146.190.202.220/api/v1/products/', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Product published successfully!');
      window.location.href = '/dashboard/products';
    } catch (err) {
      alert('Failed to publish product: ' + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="add-product-container animate-fade">
      <div className="page-header">
        <h1>Add New Product</h1>
        <p>List a new item on the Pakacha marketplace.</p>
      </div>

      <div className="form-card">
        <div className="section-title">
          <Package size={20} color="var(--primary)" />
          Basic Information
        </div>

        <form className="form-grid">
          <div className="form-group full-width">
            <label>Product Name</label>
            <input 
              name="name" 
              placeholder="e.g. Premium Arabica Coffee Beans"
              value={formData.name} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label>SKU (Stock Keeping Unit)</label>
            <input 
              name="sku" 
              placeholder="COF-ARB-001"
              value={formData.sku} 
              onChange={handleChange} 
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select name="categoryId" value={formData.categoryId} onChange={handleChange}>
              <option value="">Select Category</option>
              <option value="1">Coffee & Tea</option>
              <option value="2">Handicrafts</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label>Description</label>
            <textarea 
              name="description" 
              rows="4"
              placeholder="Tell your customers about this product..."
              value={formData.description} 
              onChange={handleChange} 
            ></textarea>
          </div>

          <div className="form-group">
            <label>Base Price (Your Revenue)</label>
            <div className="price-input-wrapper">
              <input 
                type="number" 
                name="basePrice" 
                placeholder="0.00"
                value={formData.basePrice} 
                onChange={handleChange} 
              />
            </div>
          </div>

          <div className="form-group">
            <label>Price Calculation</label>
            <div className="price-calculation-card">
              <div className="calc-row">
                <span>Base Price</span>
                <span>{formData.basePrice || '0.00'} UGX</span>
              </div>
              <div className="calc-row">
                <span>Platform Fee (5%)</span>
                <span>{(formData.basePrice * PLATFORM_FEE_PERCENT).toFixed(2)} UGX</span>
              </div>
              <div className="calc-row total">
                <span>Listing Price</span>
                <span>{listingPrice} UGX</span>
              </div>
            </div>
          </div>
        </form>

        <div className="form-actions">
          <button type="button" className="btn-secondary">Save Draft</button>
          <button type="button" className="btn-primary-large" onClick={handleSubmit}>
            <Plus size={18} /> Publish Product
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
