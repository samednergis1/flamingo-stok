import { useState } from 'react';
import useStore from '../../store/useStore';
import AddStockModal from './AddStockModal';
import {
  AddVariationModal,
  EditVariationModal,
} from './InventoryModals';
import { formatMoney } from '../../utils/exportImport';

export default function CategoryCard({ category, categories, isExpanded, onToggle }) {
  const addVariation = useStore((s) => s.addVariation);
  const updateVariation = useStore((s) => s.updateVariation);

  const [stockModal, setStockModal] = useState(null);
  const [addVariationOpen, setAddVariationOpen] = useState(false);
  const [editModal, setEditModal] = useState(null);

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
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold dark:text-zinc-100">{category.name}</h3>
              {category.custom && (
                <span className="rounded-md bg-flamingo-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-flamingo-600 dark:bg-rose-500/15 dark:text-rose-400">
                  Manuel
                </span>
              )}
            </div>
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
            {category.custom && (
              <button
                type="button"
                onClick={() => setAddVariationOpen(true)}
                className="btn-secondary mb-3 w-full text-sm"
              >
                + Çeşit Ekle
              </button>
            )}

            {category.variations.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">
                Bu kategoride henüz ürün yok
              </p>
            ) : (
              <div className="space-y-2">
                {category.variations.map((variation) => (
                  <div
                    key={variation.id}
                    className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-50 px-3 py-2.5 dark:border dark:border-white/5 dark:bg-slate-800/50"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-3">
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
                      <div className="min-w-0">
                        <span className="font-medium dark:text-zinc-100">{variation.name}</span>
                        {(variation.price != null || variation.cost != null) && (
                          <p className="text-xs text-gray-400">
                            {variation.price != null && `Fiyat: ${formatMoney(variation.price)}`}
                            {variation.price != null && variation.cost != null && ' · '}
                            {variation.cost != null && `Maliyet: ${formatMoney(variation.cost)}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditModal({ variation, category })}
                        className="btn-secondary px-2.5 py-1.5 text-xs"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => setStockModal({ categoryId: category.id, variation })}
                        className="btn-primary px-2.5 py-1.5 text-xs"
                      >
                        + Stok
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

      {addVariationOpen && (
        <AddVariationModal
          categoryName={category.name}
          onClose={() => setAddVariationOpen(false)}
          onConfirm={(data) => addVariation(category.id, data)}
        />
      )}

      {editModal && (
        <EditVariationModal
          variation={editModal.variation}
          category={editModal.category}
          categories={categories}
          onClose={() => setEditModal(null)}
          onConfirm={(updates) =>
            updateVariation(editModal.category.id, editModal.variation.id, updates)
          }
        />
      )}
    </>
  );
}
