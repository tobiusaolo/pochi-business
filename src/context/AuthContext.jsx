import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBusiness = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const res = await axios.get('http://pakacha.com/api/v1/business/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBusiness(res.data);
    } catch (err) {
      console.error('Auth Error:', err.response?.data?.detail || err.message);
      if (err.response?.status === 403) {
        // Token likely invalid or expired
        logout();
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchBusiness().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Polling logic when business is in KYC_SUBMITTED status
  useEffect(() => {
    let interval;
    if (business && business.status === 'KYC_SUBMITTED') {
      interval = setInterval(fetchBusiness, 5000); // Poll every 5s
    }
    return () => clearInterval(interval);
  }, [business?.status]);

  const login = (token) => {
    localStorage.setItem('token', token);
    fetchBusiness();
  };

  const logout = () => {
    localStorage.removeItem('token');
    setBusiness(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, business, loading, login, logout, refreshBusiness: fetchBusiness }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
