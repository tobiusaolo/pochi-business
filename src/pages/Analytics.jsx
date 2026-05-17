import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, TrendingUp, ShoppingBag, DollarSign, Activity, Package, Plus, CreditCard, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Analytics.css';

const Analytics = () => {
  const [stats, setStats] = useState(() => {
    try {
      const cached = localStorage.getItem('cache_business_stats');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.basic_stats) return parsed;
      }
    } catch {}
    return null;
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('https://pakacha.com/api/v1/admin/business/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
        localStorage.setItem('cache_business_stats', JSON.stringify(res.data));
      } catch (err) {
        console.error('Failed to fetch analytics');
      }
    };
    fetchStats();
  }, []);



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
            <h2 className="val">{(stats?.basic_stats?.total_revenue || 0).toLocaleString()} UGX</h2>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon indigo"><ShoppingBag size={24} /></div>
          <div className="stat-info">
            <span className="lbl">Total Orders</span>
            <h2 className="val">{stats?.basic_stats?.total_orders || 0}</h2>
          </div>
        </div>

        <div className="stat-card glass">
          <div className="stat-icon emerald"><Package size={24} /></div>
          <div className="stat-info">
            <span className="lbl">Active Products</span>
            <h2 className="val">{stats?.basic_stats?.active_products || 0}</h2>
          </div>
        </div>
      </div>

      <div className="analytics-main-grid">
        <div className="data-card glass">
          <div className="card-header">
            <h3><TrendingUp size={20} /> Top Performing Products</h3>
          </div>
          <div className="card-body">
            {(!stats?.top_products || stats.top_products.length === 0) ? (
                <p className="empty-msg">No sales data yet.</p>
            ) : (
                <div className="top-prods-list">
                    {stats.top_products.map(prod => (
                        <div key={prod.sku} className="prod-item">
                            <div className="prod-meta">
                                <strong>{prod.name}</strong>
                                <span>{prod.sku}</span>
                            </div>
                            <div className="prod-vals">
                                <strong>{prod.total_sold} Sold</strong>
                                <span>{(prod.revenue_generated || 0).toLocaleString()} UGX</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>

        <div className="data-card glass">
          <div className="card-header">
            <h3><Activity size={20} /> Recent Activity</h3>
          </div>
          <div className="card-body">
            {(!stats?.recent_activity || stats.recent_activity.length === 0) ? (
                <p className="empty-msg">No recent activity.</p>
            ) : (
                <div className="activity-timeline">
                    {stats.recent_activity.map((act, idx) => (
                        <div key={idx} className="activity-item">
                            <div className="activity-dot"></div>
                            <div className="activity-info">
                                <strong>{act.event}</strong>
                                <span>Order #{act.id?.slice(0, 8) || '...'} - {(act.amount || 0).toLocaleString()} UGX</span>
                                <small>{act.time ? new Date(act.time).toLocaleString() : 'Just now'}</small>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
