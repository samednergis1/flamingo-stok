import { useState } from 'react';

export default function VariationGrid({ category, onAdd }) {
  const [quantities, setQuantities] = useState({});

  const getQty = (id) => quantities[id] ?? '';

  const handleAddWithQty = (variation) => {
    const qty = parseInt(getQty(variation.id), 10) || 1;
    onAdd(variation, qty);
    setQuantities((prev) => ({ ...prev, [variation.id]: '' }));
  };

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {category.variations.map((variation) => {
        const outOfStock = variation.stock <= 0;
        const lowStock = variation.stock <= 5 && variation.stock > 0;

        return (
          <div
            key={variation.id}
            className={`pos-tile flex flex-col gap-2 p-3 ${
              outOfStock ? 'opacity-50' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-1">
              <span className="text-sm font-semibold leading-tight">{variation.name}</span>
              <span
                className={`shrink-0 rounded-lg px-1.5 py-0.5 text-xs font-bold ${
                  outOfStock
                    ? 'bg-red-100 text-red-600 dark:bg-red-900/40'
                    : lowStock
                      ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/40'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800'
                }`}
              >
                {variation.stock}
              </span>
            </div>

            <div className="mt-auto flex gap-1.5">
              <button
                type="button"
                onClick={() => onAdd(variation, 1)}
                disabled={outOfStock}
                className="btn-primary flex-1 py-3 text-lg font-bold"
              >
                +
              </button>
              <input
                type="number"
                min="1"
                max={variation.stock}
                value={getQty(variation.id)}
                onChange={(e) =>
                  setQuantities((prev) => ({ ...prev, [variation.id]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddWithQty(variation);
                }}
                placeholder="Adet"
                disabled={outOfStock}
                className="input-field w-16 px-2 text-center text-sm"
              />
            </div>
          </div>
        );
      })}

      {category.variations.length === 0 && (
        <div className="col-span-full card py-8 text-center text-gray-400">
          Bu kategoride çeşit yok
        </div>
      )}
    </div>
  );
}
