import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, ShoppingBag, DollarSign, Activity, Package, Plus, CreditCard, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBusinessStats } from '../hooks/queries';
import './Analytics.css';

const Analytics = () => {
  const { data: stats } = useBusinessStats();

  const basic = stats?.basic_stats || {};
  const totalRevenue = basic.total_revenue || 0;
  const totalOrders = basic.total_orders || 0;
  const activeProducts = basic.active_products || 0;
  const avgOrderValue = useMemo(
    () => (totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0),
    [totalRevenue, totalOrders]
  );

  return (
    <div className="analytics-container animate-fade">
      <div className="page-header">
        <h1>Performance Analytics</h1>
        <p>Real-time insights into your business growth.</p>
      </div>
      
      <div className="quick-actions-section">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <Link to="/dashboard/products" className="action-card glass">
            <div className="action-icon add"><Plus size={20} /></div>
            <div className="action-label">
              <strong>Add Product</strong>
              <span>List a new item</span>
            </div>
            <ChevronRight size={18} className="arrow" />
          </Link>

          <Link to="/dashboard/orders" className="action-card glass">
            <div className="action-icon view"><ShoppingBag size={20} /></div>
            <div className="action-label">
              <strong>View Orders</strong>
              <span>Manage sales</span>
            </div>
            <ChevronRight size={18} className="arrow" />
          </Link>

          <Link to="/dashboard/payments" className="action-card glass">
            <div className="action-icon pay"><CreditCard size={20} /></div>
            <div className="action-label">
              <strong>View Payments</strong>
              <span>Track earnings</span>
            </div>
            <ChevronRight size={18} className="arrow" />
          </Link>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass">
          <div className="stat-icon primary"><DollarSign size={24} /></div>
          <div className="stat-info">
            <span className="lbl">Total Revenue</span>
            <span className="val">UGX {totalRevenue.toLocaleString()}</span>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon emerald"><ShoppingBag size={24} /></div>
          <div className="stat-info">
            <span className="lbl">Total Orders</span>
            <span className="val">{totalOrders}</span>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon amber"><Package size={24} /></div>
          <div className="stat-info">
            <span className="lbl">Active Products</span>
            <span className="val">{activeProducts}</span>
          </div>
        </div>
        <div className="stat-card glass">
          <div className="stat-icon indigo"><TrendingUp size={24} /></div>
          <div className="stat-info">
            <span className="lbl">Avg Order Value</span>
            <span className="val">UGX {avgOrderValue.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="insights-section">
        <div className="insights-section-header">
          <div className="insights-title-wrap">
            <div className="insights-title-icon"><Activity size={20} /></div>
            <h2>Business Insights</h2>
          </div>
        </div>
        <div className="insights-grid">
          <div className="insight-card glass">
            <div className="insight-icon indigo"><BarChart3 size={22} /></div>
            <div className="insight-body">
              <h3>Order Trends</h3>
              <p className="insight-metric">{totalOrders.toLocaleString()}</p>
              <p className="insight-caption">
                {totalOrders === 1 ? 'order processed' : 'orders processed'} to date on Pochi
              </p>
            </div>
          </div>
          <div className="insight-card glass">
            <div className="insight-icon emerald"><Package size={22} /></div>
            <div className="insight-body">
              <h3>Inventory Status</h3>
              <p className="insight-metric">{activeProducts.toLocaleString()}</p>
              <p className="insight-caption">
                {activeProducts === 1 ? 'product currently live' : 'products currently live'} on Pochi
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
