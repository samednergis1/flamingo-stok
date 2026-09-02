import { useState } from 'react';
import { getPrimaryVariety, isMultiVarietyProduct } from '../../utils/catalog';

export default function VariationGrid({ product, onAdd }) {
  const [quantities, setQuantities] = useState({});
  const varieties = product?.varieties || [];
  const multiVariety = isMultiVarietyProduct(product);

  const getQty = (id) => quantities[id] ?? '';

  const handleAddWithQty = (variety) => {
    const qty = parseInt(getQty(variety.id), 10) || 1;
    onAdd(variety, qty);
    setQuantities((prev) => ({ ...prev, [variety.id]: '' }));
  };

  if (!multiVariety) {
    const variety = getPrimaryVariety(product);
    if (!variety) {
      return (
        <div className="card py-8 text-center text-gray-400">Bu üründe aktif stok kaydı yok</div>
      );
    }

    const outOfStock = variety.stock <= 0;
    const lowStock = variety.stock <= 5 && variety.stock > 0;

    return (
      <div>
        <p className="mb-2 text-xs font-medium text-gray-500 dark:text-zinc-400">
          Adet Seç — {product.name}
        </p>
        <div className={`pos-tile flex items-center gap-3 p-3 ${outOfStock ? 'opacity-50' : ''}`}>
          <span
            className={`shrink-0 rounded-lg px-2 py-1 text-xs font-bold ${
              outOfStock
                ? 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'
                : lowStock
                  ? 'bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-zinc-300'
            }`}
          >
            Stok: {variety.stock}
          </span>
          <div className="ml-auto flex gap-1.5">
            <button
              type="button"
              onClick={() => onAdd(variety, 1)}
              disabled={outOfStock}
              className="btn-primary min-w-[4.5rem] py-3 text-lg font-bold"
            >
              +
            </button>
            <input
              type="number"
              min="1"
              max={variety.stock}
              value={getQty(variety.id)}
              onChange={(e) =>
                setQuantities((prev) => ({ ...prev, [variety.id]: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddWithQty(variety);
              }}
              placeholder="Adet"
              disabled={outOfStock}
              className="input-field w-20 px-2 text-center text-sm"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {product && (
        <p className="mb-2 text-xs font-medium text-gray-500 dark:text-zinc-400">
          Çeşit Seç — {product.name}
        </p>
      )}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {varieties.map((variety) => {
          const outOfStock = variety.stock <= 0;
          const lowStock = variety.stock <= 5 && variety.stock > 0;

          return (
            <div
              key={variety.id}
              className={`pos-tile flex flex-col gap-2 p-3 ${outOfStock ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-sm font-semibold leading-tight dark:text-zinc-100">
                  {variety.name}
                </span>
                <span
                  className={`shrink-0 rounded-lg px-1.5 py-0.5 text-xs font-bold ${
                    outOfStock
                      ? 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'
                      : lowStock
                        ? 'bg-amber-100 text-amber-600 dark:bg-amber-400/15 dark:text-amber-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-zinc-300'
                  }`}
                >
                  {variety.stock}
                </span>
              </div>

              <div className="mt-auto flex gap-1.5">
                <button
                  type="button"
                  onClick={() => onAdd(variety, 1)}
                  disabled={outOfStock}
                  className="btn-primary flex-1 py-3 text-lg font-bold"
                >
                  +
                </button>
                <input
                  type="number"
                  min="1"
                  max={variety.stock}
                  value={getQty(variety.id)}
                  onChange={(e) =>
                    setQuantities((prev) => ({ ...prev, [variety.id]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddWithQty(variety);
                  }}
                  placeholder="Adet"
                  disabled={outOfStock}
                  className="input-field w-16 px-2 text-center text-sm"
                />
              </div>
            </div>
          );
        })}

        {varieties.length === 0 && (
          <div className="col-span-full card py-8 text-center text-gray-400">
            Bu üründe aktif çeşit yok
          </div>
        )}
      </div>
    </div>
  );
}
