import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Upload, FileText, Landmark, CreditCard, Trash2,
  ScrollText, Download, FileCheck, Info
} from 'lucide-react';
import axios from 'axios';
import { API_BASE } from '../config/api';
import './KYCPage.css';
import { alertSuccess, alertError, alertWarning } from '../utils/swal';
import {
  KYC_ACCEPT,
  KYC_FORMAT_HINT,
  validateKycFileClient,
  getKycFileTypeLabel,
} from '../utils/kycUpload';

const TEMPLATE_URL = '/pochi-cancellation-refund-policy-template.html';
const MAX_FILE_SIZE_MB = 5;
const MAX_TOTAL_SIZE_MB = 25;

const KYCPage = () => {
  const { business, refreshBusiness } = useAuth();
  const [files, setFiles] = useState({
    logo: null,
    license: null,
    certificate: null,
    idFront: null,
    idBack: null,
    refundPolicy: null,
  });
  const [previews, setPreviews] = useState({
    logo: null,
    license: null,
    certificate: null,
    idFront: null,
    idBack: null,
    refundPolicy: null,
  });
  const [refundPolicyType, setRefundPolicyType] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!business) return;
    setPreviews((prev) => ({
      ...prev,
      logo: business.logo_b64 || null,
      license: business.license_b64 || null,
      certificate: business.certificate_b64 || null,
      idFront: business.owner_id_front_b64 || null,
      idBack: business.owner_id_back_b64 || null,
      refundPolicy: business.refund_policy_b64 || null,
    }));
    if (business.refund_policy_type) {
      setRefundPolicyType(business.refund_policy_type);
    }
  }, [business]);

  const handleFileChange = (e) => {
    const name = e.target.name;
    const file = e.target.files[0];
    if (!file) return;

    const error = validateKycFileClient(file, MAX_FILE_SIZE_MB);
    if (error) {
      alertWarning('Invalid file', error);
      e.target.value = '';
      return;
    }

    setFiles({ ...files, [name]: file });
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviews((prev) => ({ ...prev, [name]: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const removeFile = (name) => {
    setFiles({ ...files, [name]: null });
    setPreviews({ ...previews, [name]: null });
  };

  const selectPolicyType = (type) => {
    if (refundPolicyType === type) return;
    if (refundPolicyType) {
      setFiles((prev) => ({ ...prev, refundPolicy: null }));
      setPreviews((prev) => ({ ...prev, refundPolicy: null }));
    }
    setRefundPolicyType(type);
  };

  const renderFilePreview = (name) => {
    const docLabel = getKycFileTypeLabel(previews[name]);
    return (
      <div className="preview-container">
        {previews[name].startsWith('data:image') ? (
          <img src={previews[name]} alt="Preview" className="file-preview-img" />
        ) : (
          <div className="pdf-preview-stub">
            <FileText size={48} color="#6495ed" />
            <span>{docLabel} Document</span>
          </div>
        )}
        <div className="preview-overlay">
          <button type="button" className="remove-btn" onClick={() => removeFile(name)}>
            <Trash2 size={18} /> Remove
          </button>
        </div>
      </div>
    );
  };

  const renderUploadZone = (name, hint = 'Click to upload') => (
    !previews[name] ? (
      <div className="file-input-wrapper">
        <Upload size={32} color="#94A3B8" />
        <span>{hint}</span>
        <span className="kyc-format-hint">{KYC_FORMAT_HINT}</span>
        <input
          type="file"
          name={name}
          onChange={handleFileChange}
          accept={KYC_ACCEPT}
        />
      </div>
    ) : (
      renderFilePreview(name)
    )
  );

  const renderUploadCard = (name, label, Icon) => (
    <div className="upload-card">
      <div className="card-header-icon">
        <Icon size={20} color="var(--primary)" />
        <label>{label}</label>
      </div>
      {renderUploadZone(name)}
    </div>
  );

  const renderPolicyChoiceCard = (type, label, description, Icon) => {
    const isActive = refundPolicyType === type;
    const showUpload = isActive;

    return (
      <div
        className={`upload-card policy-choice-card ${isActive ? 'policy-choice-card--active' : ''}`}
        onClick={() => selectPolicyType(type)}
        onKeyDown={(e) => e.key === 'Enter' && selectPolicyType(type)}
        role="button"
        tabIndex={0}
      >
        <div className="card-header-icon">
          <Icon size={20} color="var(--primary)" />
          <label>{label}</label>
          <span className={`policy-choice-indicator ${isActive ? 'active' : ''}`} aria-hidden />
        </div>

        <p className="policy-choice-desc">{description}</p>

        {type === 'signed_template' && isActive && (
          <a
            href={TEMPLATE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="policy-template-link"
            onClick={(e) => e.stopPropagation()}
          >
            <Download size={18} color="var(--primary)" />
            <span>Download Pochi template</span>
          </a>
        )}

        <div className="policy-choice-upload" onClick={(e) => e.stopPropagation()}>
          {showUpload ? (
            renderUploadZone(
              'refundPolicy',
              type === 'own' ? 'Click to upload your policy' : 'Upload signed template'
            )
          ) : (
            <div className="policy-upload-placeholder">
              <FileCheck size={28} color="#CBD5E1" />
              <span>Select this option to upload</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!refundPolicyType) {
      alertWarning(
        'Policy option required',
        'Please choose whether you are uploading your own policy or a signed Pochi template.'
      );
      return;
    }

    if (!files.refundPolicy && !previews.refundPolicy) {
      alertWarning(
        'Policy document required',
        `Please upload your Cancellation and Refund policy (${KYC_FORMAT_HINT}).`
      );
      return;
    }

    setLoading(true);
    try {
      const uploadEntries = [
        { key: 'logo', file: files.logo },
        { key: 'license', file: files.license },
        { key: 'certificate', file: files.certificate },
        { key: 'owner_id_front', file: files.idFront },
        { key: 'owner_id_back', file: files.idBack },
        { key: 'refund_policy', file: files.refundPolicy },
      ];
      const totalSizeBytes = uploadEntries.reduce((sum, entry) => sum + (entry.file?.size || 0), 0);
      const maxFileSizeBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
      const maxTotalSizeBytes = MAX_TOTAL_SIZE_MB * 1024 * 1024;

      const oversized = uploadEntries.find((entry) => entry.file && entry.file.size > maxFileSizeBytes);
      if (oversized) {
        throw new Error(`${oversized.file.name} is larger than ${MAX_FILE_SIZE_MB}MB.`);
      }
      if (totalSizeBytes > maxTotalSizeBytes) {
        throw new Error(`Total upload size exceeds ${MAX_TOTAL_SIZE_MB}MB.`);
      }

      const formData = new FormData();
      uploadEntries.forEach(({ key, file }) => {
        if (file) formData.append(key, file);
      });
      formData.append('refund_policy_type', refundPolicyType);

      const token = localStorage.getItem('token');
      await axios.patch(`${API_BASE}/business/kyc`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      await refreshBusiness();

      alertSuccess(
        'Documents Submitted',
        'Your business verification is being processed. We will notify you once approved.',
        { showConfirmButton: true, timer: undefined }
      );
    } catch (err) {
      alertError(
        'Upload Failed',
        err.response?.data?.detail || err.message || 'Failed to upload KYC documents. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kyc-container animate-fade">
      <div className="kyc-header">
        <h1>Business Verification</h1>
        <p>Complete your KYC to activate your products on the marketplace.</p>
        <div className="kyc-global-format-banner">
          <Info size={16} />
          <span>
            <strong>Accepted documents:</strong> {KYC_FORMAT_HINT}. Images should be clear and readable.
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="kyc-card-grid">
          {renderUploadCard('logo', 'Business Logo', Upload)}
          {renderUploadCard('license', 'Trade License', FileText)}
          {renderUploadCard('certificate', 'Incorporation Certificate', Landmark)}
          {renderUploadCard('idFront', 'Owner ID (Front)', CreditCard)}
          {renderUploadCard('idBack', 'Owner ID (Back)', CreditCard)}
        </div>

        <div className="kyc-section-block">
          <div className="kyc-section-heading">
            <div className="kyc-section-heading-icon">
              <ScrollText size={22} color="var(--primary)" />
            </div>
            <div>
              <h2>Cancellation &amp; Refund Policy</h2>
              <p>
                Upload your cancellation and refund policy, or download our template, sign it, and upload the signed copy.
                Same file types apply: {KYC_FORMAT_HINT}.
              </p>
            </div>
          </div>

          <div className="kyc-card-grid">
            {renderPolicyChoiceCard(
              'own',
              'My Own Policy',
              'Upload your existing cancellation and refund terms as JPEG, PNG, PDF, or DOCX.',
              FileText
            )}
            {renderPolicyChoiceCard(
              'signed_template',
              'Pochi Signed Template',
              'Download the Pochi template, sign it, then upload the signed file (PDF, DOCX, or a clear photo/scan).',
              ScrollText
            )}
          </div>
        </div>

        <div className="kyc-submit-bar glass">
          <p className="submit-info">
            Ensure all documents are clearly visible and valid. Use {KYC_FORMAT_HINT} for every upload.
          </p>
          <button type="submit" className="btn-primary-large" disabled={loading}>
            {loading ? 'Processing...' : 'Submit Verification'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default KYCPage;
