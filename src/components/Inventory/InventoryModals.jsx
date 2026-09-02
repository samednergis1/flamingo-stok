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
    if (result.success) onClose();
    else setError(result.message);
  };

  return (
    <ModalShell title="Kategori Ekle" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Kategori Adı" value={name} onChange={setName} placeholder="Örn: Protein Bar" />
        {error && <div className="toast-error">{error}</div>}
        <ModalActions onClose={onClose} submitLabel="Ekle" disabled={!name.trim()} />
      </form>
    </ModalShell>
  );
}

export function AddProductModal({ categoryName, onClose, onConfirm }) {
  const [name, setName] = useState('');
  const [stock, setStock] = useState('0');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = onConfirm({ name, stock });
    if (result.success) onClose();
    else setError(result.message);
  };

  return (
    <ModalShell title={`Ürün Ekle — ${categoryName}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Ürün Adı" value={name} onChange={setName} placeholder="Örn: Grenade Bar" />
        <Field label="Başlangıç Stoku" value={stock} onChange={setStock} type="number" min="0" />
        {error && <div className="toast-error">{error}</div>}
        <ModalActions onClose={onClose} submitLabel="Ekle" disabled={!name.trim()} />
      </form>
    </ModalShell>
  );
}

export function AddVarietyModal({ productName, onClose, onConfirm }) {
  const [name, setName] = useState('');
  const [stock, setStock] = useState('0');
  const [price, setPrice] = useState('');
  const [cost, setCost] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = onConfirm({ name, stock, price, cost });
    if (result.success) onClose();
    else setError(result.message);
  };

  return (
    <ModalShell title={`Yeni Çeşit Ekle — ${productName}`} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="Çeşit Adı" value={name} onChange={setName} placeholder="Örn: Oreo" />
        <Field label="Stok Adedi" value={stock} onChange={setStock} type="number" min="0" />
        <Field label="Satış Fiyatı (₺)" value={price} onChange={setPrice} type="number" min="0" step="0.01" optional />
        <Field label="Maliyet (₺)" value={cost} onChange={setCost} type="number" min="0" step="0.01" optional />
        {error && <div className="toast-error">{error}</div>}
        <ModalActions onClose={onClose} submitLabel="Ekle" disabled={!name.trim()} />
      </form>
    </ModalShell>
  );
}

export function EditVarietyModal({
  variety,
  category,
  product,
  categories,
  onClose,
  onConfirm,
  onToggleActive,
}) {
  const [name, setName] = useState(variety.name);
  const [stock, setStock] = useState(String(variety.stock));
  const [price, setPrice] = useState(variety.price != null ? String(variety.price) : '');
  const [cost, setCost] = useState(variety.cost != null ? String(variety.cost) : '');
  const [categoryId, setCategoryId] = useState(category.id);
  const [productId, setProductId] = useState(product.id);
  const [error, setError] = useState('');

  const canMove = variety.custom;
  const targetCategory = categories.find((c) => c.id === categoryId);
  const productOptions = targetCategory?.products || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = onConfirm({ name, stock, price, cost, categoryId, productId });
    if (result.success) onClose();
    else setError(result.message);
  };

  return (
    <ModalShell title="Çeşit Düzenle" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <Field label="Çeşit Adı" value={name} onChange={setName} placeholder="Çeşit adı" />

        {canMove ? (
          <>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-zinc-400">
                Kategori
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  const cat = categories.find((c) => c.id === e.target.value);
                  setProductId(cat?.products[0]?.id ?? '');
                }}
                className="input-field"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-zinc-400">
                Ürün
              </label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="input-field"
              >
                {productOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : (
          <>
            <ReadonlyField label="Kategori" value={category.name} />
            <ReadonlyField label="Ürün" value={product.name} />
          </>
        )}

        <Field label="Stok Adedi" value={stock} onChange={setStock} type="number" min="0" />
        <Field label="Satış Fiyatı (₺)" value={price} onChange={setPrice} type="number" min="0" step="0.01" optional />
        <Field label="Maliyet (₺)" value={cost} onChange={setCost} type="number" min="0" step="0.01" optional />

        <div className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-slate-800/60">
          <span className="text-sm dark:text-zinc-200">
            {variety.active === false ? 'Pasif' : 'Aktif'}
          </span>
          <button
            type="button"
            onClick={() => onToggleActive(variety.active === false)}
            className="btn-secondary px-3 py-1.5 text-xs"
          >
            {variety.active === false ? 'Aktif Yap' : 'Pasif Yap'}
          </button>
        </div>

        {error && <div className="toast-error">{error}</div>}
        <ModalActions onClose={onClose} submitLabel="Kaydet" disabled={!name.trim()} />
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
      <input value={value} onChange={(e) => onChange(e.target.value)} className="input-field" {...props} />
    </div>
  );
}

function ReadonlyField({ label, value }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-zinc-400">{label}</label>
      <p className="rounded-xl bg-gray-50 px-3 py-2.5 text-sm dark:bg-slate-800 dark:text-zinc-300">{value}</p>
    </div>
  );
}

function ModalActions({ onClose, submitLabel, disabled, submitClassName = 'btn-primary' }) {
  return (
    <div className="flex gap-2 pt-1">
      <button type="button" onClick={onClose} className="btn-secondary flex-1">
        İptal
      </button>
      <button type="submit" className={`${submitClassName} flex-1`} disabled={disabled}>
        {submitLabel}
      </button>
    </div>
  );
}

export function ConfirmDeleteModal({ title, message, onClose, onConfirm }) {
  return (
    <ModalShell title={title} onClose={onClose}>
      <p className="text-sm leading-relaxed text-gray-600 dark:text-zinc-300">{message}</p>
      <div className="mt-5 flex gap-2">
        <button type="button" onClick={onClose} className="btn-secondary flex-1">
          İptal
        </button>
        <button type="button" onClick={onConfirm} className="btn-danger flex-1">
          Sil
        </button>
      </div>
    </ModalShell>
  );
}

// Geriye dönük uyumluluk
export const AddVariationModal = AddVarietyModal;
export const EditVariationModal = EditVarietyModal;
