import { useState } from 'react';

function ModalShell({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-white/5 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold dark:text-zinc-100">{title}</h3>
          <button type="button" onClick={onClose} className="btn-ghost px-2 py-1 text-lg">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function AddCategoryModal({ onClose, onConfirm }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = onConfirm(name);
    if (result.success) {
      onClose();
    } else {
      setError(result.message);
    }
  };

  return (
    <ModalShell title="Kategori Ekle" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-zinc-400">
            Kategori Adı
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Örn: Özel Ürünler"
            className="input-field"
            autoFocus
          />
        </div>
        {error && <div className="toast-error">{error}</div>}
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            İptal
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={!name.trim()}>
            Ekle
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export function AddVariationModal({ categoryName, onClose, onConfirm }) {
  const [name, setName] = useState('');
  const [stock, setStock] = useState('0');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = onConfirm({ name, stock, price, cost });
    if (result.success) {
      onClose();
    } else {
      setError(result.message);
    }
  };

  return (
    <ModalShell title={`Çeşit Ekle — ${categoryName}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="Ürün Adı" value={name} onChange={setName} placeholder="Ürün adı" />
        <Field label="Stok Adedi" value={stock} onChange={setStock} type="number" min="0" />
        <Field label="Satış Fiyatı (₺)" value={price} onChange={setPrice} type="number" min="0" step="0.01" optional />
        <Field label="Maliyet (₺)" value={cost} onChange={setCost} type="number" min="0" step="0.01" optional />
        {error && <div className="toast-error">{error}</div>}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            İptal
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={!name.trim()}>
            Ekle
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export function EditVariationModal({ variation, category, categories, onClose, onConfirm }) {
  const [name, setName] = useState(variation.name);
  const [stock, setStock] = useState(String(variation.stock));
  const [price, setPrice] = useState(variation.price != null ? String(variation.price) : '');
  const [cost, setCost] = useState(variation.cost != null ? String(variation.cost) : '');
  const [categoryId, setCategoryId] = useState(category.id);
  const [error, setError] = useState('');

  const canMoveCategory = variation.id.startsWith('custom-var-');

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = onConfirm({
      name,
      stock,
      price,
      cost,
      categoryId,
    });
    if (result.success) {
      onClose();
    } else {
      setError(result.message);
    }
  };

  return (
    <ModalShell title="Ürün Düzenle" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="Ürün Adı" value={name} onChange={setName} placeholder="Ürün adı" />
        {canMoveCategory ? (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-zinc-400">
              Kategori
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input-field"
            >
              {categories
                .filter((c) => c.custom)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-zinc-400">
              Kategori
            </label>
            <p className="rounded-xl bg-gray-50 px-3 py-2.5 text-sm dark:bg-slate-800 dark:text-zinc-300">
              {category.name}
            </p>
          </div>
        )}
        <Field label="Stok Adedi" value={stock} onChange={setStock} type="number" min="0" />
        <Field label="Satış Fiyatı (₺)" value={price} onChange={setPrice} type="number" min="0" step="0.01" optional />
        <Field label="Maliyet (₺)" value={cost} onChange={setCost} type="number" min="0" step="0.01" optional />
        {error && <div className="toast-error">{error}</div>}
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-secondary flex-1">
            İptal
          </button>
          <button type="submit" className="btn-primary flex-1" disabled={!name.trim()}>
            Kaydet
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function Field({ label, value, onChange, optional, ...props }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-zinc-400">
        {label}
        {optional && <span className="text-gray-400"> (opsiyonel)</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="input-field"
        {...props}
      />
    </div>
  );
}
