import React, { useState } from 'react';
import axios from 'axios';
import { useQueryClient } from '@tanstack/react-query';
import { API_BASE } from '../config/api';
import { useCategories } from '../hooks/queries';
import { queryKeys } from '../lib/queryKeys';
import {
  Search,
  Layers,
  Package,
  Tag,
  Grid,
  Plus,
  Edit3,
  Trash2,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { alertSuccess, alertError, alertWarning, confirmDelete } from '../utils/swal';
import './CategoriesPage.css';

const CHANNELS = ['RETAIL', 'WHOLESALE', 'BOTH'];
const EMPTY_FORM = { name: '', description: '', channel: 'BOTH' };

const isPlatformCategory = (cat) => cat.business_id == null;

const channelLabel = (channel) => {
  if (channel === 'RETAIL') return 'Retail';
  if (channel === 'WHOLESALE') return 'Wholesale';
  return 'Retail & Wholesale';
};

const CategoriesPage = () => {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading, isError, error, refetch } = useCategories();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  const token = () => localStorage.getItem('token');
  const headers = () => ({ Authorization: `Bearer ${token()}` });

  const refreshCategories = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.categories });

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (cat) => {
    if (isPlatformCategory(cat)) {
      alertWarning('Platform category', 'Platform categories are managed by admin and cannot be edited here.');
      return;
    }
    setForm({
      name: cat.name,
      description: cat.description || '',
      channel: cat.channel || 'BOTH',
    });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      alertWarning('Name required', 'Enter a category name.');
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await axios.patch(`${API_BASE}/categories/${editingId}`, form, { headers: headers() });
      } else {
        await axios.post(`${API_BASE}/categories/`, form, { headers: headers() });
      }
      await refreshCategories();
      resetForm();
      alertSuccess(editingId ? 'Category updated' : 'Category created');
    } catch (err) {
      alertError('Error', err.response?.data?.detail || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (isPlatformCategory(cat)) {
      alertWarning('Platform category', 'Platform categories are managed by admin and cannot be deleted.');
      return;
    }
    const result = await confirmDelete({
      title: 'Delete category?',
      text: `"${cat.name}" will be removed. Products using it must be reassigned first.`,
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE}/categories/${cat.id}`, { headers: headers() });
      await refreshCategories();
      if (editingId === cat.id) resetForm();
      alertSuccess('Category deleted');
    } catch (err) {
      alertError('Error', err.response?.data?.detail || 'Failed to delete category');
    }
  };

  const platformCategories = categories.filter(isPlatformCategory);
  const ownCategories = categories.filter((c) => !isPlatformCategory(c));

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="categories-container animate-fade">
      <div className="page-header-refined">
        <div className="title-group">
          <h1>Product Categories</h1>
          <p>Platform categories from admin plus your own store categories for organizing products.</p>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-add-category" onClick={openCreate}>
            <span className="icon-box">
              <Plus size={18} />
            </span>
            Add Category
          </button>
          <button type="button" className="btn-secondary-expert" onClick={() => navigate('/dashboard/products')}>
            <Package size={18} /> Products
          </button>
        </div>
      </div>

      {showForm && (
        <div className="category-modal-overlay" onClick={resetForm} role="presentation">
          <form
            onSubmit={handleSubmit}
            className="category-modal glass"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="category-modal-header">
              <h3>{editingId ? 'Edit category' : 'New category'}</h3>
              <button type="button" className="action-dot" onClick={resetForm} aria-label="Close">
                <X size={18} />
              </button>
            </div>
            <div className="category-form-grid">
              <div className="form-field form-field-wide">
                <label htmlFor="cat-name">Name</label>
                <input
                  id="cat-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Electronics"
                  required
                  autoFocus
                />
              </div>
              <div className="form-field form-field-wide">
                <label htmlFor="cat-channel">Channel</label>
                <select
                  id="cat-channel"
                  value={form.channel}
                  onChange={(e) => setForm({ ...form, channel: e.target.value })}
                >
                  {CHANNELS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field form-field-wide">
                <label htmlFor="cat-desc">Description</label>
                <input
                  id="cat-desc"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Optional short description"
                />
              </div>
            </div>
            <div className="category-form-actions">
              <button type="button" className="btn-secondary-expert" onClick={resetForm}>
                Cancel
              </button>
              <button type="submit" className="btn-add-category" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Save changes' : 'Create category'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="inventory-controls glass">
        <div className="search-box-refined">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <span className="cat-count-label">
          {platformCategories.length} platform · {ownCategories.length} yours
        </span>
      </div>

      {isLoading ? (
        <div className="empty-inventory glass">
          <p>Loading categories...</p>
        </div>
      ) : isError ? (
        <div className="empty-inventory glass">
          <div className="empty-icon"><Layers size={64} /></div>
          <h2>Could not load categories</h2>
          <p>{error?.response?.data?.detail || error?.message || 'Check your connection and try again.'}</p>
          <button type="button" className="btn-add-category" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="empty-inventory glass">
          <div className="empty-icon">
            <Layers size={64} />
          </div>
          <h2>{searchTerm ? 'No categories found' : 'No categories yet'}</h2>
          <p>{searchTerm ? 'Try a different search term.' : 'Add your first category to start organizing products.'}</p>
        </div>
      ) : (
        <div className="categories-grid">
          {filteredCategories.map((cat) => {
            const platform = isPlatformCategory(cat);
            return (
            <div key={cat.id} className={`category-card glass animate-fade${platform ? ' platform-category' : ''}`}>
              <div className="card-top">
                <div className="cat-icon-box">
                  <Grid size={24} />
                </div>
                {platform ? (
                  <span className="platform-badge">Platform</span>
                ) : (
                <div className="cat-actions-menu">
                  <button type="button" className="action-circle" onClick={() => openEdit(cat)} title="Edit">
                    <Edit3 size={16} />
                  </button>
                  <button
                    type="button"
                    className="action-circle danger"
                    onClick={() => handleDelete(cat)}
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                )}
              </div>
              <div className="card-body">
                <h3>{cat.name}</h3>
                <p>{cat.description || 'No description provided.'}</p>
              </div>
              <div className="card-footer">
                <div className="product-count">
                  <Tag size={14} />
                  <span>{channelLabel(cat.channel || 'BOTH')}</span>
                </div>
              </div>
            </div>
          );})}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
