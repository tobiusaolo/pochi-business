import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, X, Search, Layers, Edit3, Trash2, ChevronRight, 
  Package, Info, Tag, ArrowRight, Grid, MoreVertical, Calendar,
  Eye, Save
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './CategoriesPage.css';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState('ADD'); // ADD, EDIT, VIEW
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({ name: '', description: '' });
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    const handleClickOutside = () => setMenuOpenId(null);
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
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = (mode, category = null) => {
    setDrawerMode(mode);
    setSelectedCategory(category);
    if (category) {
      setFormData({ name: category.name, description: category.description || '' });
    } else {
      setFormData({ name: '', description: '' });
    }
    setIsDrawerOpen(true);
    setMenuOpenId(null);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (drawerMode === 'EDIT') {
        await axios.patch(`http://pakacha.com/api/v1/categories/${selectedCategory.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://pakacha.com/api/v1/categories/', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      Swal.fire({
        icon: 'success',
        title: drawerMode === 'EDIT' ? 'Category Updated' : 'Category Created',
        timer: 1500,
        showConfirmButton: false
      });

      setIsDrawerOpen(false);
      fetchCategories();
    } catch (err) {
      Swal.fire('Error', 'Operation failed', 'error');
    }
  };

  const handleDeleteCategory = async (id) => {
    setMenuOpenId(null);
    const result = await Swal.fire({
      title: 'Delete Category?',
      text: "Products in this category might be affected.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://pakacha.com/api/v1/categories/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        Swal.fire('Deleted!', 'Category removed.', 'success');
        fetchCategories();
      } catch (err) {
        Swal.fire('Error', 'Could not delete category.', 'error');
      }
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const toggleMenu = (e, id) => {
    e.stopPropagation();
    setMenuOpenId(menuOpenId === id ? null : id);
  };

  if (loading) return <div className="loader">Loading Categories...</div>;

  return (
    <div className="categories-container animate-fade">
      <div className="page-header-refined">
        <div className="title-group">
          <h1>Product Categories</h1>
          <p>Organize your products into meaningful groups.</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary-expert" onClick={() => navigate('/dashboard/products')}>
             <Package size={18} /> Products
          </button>
          <button className="btn-add-category" onClick={() => openDrawer('ADD')}>
            <div className="icon-box"><Plus size={20} /></div>
            <span>New Category</span>
          </button>
        </div>
      </div>

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
      </div>

      <div className="categories-grid">
        {filteredCategories.length === 0 ? (
          <div className="empty-inventory glass">
            <div className="empty-icon"><Layers size={64} /></div>
            <h2>No categories found</h2>
          </div>
        ) : (
          filteredCategories.map(cat => (
            <div key={cat.id} className="category-card glass animate-fade">
              <div className="card-top">
                <div className="cat-icon-box">
                  <Grid size={24} />
                </div>
                
                {/* Category Menu */}
                <div className="card-menu-container">
                   <button className="menu-trigger-btn" onClick={(e) => toggleMenu(e, cat.id)}>
                      <MoreVertical size={18} />
                   </button>
                   {menuOpenId === cat.id && (
                     <div className="card-dropdown glass animate-slide-up" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openDrawer('VIEW', cat)}>
                           <Eye size={16} /> View Details
                        </button>
                        <button onClick={() => openDrawer('EDIT', cat)}>
                           <Edit3 size={16} /> Edit Category
                        </button>
                        <hr />
                        <button className="danger" onClick={() => handleDeleteCategory(cat.id)}>
                           <Trash2 size={16} /> Delete
                        </button>
                     </div>
                   )}
                </div>
              </div>
              <div className="card-body">
                <h3>{cat.name}</h3>
                <p>{cat.description || 'No description provided.'}</p>
              </div>
              <div className="card-footer">
                <div className="product-count">
                   <Package size={14} />
                   <span>{cat.business_id ? 'Private' : 'Global'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Expert Drawer for Categories */}
      <div className={`expert-drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}>
        <div className="expert-drawer" onClick={e => e.stopPropagation()}>
           <div className="drawer-nav">
              <div className="nav-header">
                <div className="icon-badge">
                  {drawerMode === 'VIEW' ? <Eye size={24} /> : drawerMode === 'EDIT' ? <Edit3 size={24} /> : <Plus size={24} />}
                </div>
                <div className="text">
                  <h2>{drawerMode === 'VIEW' ? 'Category Details' : drawerMode === 'EDIT' ? 'Edit Category' : 'New Category'}</h2>
                  <p>{drawerMode === 'VIEW' ? 'View-only mode' : 'Catalog organization'}</p>
                </div>
              </div>
              <button className="drawer-close-btn" onClick={() => setIsDrawerOpen(false)}><X /></button>
           </div>

           <div className="drawer-main">
              {drawerMode === 'VIEW' ? (
                <div className="view-panel animate-fade">
                   <div className="view-header-visual glass">
                      <Grid size={48} className="cat-visual-icon" />
                      <h3>{selectedCategory?.name}</h3>
                   </div>
                   <div className="view-details-list">
                      <div className="detail-item">
                        <label><Info size={14} /> Description</label>
                        <p>{selectedCategory?.description || 'No description provided.'}</p>
                      </div>
                      <div className="detail-item">
                        <label><Tag size={14} /> Type</label>
                        <p>{selectedCategory?.business_id ? 'Private Business Category' : 'Platform Global Category'}</p>
                      </div>
                   </div>
                   <div className="view-footer">
                      <button className="btn-primary-expert" onClick={() => setDrawerMode('EDIT')}>
                         Modify Category <Edit3 size={18} />
                      </button>
                   </div>
                </div>
              ) : (
                <form onSubmit={handleSaveCategory} className="expert-form p-40">
                    <div className="form-field">
                      <label>Category Name</label>
                      <div className="input-wrapper">
                        <Tag size={18} className="field-icon" />
                        <input 
                          value={formData.name} 
                          onChange={e => setFormData({...formData, name: e.target.value})} 
                          placeholder="e.g. Organic Coffee"
                          required 
                        />
                      </div>
                    </div>
                    <div className="form-field">
                      <label>Description</label>
                      <div className="input-wrapper">
                        <Info size={18} className="field-icon" style={{top: '16px'}} />
                        <textarea 
                          value={formData.description} 
                          onChange={e => setFormData({...formData, description: e.target.value})} 
                          placeholder="Describe the products in this category..."
                          rows="6"
                          style={{paddingLeft: '48px'}}
                        />
                      </div>
                    </div>
                    <div className="panel-footer">
                      <button type="submit" className="btn-primary-expert">
                         {drawerMode === 'EDIT' ? 'Update Category' : 'Save Category'} <Save size={18} />
                      </button>
                    </div>
                </form>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesPage;
