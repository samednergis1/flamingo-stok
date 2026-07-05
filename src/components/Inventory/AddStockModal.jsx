import { useState } from 'react';

export default function AddStockModal({ categoryName, variation, onClose, onConfirm }) {
  const [amount, setAmount] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const qty = parseInt(amount, 10);
    if (qty > 0) onConfirm(qty);
  };

  const quickAmounts = [5, 10, 20, 50];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-white/5 dark:bg-slate-900">
        <h3 className="text-lg font-bold">Stok Ekle</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {categoryName} → {variation.name}
        </p>
        <p className="mt-2 text-sm">
          Mevcut stok: <span className="font-bold accent-text">{variation.stock}</span>
        </p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <input
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Miktar"
            className="input-field text-center text-2xl font-bold"
            autoFocus
          />

          <div className="flex flex-wrap gap-2">
            {quickAmounts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(String(q))}
                className="btn-secondary flex-1 min-w-[3rem] py-2 text-sm"
              >
                +{q}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              İptal
            </button>
            <button type="submit" className="btn-primary flex-1" disabled={!amount || parseInt(amount, 10) <= 0}>
              Ekle
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
