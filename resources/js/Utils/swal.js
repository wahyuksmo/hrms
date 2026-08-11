import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

// Custom Styled SweetAlert2 Instance
export const customSwal = Swal.mixin({
  customClass: {
    popup: 'rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.15)] border border-slate-200/80 p-7 font-sans bg-white/95 backdrop-blur-xl',
    title: 'text-xl font-black text-slate-900 tracking-tight',
    htmlContainer: 'text-sm font-semibold text-slate-600 mt-2 leading-relaxed',
    confirmButton: 'px-6 py-3 rounded-2xl font-extrabold text-xs text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 active:scale-95 transition-all shadow-md shadow-brand-600/30 mx-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500/50',
    cancelButton: 'px-6 py-3 rounded-2xl font-extrabold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all mx-1.5 focus:outline-none focus:ring-2 focus:ring-slate-300',
    denyButton: 'px-6 py-3 rounded-2xl font-extrabold text-xs text-white bg-amber-600 hover:bg-amber-700 active:scale-95 transition-all mx-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400',
    icon: 'border-2 scale-90'
  },
  buttonsStyling: false
});

/**
 * Toast notification popup (top-end floating card)
 */
export const showToast = ({ icon = 'success', title = 'Berhasil', timer = 3500 }) => {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: timer,
    timerProgressBar: true,
    customClass: {
      popup: 'rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.1)] border border-slate-200/80 p-4 font-sans bg-white/95 backdrop-blur-xl flex items-center gap-3 animate-in slide-in-from-right duration-300',
      title: 'text-xs font-black text-slate-800 tracking-tight',
    },
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer);
      toast.addEventListener('mouseleave', Swal.resumeTimer);
    }
  });

  return Toast.fire({
    icon,
    title
  });
};

/**
 * Standard Success Alert Dialog
 */
export const showSuccess = (title = 'Berhasil!', text = 'Operasi berhasil dilakukan.') => {
  return customSwal.fire({
    icon: 'success',
    title,
    text,
    confirmButtonText: 'Selesai',
    iconColor: '#10B981',
  });
};

/**
 * Standard Error Alert Dialog
 */
export const showError = (title = 'Terjadi Kesalahan!', text = 'Gagal memproses permintaan Anda.') => {
  return customSwal.fire({
    icon: 'error',
    title,
    text,
    confirmButtonText: 'Tutup',
    iconColor: '#EF4444',
  });
};

/**
 * Universal Confirmation Modal
 */
export const showConfirm = ({
  title = 'Konfirmasi Tindakan',
  text = 'Apakah Anda yakin ingin melanjutkan tindakan ini?',
  icon = 'warning',
  confirmText = 'Ya, Lanjutkan',
  cancelText = 'Batal',
  confirmButtonColor = 'brand',
  onConfirm
}) => {
  let confirmBtnClass = 'px-6 py-3 rounded-2xl font-extrabold text-xs text-white bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 active:scale-95 transition-all shadow-md shadow-brand-600/30 mx-1.5';
  
  if (confirmButtonColor === 'emerald') {
    confirmBtnClass = 'px-6 py-3 rounded-2xl font-extrabold text-xs text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 active:scale-95 transition-all shadow-md shadow-emerald-600/30 mx-1.5';
  } else if (confirmButtonColor === 'rose' || confirmButtonColor === 'danger') {
    confirmBtnClass = 'px-6 py-3 rounded-2xl font-extrabold text-xs text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 active:scale-95 transition-all shadow-md shadow-rose-600/30 mx-1.5';
  }

  return customSwal.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    customClass: {
      popup: 'rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.15)] border border-slate-200/80 p-7 font-sans bg-white/95 backdrop-blur-xl',
      title: 'text-xl font-black text-slate-900 tracking-tight',
      htmlContainer: 'text-sm font-semibold text-slate-600 mt-2 leading-relaxed',
      confirmButton: confirmBtnClass,
      cancelButton: 'px-6 py-3 rounded-2xl font-extrabold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all mx-1.5',
    },
    buttonsStyling: false
  }).then((result) => {
    if (result.isConfirmed && typeof onConfirm === 'function') {
      onConfirm();
    }
    return result;
  });
};

/**
 * Delete Item Confirmation Modal
 */
export const showDeleteConfirm = (onConfirm, itemName = 'data ini') => {
  return showConfirm({
    title: 'Hapus Data?',
    text: `Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus ${itemName}?`,
    icon: 'warning',
    confirmText: 'Ya, Hapus Data',
    cancelText: 'Batal',
    confirmButtonColor: 'rose',
    onConfirm
  });
};

/**
 * Loading SweetAlert Modal
 */
export const showLoading = (title = 'Memproses Data...', text = 'Mohon tunggu sebentar') => {
  return customSwal.fire({
    title,
    text,
    allowOutsideClick: false,
    allowEscapeKey: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
};

/**
 * Close any active Swal
 */
export const closeSwal = () => {
  Swal.close();
};

export default customSwal;
