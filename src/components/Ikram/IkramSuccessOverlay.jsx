export default function IkramSuccessOverlay({ total, onClose }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="İkram tamamlandı"
    >
      <div
        className="sale-overlay-card animate-fade-in-up w-full max-w-sm rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-2xl dark:border-amber-500/20 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 text-5xl dark:bg-amber-400/15">
          🎁
        </div>
        <h2 className="text-3xl font-bold text-amber-600 dark:text-amber-400">İkram Kaydedildi</h2>
        <p className="mt-3 text-lg text-gray-600 dark:text-zinc-300">
          <span className="text-4xl font-bold text-amber-600 dark:text-amber-400">{total}</span>
          <span className="ml-2">ürün ikram edildi</span>
        </p>
        <p className="mt-2 text-sm font-medium text-amber-700 dark:text-amber-400">
          Ücretsiz — satış gelirine dahil değil
        </p>
        <p className="mt-4 text-sm text-gray-400">Stok otomatik güncellendi</p>
        <button type="button" onClick={onClose} className="btn-primary mt-6 w-full py-3">
          Tamam
        </button>
      </div>
    </div>
  );
}
