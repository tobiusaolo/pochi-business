import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, User, MapPin, Phone, Mail, Shield, 
  CheckCircle2, AlertTriangle, X, Edit3, Save, Loader2, Building2, CreditCard, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../config/api';
import { alertSuccess, alertError } from '../utils/swal';
import './Settings.css';

const Settings = () => {
  const { business, refreshBusiness } = useAuth();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    contact_email: '',
    physical_address: '',
    contact_telephone: ''
  });

  // Keep form data in sync with business state when loaded
  useEffect(() => {
    if (business) {
      setFormData({
        name: business.name || '',
        contact_email: business.contact_email || '',
        physical_address: business.physical_address || '',
        contact_telephone: business.contact_telephone || ''
      });
    }
  }, [business]);

  const handleOpenDrawer = () => {
    if (business) {
      setFormData({
        name: business.name || '',
        contact_email: business.contact_email || '',
        physical_address: business.physical_address || '',
        contact_telephone: business.contact_telephone || ''
      });
    }
    setIsDrawerOpen(true);
  };

  const handleRequestChanges = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE}/business/change-request`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Refresh Auth Context so entire app (and localStorage cache) updates smoothly in the background
      await refreshBusiness();

      alertSuccess(
        'Changes Applied',
        'Your business profile has been updated and audit logs have been recorded.',
        { timer: 3000 }
      );

      setIsDrawerOpen(false);
    } catch (err) {
      console.error(err);
      alertError(
        'Submission Failed',
        err.response?.data?.detail || 'Could not process profile change request.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'APPROVED': return 'badge-approved';
      case 'PENDING': return 'badge-pending';
      case 'KYC_SUBMITTED': return 'badge-submitted';
      default: return 'badge-default';
    }
  };

  return (
    <div className="settings-refined-container animate-fade">
      <div className="page-header-refined">
        <div className="title-group">
          <h1>Business Account Settings</h1>
          <p>Configure credentials, public merchant parameters, and compliance details.</p>
        </div>
      </div>

      {/* Premium Business Hero Panel */}
      <div className="business-hero-card glass animate-fade">
        <div className="hero-pattern"></div>
        <div className="hero-content">
          <div className="avatar-wrapper">
            {business?.logo_b64 ? (
              <img src={business.logo_b64} alt="Business Logo" className="business-hero-logo" />
            ) : (
              <div className="business-logo-fallback">
                <Building2 size={40} />
              </div>
            )}
            <span className={`status-badge-refined ${getStatusBadgeClass(business?.status)}`}>
              {business?.status || 'PENDING'}
            </span>
          </div>

          <div className="business-meta-info">
            <h2>{business?.name || 'Your Business'}</h2>
            <div className="meta-row">
              <span className="meta-item"><Mail size={14} /> {business?.contact_email || 'No email registered'}</span>
              <span className="meta-item"><Phone size={14} /> {business?.contact_telephone || 'No phone registered'}</span>
            </div>
          </div>

          <button className="btn-modify-profile" onClick={handleOpenDrawer}>
            <Edit3 size={16} />
            <span>Modify Profile Details</span>
          </button>
        </div>
      </div>

      {/* Grid of details */}
      <div className="settings-grid-refined">
        <div className="settings-card glass">
          <div className="card-header">
            <User size={20} className="icon-blue" />
            <h3>General Business Profile</h3>
          </div>
          <div className="card-body">
            <div className="info-display-field">
              <label>Registered Entity Name</label>
              <div className="value-box">{business?.name || 'N/A'}</div>
            </div>
            <div className="info-display-field">
              <label>Official Email Address</label>
              <div className="value-box">{business?.contact_email || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div className="settings-card glass">
          <div className="card-header">
            <MapPin size={20} className="icon-emerald" />
            <h3>Location & Contacts</h3>
          </div>
          <div className="card-body">
            <div className="info-display-field">
              <label>Physical HQ Address</label>
              <div className="value-box">{business?.physical_address || 'N/A'}</div>
            </div>
            <div className="info-display-field">
              <label>Merchant Contact Phone</label>
              <div className="value-box">{business?.contact_telephone || 'N/A'}</div>
            </div>
          </div>
        </div>

        <div className="settings-card glass span-full-card payout-zone">
          <div className="card-header">
            <CreditCard size={20} className="icon-emerald" />
            <h3>Mobile Money Payout Account</h3>
          </div>
          <div className="card-body-row">
            <p>
              Configure the mobile money account where Pochi admin will disburse your earnings after every settlement cycle.
              Go to the <strong>Payments</strong> page to set up or update your MTN / Airtel payout number.
            </p>
            <button className="btn-request-change-refined" onClick={() => navigate('/dashboard/payments')}>
              <CreditCard size={16} /> Manage Payout Account <ArrowRight size={15} />
            </button>
          </div>
        </div>

        <div className="settings-card glass span-full-card warning-zone">
          <div className="card-header">
            <Shield size={22} className="icon-red" />
            <h3>Account Security & Auditing</h3>
          </div>
          <div className="card-body-row">
            <p>
              To maintain high integrity on the platform, changes to corporate parameters undergo systematic security logging. 
              Always verify all legal requirements are met before requesting updates to your business information.
            </p>
            <button className="btn-request-change-refined" onClick={handleOpenDrawer}>
               <Edit3 size={16} /> Request Changes Now
            </button>
          </div>
        </div>
      </div>

      {/* Request Changes Overlay Drawer */}
      <div className={`expert-drawer-overlay ${isDrawerOpen ? 'open' : ''}`} onClick={() => setIsDrawerOpen(false)}>
        <div className="expert-drawer" onClick={e => e.stopPropagation()}>
          <div className="drawer-nav">
            <div className="nav-header">
              <div className="icon-badge warning-badge"><Shield size={24} /></div>
              <div className="text">
                <h2>Request Profile Updates</h2>
                <p>Modify corporate business details</p>
              </div>
            </div>
            <button className="drawer-close-btn" onClick={() => setIsDrawerOpen(false)}><X /></button>
          </div>

          <div className="drawer-main">
            <form onSubmit={handleRequestChanges} className="expert-form p-40">
              <div className="disclaimer-banner">
                <AlertTriangle size={18} />
                <span>Modifying these details will create a verified security audit log.</span>
              </div>

              <div className="form-field">
                <label>Registered Business Name</label>
                <div className="input-wrapper">
                  <Building2 size={18} className="field-icon" />
                  <input 
                    type="text"
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Contact Email Address</label>
                <div className="input-wrapper">
                  <Mail size={18} className="field-icon" />
                  <input 
                    type="email"
                    value={formData.contact_email} 
                    onChange={e => setFormData({...formData, contact_email: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Merchant Contact Phone</label>
                <div className="input-wrapper">
                  <Phone size={18} className="field-icon" />
                  <input 
                    type="text"
                    value={formData.contact_telephone} 
                    onChange={e => setFormData({...formData, contact_telephone: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Physical Address</label>
                <div className="input-wrapper">
                  <MapPin size={18} className="field-icon" />
                  <input 
                    type="text"
                    value={formData.physical_address} 
                    onChange={e => setFormData({...formData, physical_address: e.target.value})} 
                    required 
                  />
                </div>
              </div>

              <div className="panel-footer">
                <button type="submit" className="btn-primary-expert" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span>Processing Request...</span>
                      <Loader2 size={18} className="animate-spin" />
                    </>
                  ) : (
                    <>
                      <span>Submit Update Request</span>
                      <Save size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
