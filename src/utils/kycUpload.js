export const KYC_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,application/pdf,.pdf,.jpg,.jpeg,.png,.webp,' +
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,' +
  'application/msword,.doc';

export const KYC_FORMAT_HINT = 'JPEG, PNG, PDF, or DOCX · max 5MB per file';

export const KYC_ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.pdf',
  '.doc',
  '.docx',
];

export const isAllowedKycFile = (file) => {
  if (!file?.name) return false;
  const dot = file.name.lastIndexOf('.');
  if (dot < 0) return false;
  const ext = file.name.slice(dot).toLowerCase();
  return KYC_ALLOWED_EXTENSIONS.includes(ext);
};

export const getKycFileTypeLabel = (dataUrlOrMime) => {
  if (!dataUrlOrMime) return 'Document';
  const value = String(dataUrlOrMime).toLowerCase();
  if (value.startsWith('data:image')) return null;
  if (value.includes('pdf')) return 'PDF';
  if (value.includes('wordprocessingml') || value.includes('msword') || value.includes('.doc')) {
    return 'Word (DOCX)';
  }
  return 'Document';
};

export const validateKycFileClient = (file, maxMb = 5) => {
  if (!isAllowedKycFile(file)) {
    return `Unsupported file type. Please use ${KYC_FORMAT_HINT}.`;
  }
  if (file.size > maxMb * 1024 * 1024) {
    return `File is larger than ${maxMb}MB.`;
  }
  return null;
};
