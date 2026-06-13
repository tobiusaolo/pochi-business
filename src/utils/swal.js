import Swal from 'sweetalert2';

const BRAND = {
  primary: '#FF7F50',
  primaryDark: '#E66A3E',
  secondary: '#0b182a',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  info: '#6366F1',
  text: '#1E293B',
  muted: '#64748B',
  surface: '#ffffff',
  border: '#E2E8F0',
};

const basePopup = {
  background: BRAND.surface,
  color: BRAND.text,
  confirmButtonColor: BRAND.primary,
  cancelButtonColor: '#94A3B8',
  buttonsStyling: false,
  customClass: {
    container: 'poch-swal-container',
    popup: 'poch-swal-popup',
    title: 'poch-swal-title',
    htmlContainer: 'poch-swal-text',
    actions: 'poch-swal-actions',
    confirmButton: 'poch-swal-btn poch-swal-btn-confirm',
    cancelButton: 'poch-swal-btn poch-swal-btn-cancel',
    denyButton: 'poch-swal-btn poch-swal-btn-cancel',
    icon: 'poch-swal-icon',
    input: 'poch-swal-input',
    validationMessage: 'poch-swal-validation',
    timerProgressBar: 'poch-swal-timer',
  },
  showClass: {
    popup: 'poch-swal-animate-in',
  },
  hideClass: {
    popup: 'poch-swal-animate-out',
  },
};

const merge = (options = {}) => ({
  ...basePopup,
  ...options,
  customClass: {
    ...basePopup.customClass,
    ...(options.customClass || {}),
  },
});

export const alertSuccess = (title, text = '', options = {}) =>
  Swal.fire(
    merge({
      icon: 'success',
      title,
      text,
      timer: options.timer ?? 2200,
      timerProgressBar: true,
      showConfirmButton: false,
      ...options,
    })
  );

export const alertError = (title, text = '', options = {}) =>
  Swal.fire(
    merge({
      icon: 'error',
      title,
      text,
      confirmButtonText: options.confirmButtonText || 'Got it',
      ...options,
    })
  );

export const alertWarning = (title, text = '', options = {}) =>
  Swal.fire(
    merge({
      icon: 'warning',
      title,
      text,
      confirmButtonText: options.confirmButtonText || 'OK',
      ...options,
    })
  );

export const alertInfo = (title, text = '', options = {}) =>
  Swal.fire(
    merge({
      icon: 'info',
      title,
      text,
      confirmButtonText: options.confirmButtonText || 'OK',
      ...options,
    })
  );

export const confirmAction = (options = {}) =>
  Swal.fire(
    merge({
      icon: 'warning',
      title: options.title || 'Are you sure?',
      text: options.text || '',
      showCancelButton: true,
      confirmButtonText: options.confirmButtonText || 'Confirm',
      cancelButtonText: options.cancelButtonText || 'Cancel',
      reverseButtons: true,
      focusCancel: true,
      ...options,
    })
  );

export const confirmDelete = (options = {}) =>
  confirmAction({
    title: options.title || 'Delete permanently?',
    text: options.text || 'This action cannot be undone.',
    confirmButtonText: options.confirmButtonText || 'Yes, delete',
    ...options,
    customClass: {
      ...basePopup.customClass,
      confirmButton: 'poch-swal-btn poch-swal-btn-danger',
      ...(options.customClass || {}),
    },
  });

export const toast = (title, text = '', options = {}) =>
  Swal.fire(
    merge({
      toast: true,
      position: 'top-end',
      icon: options.icon || 'success',
      title,
      text,
      showConfirmButton: false,
      timer: options.timer ?? 4500,
      timerProgressBar: true,
      background: BRAND.secondary,
      color: '#ffffff',
      customClass: {
        ...basePopup.customClass,
        popup: 'poch-swal-toast',
        title: 'poch-swal-toast-title',
        htmlContainer: 'poch-swal-toast-text',
        timerProgressBar: 'poch-swal-toast-timer',
      },
      ...options,
    })
  );

export const fire = (options = {}) => Swal.fire(merge(options));

export default Swal;
