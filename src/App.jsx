import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import ProductList from './pages/ProductList';
import Orders from './pages/Orders';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import KYCPage from './pages/KYCPage';
import RegistrationPage from './pages/RegistrationPage';
import LoginPage from './pages/LoginPage';
import LegalDocumentPage from './pages/LegalDocumentPage';
import CategoriesPage from './pages/CategoriesPage';
import NotificationsPage from './pages/NotificationsPage';
import Payments from './pages/Payments';
import PromotionsPage from './pages/PromotionsPage';
import CacheSync from './components/CacheSync';

import { alertSuccess, alertError, alertWarning, toast } from './utils/swal';
import { WebSocketProvider, useWebSocket } from './context/WebSocketContext';

const WebSocketListener = () => {
  const { subscribe } = useWebSocket();
  const { refreshBusiness } = useAuth();

  useEffect(() => {
    // 1. Listen for new orders
    const unsubNewOrder = subscribe('ORDER_NEW', (order) => {
      toast('New Order Received', `Order totaling UGX ${Number(order.total).toLocaleString()}`, { icon: 'success', timer: 6000 });
      window.dispatchEvent(new CustomEvent('poch-biz-order-new', { detail: order }));
    });

    // 2. Listen for KYC status change (Business Approved / Rejected / Suspended)
    const unsubKYC = subscribe('KYC_STATUS_CHANGED', (kyc) => {
      refreshBusiness();
      if (kyc.status === 'APPROVED') {
        alertSuccess(
          'KYC Approved',
          `"${kyc.business_name}" is approved. You can now list products and receive payouts.`
        );
      } else {
        alertWarning(
          `KYC Status: ${kyc.status}`,
          `"${kyc.business_name}" status was updated to ${kyc.status}.`
        );
      }
      window.dispatchEvent(new CustomEvent('poch-biz-kyc-changed', { detail: kyc }));
    });

    // 3. Listen for completed disbursements
    const unsubDisb = subscribe('DISBURSEMENT_COMPLETED', (disb) => {
      refreshBusiness();
      toast('Payout Sent', `UGX ${Number(disb.amount).toLocaleString()} sent to your account`, { timer: 6000 });
      window.dispatchEvent(new CustomEvent('poch-biz-payout-sent', { detail: disb }));
    });

    // 4. Listen for general order status changes
    const unsubStatus = subscribe('ORDER_STATUS_CHANGED', (evt) => {
      window.dispatchEvent(new CustomEvent('poch-biz-order-status-changed', { detail: evt }));
    });

    return () => {
      unsubNewOrder();
      unsubKYC();
      unsubDisb();
      unsubStatus();
    };
  }, [subscribe, refreshBusiness]);

  return null;
};

const WebSocketWrapper = ({ children }) => {
  const token = localStorage.getItem('token');
  return (
    <WebSocketProvider token={token}>
      {children}
    </WebSocketProvider>
  );
};

function App() {
  return (
    <WebSocketWrapper>
      <Router>
        <WebSocketListener />
        <CacheSync />
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/terms" element={<LegalDocumentPage />} />
            <Route path="/privacy" element={<LegalDocumentPage />} />
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<Analytics />} />
              <Route path="products" element={<ProductList />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="orders" element={<Orders />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="kyc" element={<KYCPage />} />
              <Route path="settings" element={<Settings />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="payments" element={<Payments />} />
              <Route path="promotions" element={<PromotionsPage />} />
            </Route>
            <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </WebSocketWrapper>
  );
}

export default App;
