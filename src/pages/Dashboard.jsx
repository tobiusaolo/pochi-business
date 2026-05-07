import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, BarChart3, Settings, LogOut, Clock, ShieldCheck, AlertCircle, FileCheck, HelpCircle, CreditCard, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';
import pochiLogo from '../assets/logo.png';

const Dashboard = () => {
  const { business, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) return <div className="loader">Loading Portal...</div>;

  if (!business) {
    navigate('/login');
    return null;
  }

  const isApproved = business.status === 'APPROVED';

  // Extract first letter for fallback logo
  const businessInitial = business.name ? business.name.charAt(0).toUpperCase() : 'B';

  return (
    <div className="dashboard-layout">
      <aside className="sidebar">
        <div className="sidebar-brand-pod">
          <div className="business-logo-wrap">
            {business.logo_b64 ? (
              <img src={business.logo_b64} alt={business.name} className="business-sidebar-icon" />
            ) : (
              <div className="business-initial-logo">{businessInitial}</div>
            )}
          </div>
          <div className="brand-text-simple">
            POCHI <span>Business</span>
          </div>
        </div>
        
        <div className="sidebar-sections">
            <div className="sidebar-group">
                <label className="group-label">Core</label>
                <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                    <BarChart3 size={20} /> Dashboard
                </Link>
            </div>

            <div className="sidebar-group">
                <label className="group-label">Sales & Products</label>
                <Link to="/dashboard/products" className={`nav-item ${location.pathname.includes('products') ? 'active' : ''}`}>
                    <Package size={20} /> My Products
                </Link>
                <Link to="/dashboard/categories" className={`nav-item ${location.pathname.includes('categories') ? 'active' : ''}`}>
                    <Layers size={20} /> Categories
                </Link>
                <Link to="/dashboard/orders" className={`nav-item ${location.pathname.includes('orders') ? 'active' : ''}`}>
                    <ShoppingCart size={20} /> Orders
                </Link>
            </div>

            <div className="sidebar-group bottom-group">
                <label className="group-label">Account & Trust</label>
                <Link to="/dashboard/kyc" className={`nav-item ${location.pathname.includes('kyc') ? 'active' : ''} ${!isApproved ? 'highlight' : ''}`}>
                    <FileCheck size={20} /> Verification
                </Link>
                <Link to="/dashboard/settings" className={`nav-item ${location.pathname.includes('settings') ? 'active' : ''}`}>
                    <Settings size={20} /> Business Settings
                </Link>
            </div>
        </div>

        <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }}>
          <LogOut size={20} /> Logout
        </button>
      </aside>
      
      <main className="main-content">
        <header className="top-bar">
          <div className="top-bar-left">
            {!isApproved && (
                <div className="alert-banner warning animate-fade">
                    <AlertCircle size={18} /> 
                    <span>Account Not Verified - Your products are hidden from the marketplace.</span>
                </div>
            )}
          </div>
          <div className="user-info">
            <strong>{business.name}</strong>
            <span className={`status-tag ${business.status.toLowerCase()}`}>
              {business.status.replace('_', ' ')}
            </span>
          </div>
        </header>
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
