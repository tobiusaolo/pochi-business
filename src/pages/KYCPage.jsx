import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, FileText, Landmark, CreditCard, Trash2 } from 'lucide-react';
import axios from 'axios';
import './KYCPage.css';
import Swal from 'sweetalert2';

const KYCPage = () => {
  const { refreshBusiness } = useAuth();
  const [files, setFiles] = useState({
    logo: null,
    license: null,
    certificate: null,
    idFront: null,
    idBack: null
  });
  const [previews, setPreviews] = useState({
    logo: null,
    license: null,
    certificate: null,
    idFront: null,
    idBack: null
  });
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const name = e.target.name;
    const file = e.target.files[0];
    if (file) {
      setFiles({ ...files, [name]: file });
      // Generate preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => ({ ...prev, [name]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = (name) => {
    setFiles({ ...files, [name]: null });
    setPreviews({ ...previews, [name]: null });
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        logo_b64: await convertToBase64(files.logo),
        license_b64: await convertToBase64(files.license),
        certificate_b64: await convertToBase64(files.certificate),
        owner_id_front_b64: await convertToBase64(files.idFront),
        owner_id_back_b64: await convertToBase64(files.idBack),
      };

      const token = localStorage.getItem('token');
      await axios.patch('http://pakacha.com/api/v1/business/kyc', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      Swal.fire({
        icon: 'success',
        title: 'Documents Submitted!',
        text: 'Your business verification is now being processed. We will notify you once approved.',
        confirmButtonColor: '#4f46e5'
      });

      await refreshBusiness();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: err.response?.data?.detail || 'Failed to upload KYC documents. Please try again.',
        confirmButtonColor: '#ef4444'
      });
    } finally {
      setLoading(false);
    }
  };
  const renderUploadCard = (name, label, Icon) => (
    <div className="upload-card">
      <div className="card-header-icon">
        <Icon size={20} color="var(--primary)" />
        <label>{label}</label>
      </div>
      
      {!previews[name] ? (
        <div className="file-input-wrapper">
          <Upload size={32} color="#94A3B8" />
          <span>Click to upload</span>
          <input type="file" name={name} onChange={handleFileChange} accept="image/*,application/pdf" />
        </div>
      ) : (
        <div className="preview-container">
          {previews[name].startsWith('data:image') ? (
            <img src={previews[name]} alt="Preview" className="file-preview-img" />
          ) : (
            <div className="pdf-preview-stub">
              <FileText size={48} color="#6495ed" />
              <span>PDF Document</span>
            </div>
          )}
          <div className="preview-overlay">
            <button type="button" className="remove-btn" onClick={() => removeFile(name)}>
              <Trash2 size={18} /> Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="kyc-container animate-fade">
      <div className="kyc-header">
        <h1>Business Verification</h1>
        <p>Complete your KYC to activate your products on the marketplace.</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="kyc-card-grid">
          {renderUploadCard('logo', 'Business Logo', Upload)}
          {renderUploadCard('license', 'Trade License', FileText)}
          {renderUploadCard('certificate', 'Incorporation Certificate', Landmark)}
          {renderUploadCard('idFront', 'Owner ID (Front)', CreditCard)}
          {renderUploadCard('idBack', 'Owner ID (Back)', CreditCard)}
        </div>

        <div className="kyc-submit-bar glass">
          <p className="submit-info">Ensure all documents are clearly visible and valid.</p>
          <button type="submit" className="btn-primary-large" disabled={loading}>
            {loading ? 'Processing...' : 'Submit Verification'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default KYCPage;
