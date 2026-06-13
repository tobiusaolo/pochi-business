import React, { useState } from 'react';
import { API_BASE } from '../config/api';
import { useOrders } from '../hooks/queries';
import { 
  ShoppingCart, Clock, CheckCircle, Truck, AlertCircle, 
  ChevronRight, X, User, Calendar, DollarSign, Package, Eye,
  BarChart3, ArrowUpRight, TrendingUp, TrendingDown, Search,
  ChevronLeft, Filter, Info
} from 'lucide-react';
import './Orders.css';

const Orders = () => {
  const { data: orders = [] } = useOrders();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsDrawerOpen(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING': return <Clock size={16} />;
      case 'PAID': return <CheckCircle size={16} />;
      case 'FULFILLED': return <Truck size={16} />;
      case 'CANCELLED': return <X size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const filteredOrders = orders.filter(order => {
    const orderDate = new Date(order.created_at);
    const matchesSearch = 
      order.id?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      order.user_id?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStart = startDate ? orderDate >= new Date(startDate) : true;
    const matchesEnd = endDate ? orderDate <= new Date(endDate + 'T23:59:59') : true;

    return matchesSearch && matchesStart && matchesEnd;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const totalRevenue = filteredOrders
    .filter(o => o.status === 'PAID' || o.status === 'FULFILLED')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const pendingOrdersCount = filteredOrders.filter(o => o.status === 'PENDING').length;
  const cancelledOrdersCount = filteredOrders.filter(o => o.status === 'CANCELLED').length;



  return (
    <div className="orders-container animate-fade">
      <div className="page-header-refined">
        <div className="title-group">
          <h1>Orders & Fulfillment</h1>
          <p>Analyzing {filteredOrders.length} transaction records.</p>
        </div>
      </div>

      <div className="stats-grid-compact">
        <div className="stat-card-refined glass">
          <div className="icon emerald"><TrendingUp size={20} /></div>
          <div className="info">
            <span className="lbl">View Revenue</span>
            <span className="val">UGX {totalRevenue.toLocaleString()}</span>
          </div>
        </div>
        <div className="stat-card-refined glass">
          <div className="icon amber"><Clock size={20} /></div>
          <div className="info">
            <span className="lbl">Pending</span>
            <span className="val">{pendingOrdersCount}</span>
          </div>
        </div>
        <div className="stat-card-refined glass">
          <div className="icon rose"><AlertCircle size={20} /></div>
          <div className="info">
            <span className="lbl">Cancelled</span>
            <span className="val">{cancelledOrdersCount}</span>
          </div>
        </div>
      </div>

      <div className="inventory-controls glass">
        <div className="search-box-refined">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search Order ID or Customer..." 
            value={searchTerm}
            onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
          />
        </div>
        <div className="date-filter-group">
          <div className="date-input-wrapper">
             <Calendar size={16} />
             <input type="date" value={startDate} onChange={(e) => {setStartDate(e.target.value); setCurrentPage(1);}} />
          </div>
          <span className="date-separator">to</span>
          <div className="date-input-wrapper">
             <Calendar size={16} />
             <input type="date" value={endDate} onChange={(e) => {setEndDate(e.target.value); setCurrentPage(1);}} />
          </div>
          {(startDate || endDate || searchTerm) && (
            <button className="clear-filters-btn" onClick={() => {setStartDate(''); setEndDate(''); setSearchTerm('');}}>Reset</button>
          )}
        </div>
      </div>

      <div className="orders-table-wrapper glass animate-fade">
        <table className="orders-table-refined">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.length === 0 ? (
              <tr><td colSpan="6" className="empty-row">No records found.</td></tr>
            ) : (
              currentOrders.map(order => (
                <tr key={order.id} onClick={() => openOrderDetails(order)} className="clickable-row">
                  <td><span className="order-id-txt">#{order.id?.toString().slice(0, 8)}</span></td>
                  <td>
                    <div className="customer-cell-content">
                       <div className="cust-avatar"><User size={14} /></div>
                       <span>{order.user_id?.toString().slice(0, 8) || 'Unknown'}</span>
                    </div>
                  </td>
                  <td><span className="date-txt">{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}</span></td>
                  <td>
                    <div className="amt-cell-content">
                       <span className="amt-val">{order.total?.toLocaleString()}</span>
                       <span className="amt-cur">{order.currency || 'UGX'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`order-status-badge ${order.status.toLowerCase()}`}>
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button className="view-details-btn-mini" onClick={(e) => {e.stopPropagation(); openOrderDetails(order);}}>
                       <Eye size={16} /> Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="pagination-bar">
             <div className="pagination-info">Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredOrders.length)} of {filteredOrders.length}</div>
             <div className="pagination-btns">
                <button disabled={currentPage === 1} onClick={() => paginate(currentPage - 1)} className="p-btn"><ChevronLeft size={18} /></button>
                {[...Array(totalPages)].map((_, i) => (
                  <button key={i+1} onClick={() => paginate(i+1)} className={`p-btn ${currentPage === i+1 ? 'active' : ''}`}>{i+1}</button>
                ))}
                <button disabled={currentPage === totalPages} onClick={() => paginate(currentPage + 1)} className="p-btn"><ChevronRight size={18} /></button>
             </div>
          </div>
        )}
      </div>

      {/* Expert Drawer */}
      <div className={`expert-drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}>
        <div className="expert-drawer" onClick={e => e.stopPropagation()}>
           <div className="drawer-nav">
              <div className="nav-header">
                <div className="icon-badge"><ShoppingCart size={24} /></div>
                <div className="text">
                  <h2>Order Details</h2>
                  <p>#{selectedOrder?.id?.toString().slice(0, 8)}</p>
                </div>
              </div>
              <button className="drawer-close-btn" onClick={() => setIsDrawerOpen(false)}><X /></button>
           </div>

           <div className="drawer-main">
              {selectedOrder && (
                <div className="order-details-panel animate-fade">
                   <div className="details-section glass">
                      <div className="section-title"><Info size={16} /> Summary Information</div>
                      <div className="info-grid">
                         <div className="info-item">
                            <label>Status</label>
                            <span className={`status-tag-big ${selectedOrder.status.toLowerCase()}`}>
                               {selectedOrder.status}
                            </span>
                         </div>
                         <div className="info-item">
                            <label>Order Date</label>
                            <span className="val">{new Date(selectedOrder.created_at).toLocaleString()}</span>
                         </div>
                         <div className="info-item">
                            <label>Customer ID</label>
                            <span className="val">{selectedOrder.user_id}</span>
                         </div>
                      </div>
                   </div>

                   <div className="details-section glass">
                      <div className="section-title"><Package size={16} /> Order Items</div>
                      <div className="order-items-list">
                         {selectedOrder.items?.map((item, idx) => (
                           <div key={idx} className="order-item-row">
                              <div className="item-main">
                                 <div className="item-icon"><Package size={14} /></div>
                                 <div className="item-text">
                                    <strong>{item.sku}</strong>
                                    <span>Quantity: {item.quantity}</span>
                                 </div>
                              </div>
                              <div className="item-price">UGX {(item.unit_price * item.quantity).toLocaleString()}</div>
                           </div>
                         ))}
                      </div>
                      <div className="order-total-footer">
                         <span>Grand Total</span>
                         <span className="total-val">UGX {selectedOrder.total?.toLocaleString()}</span>
                      </div>
                   </div>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default Orders;
