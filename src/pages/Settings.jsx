import React from 'react';
import { Settings as SettingsIcon, User, MapPin, Phone, Mail, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

const Settings = () => {
  const { business } = useAuth();

  return (
    <div className="settings-container animate-fade">
      <div className="page-header">
        <h1>Business Settings</h1>
        <p>Manage your public profile and account security.</p>
      </div>

      <div className="settings-grid">
        <div className="settings-section glass">
          <div className="section-header">
            <User size={20} />
            <h3>General Profile</h3>
          </div>
          <div className="section-body">
            <div className="form-group">
              <label>Business Name</label>
              <input value={business?.name || ''} readOnly />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input value={business?.contact_email || ''} readOnly />
            </div>
          </div>
        </div>

        <div className="settings-section glass">
            <div className="section-header">
                <MapPin size={20} />
                <h3>Location & Contact</h3>
            </div>
            <div className="section-body">
                <div className="form-group">
                    <label>Physical Address</label>
                    <input value={business?.physical_address || ''} readOnly />
                </div>
                <div className="form-group">
                    <label>Phone Number</label>
                    <input value={business?.contact_telephone || ''} readOnly />
                </div>
            </div>
        </div>

        <div className="settings-section glass danger-zone">
            <div className="section-header">
                <Shield size={20} color="#EF4444" />
                <h3>Account Security</h3>
            </div>
            <div className="section-body">
                <p>To change your password or update sensitive business details, please contact the platform administrator.</p>
                <button className="btn-secondary">Request Changes</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
