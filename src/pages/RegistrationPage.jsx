import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Mail, Lock, User, Building, MapPin, Globe, Phone, ArrowRight, Loader2 } from 'lucide-react';
import './LoginPage.css';
import logo from '../assets/logo.png';

const RegistrationPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    business_name: '',
    physical_address: '',
    city: '',
    country: 'Uganda',
    trading_currency: 'UGX',
    contact_phone: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post('http://146.190.202.220/api/v1/auth/business/register', formData);
      
      Swal.fire({
        icon: 'success',
        title: 'Registration Successful!',
        text: 'Your business account has been created. Please sign in to continue.',
        confirmButtonColor: '#ff7e47'
      });

      navigate('/login');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: err.response?.data?.detail || 'Something went wrong. Please try again.',
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
          <h1>Start Your <span>Journey</span> Today</h1>
          <p>Register your business and start selling to a global audience in minutes with POCHI.</p>
          <div className="visual-stats">
            <div className="stat-item">
              <h3>Secure</h3>
              <span>Encrypted Payments</span>
            </div>
            <div className="stat-item">
              <h3>Fast</h3>
              <span>Quick Onboarding</span>
            </div>
          </div>
        </div>
        <div className="visual-overlay"></div>
      </div>

      <div className="auth-form-container">
        <div className="auth-card animate-slide-up" style={{maxWidth: '550px'}}>
          <div className="auth-header">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px' }}>
                <div style={{ background: '#0b182a', padding: '14px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                    <img src={logo} alt="Pochi" style={{ height: '36px', width: 'auto' }} />
                </div>
            </div>
            <div className="brand-logo">POCHI</div>
            <h2>Register Business</h2>
            <p>Tell us about you and your business.</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div className="form-input-group">
                    <label>Full Name</label>
                    <div className="input-wrapper">
                        <User className="input-icon" size={18} />
                        <input 
                            type="text" 
                            placeholder="Owner Name"
                            value={formData.full_name} 
                            onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                            required 
                        />
                    </div>
                </div>
                <div className="form-input-group">
                    <label>Email Address</label>
                    <div className="input-wrapper">
                        <Mail className="input-icon" size={18} />
                        <input 
                            type="email" 
                            placeholder="Email"
                            value={formData.email} 
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required 
                        />
                    </div>
                </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div className="form-input-group">
                    <label>Business Name</label>
                    <div className="input-wrapper">
                        <Building className="input-icon" size={18} />
                        <input 
                            type="text" 
                            placeholder="Legal Name"
                            value={formData.business_name} 
                            onChange={(e) => setFormData({...formData, business_name: e.target.value})}
                            required 
                        />
                    </div>
                </div>
                <div className="form-input-group">
                    <label>Contact Phone</label>
                    <div className="input-wrapper">
                        <Phone className="input-icon" size={18} />
                        <input 
                            type="text" 
                            placeholder="+256..."
                            value={formData.contact_phone} 
                            onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                            required 
                        />
                    </div>
                </div>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px'}}>
                <div className="form-input-group">
                    <label>Physical Address</label>
                    <div className="input-wrapper">
                        <MapPin className="input-icon" size={18} />
                        <input 
                            type="text" 
                            placeholder="Street / Office"
                            value={formData.physical_address} 
                            onChange={(e) => setFormData({...formData, physical_address: e.target.value})}
                            required 
                        />
                    </div>
                </div>
                <div className="form-input-group">
                    <label>City</label>
                    <div className="input-wrapper">
                        <Globe className="input-icon" size={18} />
                        <input 
                            type="text" 
                            placeholder="City"
                            value={formData.city} 
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            required 
                        />
                    </div>
                </div>
            </div>

            <div className="form-input-group">
              <label>Security PIN (Login Password)</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input 
                  type="password" 
                  placeholder="Set your password"
                  value={formData.password} 
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required 
                />
              </div>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <><Loader2 className="animate-spin" size={20} /> Creating Account...</>
              ) : (
                <>Register Business <ArrowRight size={20} /></>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>Already registered? <Link to="/login">Sign In</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
