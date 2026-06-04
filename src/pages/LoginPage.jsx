import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import './LoginPage.css';
import logo from '../assets/logo.png';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.post('https://pakacha.com/api/v1/auth/business/login', 
      new URLSearchParams({
        username: formData.email,
        password: formData.password
      }), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      login(response.data.access_token);
      
      Swal.fire({
        icon: 'success',
        title: 'Welcome Back!',
        text: 'Login successful. Redirecting to your dashboard...',
        timer: 1500,
        showConfirmButton: false,
        background: '#ffffff',
        iconColor: '#ff7e47'
      });

      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Login Failed',
        text: err.response?.data?.detail || 'Please check your credentials and try again.',
        confirmButtonColor: '#ff7e47'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-visual">
        <div className="visual-content">
          <h1>Grow Your Business With <span>POCHI Commerce</span></h1>
          <p>Join thousands of merchants reaching millions of customers across East Africa.</p>
          <div className="visual-stats">
            <div className="stat-item">
              <h3>10k+</h3>
              <span>Active Merchants</span>
            </div>
            <div className="stat-item">
              <h3>$2M+</h3>
              <span>Monthly Sales</span>
            </div>
          </div>
        </div>
        <div className="visual-overlay"></div>
      </div>

      <div className="auth-form-container">
        <div className="auth-card animate-slide-up">
          <div className="auth-header">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <div style={{ background: '#0b182a', padding: '14px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                    <img src={logo} alt="Pochi" style={{ height: '40px', width: 'auto' }} />
                </div>
            </div>
            <div className="brand-logo" style={{fontSize: '1.5rem', fontWeight: '800', color: '#4f46e5', marginBottom: '32px', textAlign: 'center'}}>Pochi Commerce</div>
            <h2>Sign In</h2>
            <p>Welcome back! Please enter your details.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-input-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" size={18} />
                <input 
                  type="email" 
                  placeholder="Enter your email"
                  value={formData.email} 
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required 
                />
              </div>
            </div>

            <div className="form-input-group">
              <div className="label-row">
                <label>Password</label>
                <Link to="/forgot-password">Forgot PIN?</Link>
              </div>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <><Loader2 className="animate-spin" size={20} /> Signing in...</>
              ) : (
                <>Sign In <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>New to Pochi? <Link to="/register">Create a business account</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
