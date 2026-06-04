import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
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

import Swal from 'sweetalert2';
import { WebSocketProvider, useWebSocket } from './context/WebSocketContext';

const WebSocketListener = () => {
  const { subscribe } = useWebSocket();
  const { refreshBusiness } = useAuth();

  useEffect(() => {
    // 1. Listen for new orders
    const unsubNewOrder = subscribe('ORDER_NEW', (order) => {
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `🎉 New Order Received!`,
        text: `You have received a new order totaling UGX ${Number(order.total).toLocaleString()}!`,
        showConfirmButton: false,
        timer: 6000,
        timerProgressBar: true,
        background: '#0b182a',
        color: '#fff',
      });
      window.dispatchEvent(new CustomEvent('poch-biz-order-new', { detail: order }));
    });

    // 2. Listen for KYC status change (Business Approved / Rejected / Suspended)
    const unsubKYC = subscribe('KYC_STATUS_CHANGED', (kyc) => {
      refreshBusiness();
      Swal.fire({
        icon: kyc.status === 'APPROVED' ? 'success' : 'warning',
        title: `KYC Status Updated: ${kyc.status}`,
        text: kyc.status === 'APPROVED' 
          ? `Congratulations! Your business "${kyc.business_name}" has been fully APPROVED. You can now list products and receive payouts!`
          : `Your business "${kyc.business_name}" status was updated to: ${kyc.status}.`,
        confirmButtonColor: '#FF7F50',
      });
      window.dispatchEvent(new CustomEvent('poch-biz-kyc-changed', { detail: kyc }));
    });

    // 3. Listen for completed disbursements
    const unsubDisb = subscribe('DISBURSEMENT_COMPLETED', (disb) => {
      refreshBusiness();
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `💸 Payout Sent!`,
        text: `Admin has sent a payout of UGX ${Number(disb.amount).toLocaleString()} to your account!`,
        showConfirmButton: false,
        timer: 6000,
        timerProgressBar: true,
        background: '#0b182a',
        color: '#fff',
      });
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
    <AuthProvider>
      <WebSocketWrapper>
        <Router>
          <WebSocketListener />
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
            </Route>
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </WebSocketWrapper>
    </AuthProvider>
  );
}

export default App;
