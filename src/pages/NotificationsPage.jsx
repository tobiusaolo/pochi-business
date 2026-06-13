import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { 
  Bell, Check, Eye, EyeOff, Loader2, ShoppingBag, CheckSquare, ShieldCheck, Edit3, Info, Trash2, X, ArrowRight
} from 'lucide-react';
import { api } from '../lib/api';
import { useNotifications } from '../hooks/queries';
import { queryKeys } from '../lib/queryKeys';
import { alertSuccess } from '../utils/swal';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: notifications = [], isFetching } = useNotifications();
  
  const [filter, setFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const updateNotifications = (updater) => {
    queryClient.setQueryData(queryKeys.notifications, (current = []) => updater(current));
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      updateNotifications((items) =>
        items.map((notif) => (notif.id === id ? { ...notif, is_read: true } : notif))
      );
      if (selectedNotification?.id === id) {
        setSelectedNotification((prev) => ({ ...prev, is_read: true }));
      }
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await api.post('/notifications/read-all');
      updateNotifications((items) => items.map((notif) => ({ ...notif, is_read: true })));
      alertSuccess('All Cleared', 'All your notifications have been marked as read.');
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const handleCardClick = (notif) => {
    setSelectedNotification(notif);
    setDrawerOpen(true);
    if (!notif.is_read) {
      handleMarkAsRead(notif.id);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ORDER_NEW':
        return <ShoppingBag className="icon-order-new" size={20} />;
      case 'ORDER_STATUS':
        return <CheckSquare className="icon-order-status" size={20} />;
      case 'KYC_STATUS':
        return <ShieldCheck className="icon-kyc-status" size={20} />;
      case 'PROFILE_CHANGE':
        return <Edit3 className="icon-profile-change" size={20} />;
      default:
        return <Info className="icon-default" size={20} />;
    }
  };

  const getNotificationColorClass = (type) => {
    switch (type) {
      case 'ORDER_NEW': return 'card-order-new';
      case 'ORDER_STATUS': return 'card-order-status';
      case 'KYC_STATUS': return 'card-kyc-status';
      case 'PROFILE_CHANGE': return 'card-profile-change';
      default: return 'card-default';
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.is_read;
    if (filter === 'read') return notif.is_read;
    return true;
  });

  const unreadCount = notifications.filter(notif => !notif.is_read).length;

  return (
    <div className="notifications-portal-container animate-fade">
      <div className="portal-header">
        <div className="title-section">
          <h1>Corporate Notifications</h1>
          <p>Stay up to date with real-time merchant alerts, order events, and system compliance logs.</p>
        </div>
        {unreadCount > 0 && (
          <button className="btn-mark-all-read" onClick={handleMarkAllAsRead}>
            <Check size={16} /> Mark All as Read
          </button>
        )}
      </div>

      <div className="portal-sub-bar glass">
        <div className="filter-buttons">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`} 
            onClick={() => setFilter('all')}
          >
            All Alerts ({notifications.length})
          </button>
          <button 
            className={`filter-tab ${filter === 'unread' ? 'active' : ''}`} 
            onClick={() => setFilter('unread')}
          >
            Unread ({unreadCount})
          </button>
          <button 
            className={`filter-tab ${filter === 'read' ? 'active' : ''}`} 
            onClick={() => setFilter('read')}
          >
            Read ({notifications.length - unreadCount})
          </button>
        </div>
        
        <div className="revalidate-spinner-wrapper">
          {isFetching && <Loader2 size={16} className="animate-spin text-muted" />}
        </div>
      </div>

      <div className="notifications-list">
        {filteredNotifications.length === 0 ? (
          <div className="empty-notifications glass animate-fade">
            <Bell size={48} className="empty-bell-icon" />
            <h3>No Notifications Found</h3>
            <p>You are all caught up! When new orders are received or profile updates take place, they will display instantly here.</p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div 
              key={notif.id} 
              className={`notification-card glass ${getNotificationColorClass(notif.type)} ${notif.is_read ? 'read-card' : 'unread-card'} animate-fade`}
              onClick={() => handleCardClick(notif)}
            >
              <div className="card-left">
                <div className="icon-container-wrapper">
                  {getNotificationIcon(notif.type)}
                </div>
                <div className="notification-details">
                  <div className="details-header">
                    <h4>{notif.title}</h4>
                    <span className="notif-time">
                      {new Date(notif.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p>{notif.message}</p>
                </div>
              </div>

              <div className="card-right">
                {!notif.is_read ? (
                  <>
                    <span className="unread-pulse-dot"></span>
                    <button 
                      className="btn-action-read" 
                      title="Mark as Read" 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notif.id);
                      }}
                    >
                      <Check size={16} />
                    </button>
                  </>
                ) : (
                  <span className="read-checkmark-icon" title="Read Alert"><Check size={16} /></span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Slide-out Detail Drawer */}
      {selectedNotification && (
        <div className={`drawer-overlay ${drawerOpen ? 'open' : ''}`} onClick={() => { setDrawerOpen(false); setTimeout(() => setSelectedNotification(null), 300); }}>
          <div className={`detail-drawer glass ${drawerOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-header">
              <h3>Notification Details</h3>
              <button className="btn-close-drawer" onClick={() => { setDrawerOpen(false); setTimeout(() => setSelectedNotification(null), 300); }}>
                <X size={20} />
              </button>
            </div>
            
            <div className="drawer-body">
              <div className={`drawer-icon-hero ${getNotificationColorClass(selectedNotification.type)}`}>
                {getNotificationIcon(selectedNotification.type)}
              </div>
              
              <h2 className="drawer-title">{selectedNotification.title}</h2>
              
              <div className="drawer-meta">
                <span className={`status-badge-tag ${selectedNotification.is_read ? 'read' : 'unread'}`}>
                  {selectedNotification.is_read ? 'Read' : 'Unread'}
                </span>
                <span className="drawer-time">
                  {new Date(selectedNotification.created_at).toLocaleString([], { hour: '2-digit', minute: '2-digit', month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              
              <div className="drawer-divider"></div>
              
              <p className="drawer-message">{selectedNotification.message}</p>
              
              <div className="drawer-actions-block">
                {selectedNotification.type === 'ORDER_NEW' || selectedNotification.type === 'ORDER_STATUS' ? (
                  <button className="btn-drawer-action" onClick={() => { setDrawerOpen(false); setTimeout(() => navigate('/dashboard/orders'), 300); }}>
                    View Merchant Orders <ArrowRight size={16} />
                  </button>
                ) : selectedNotification.type === 'KYC_STATUS' ? (
                  <button className="btn-drawer-action" onClick={() => { setDrawerOpen(false); setTimeout(() => navigate('/dashboard/kyc'), 300); }}>
                    View Compliance Verification <ArrowRight size={16} />
                  </button>
                ) : selectedNotification.type === 'PROFILE_CHANGE' ? (
                  <button className="btn-drawer-action" onClick={() => { setDrawerOpen(false); setTimeout(() => navigate('/dashboard/settings'), 300); }}>
                    View Business Settings <ArrowRight size={16} />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
