import { useEffect } from 'react';

export default function SaleSuccessOverlay({ total, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className="sale-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-label="Satış tamamlandı"
    >
      <div
        className="sale-overlay-card animate-fade-in-up w-full max-w-sm rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-2xl dark:border-white/5 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-green-100 text-5xl dark:bg-green-900/40">
          ✓
        </div>
        <h2 className="text-3xl font-bold text-green-600 dark:text-green-400">
          Satış Tamamlandı!
        </h2>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
          <span className="text-4xl font-bold accent-text">{total}</span>
          <span className="ml-2">ürün satıldı</span>
        </p>
        <p className="mt-4 text-sm text-gray-400">Stok otomatik güncellendi</p>
        <button type="button" onClick={onClose} className="btn-primary mt-6 w-full py-3.5 text-base">
          Tamam
        </button>
      </div>
    </div>
  );
}
