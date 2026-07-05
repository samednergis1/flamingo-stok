import { useState } from 'react';
import useStore from '../../store/useStore';
import AddStockModal from './AddStockModal';

export default function CategoryCard({ category, isExpanded, onToggle }) {
  const [stockModal, setStockModal] = useState(null);

  const categoryStock = category.variations.reduce((s, v) => s + v.stock, 0);
  const lowStock = category.variations.filter((v) => v.stock <= 5);

  return (
    <>
      <div className="card-interactive overflow-hidden p-0">
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-slate-800/50"
        >
          <span className={`text-xl transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
            ▶
          </span>
          <div>
            <h3 className="font-semibold dark:text-zinc-100">{category.name}</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              {category.variations.length} çeşit · {categoryStock} stok
              {lowStock.length > 0 && (
                <span className="ml-2 text-amber-600 dark:text-amber-400">
                  ⚠ {lowStock.length} düşük
                </span>
              )}
            </p>
          </div>
        </button>

        {isExpanded && (
          <div className="animate-fade-in-up border-t border-gray-100 px-4 py-3 dark:border-white/5">
            <div className="space-y-2">
              {category.variations.map((variation) => (
                <div
                  key={variation.id}
                  className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5 dark:border dark:border-white/5 dark:bg-slate-800/50"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`stock-badge ${
                        variation.stock <= 5
                          ? 'stock-badge-low'
                          : variation.stock <= 0
                            ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'
                            : 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400'
                      }`}
                    >
                      {variation.stock}
                    </span>
                    <span className="font-medium dark:text-zinc-100">{variation.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStockModal({ categoryId: category.id, variation })}
                    className="btn-primary px-3 py-1.5 text-xs"
                  >
                    + Stok
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {stockModal && (
        <AddStockModal
          categoryName={category.name}
          variation={stockModal.variation}
          onClose={() => setStockModal(null)}
          onConfirm={(amount) => {
            useStore.getState().addStock(stockModal.categoryId, stockModal.variation.id, amount);
            setStockModal(null);
          }}
        />
      )}
    </>
  );
}
