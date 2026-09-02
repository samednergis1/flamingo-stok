import { useState } from 'react';
import useStore from '../../store/useStore';
import AddStockModal from './AddStockModal';
import {
  AddProductModal,
  AddVarietyModal,
  EditVarietyModal,
} from './InventoryModals';
import { countCategoryStock, countCategoryVarieties, mainProductId } from '../../utils/catalog';
import { formatMoney } from '../../utils/exportImport';

export default function CategoryCard({ category, categories, isExpanded, onToggle }) {
  const addProduct = useStore((s) => s.addProduct);
  const addVariety = useStore((s) => s.addVariety);
  const updateVariety = useStore((s) => s.updateVariety);
  const setVarietyActive = useStore((s) => s.setVarietyActive);
  const setProductActive = useStore((s) => s.setProductActive);

  const [stockModal, setStockModal] = useState(null);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [addVarietyFor, setAddVarietyFor] = useState(null);
  const [editModal, setEditModal] = useState(null);

  const categoryStock = countCategoryStock(category);
  const varietyCount = countCategoryVarieties(category);
  const lowStock = (category.products || []).flatMap((p) =>
    (p.varieties || []).filter((v) => v.active !== false && v.stock <= 5)
  );

  return (
    <>
      <div className={`card-interactive overflow-hidden p-0 ${category.active === false ? 'opacity-60' : ''}`}>
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-slate-800/50"
        >
          <span className={`text-xl transition-transform duration-300 ${isExpanded ? 'rotate-90' : ''}`}>
            ▶
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold dark:text-zinc-100">{category.name}</h3>
              {category.custom && (
                <span className="rounded-md bg-flamingo-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-flamingo-600 dark:bg-rose-500/15 dark:text-rose-400">
                  Manuel
                </span>
              )}
              {category.active === false && (
                <span className="rounded-md bg-gray-200 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-gray-600 dark:bg-slate-700 dark:text-zinc-400">
                  Pasif
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              {(category.products || []).length} ürün · {varietyCount} çeşit · {categoryStock} stok
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
            <button
              type="button"
              onClick={() => setAddProductOpen(true)}
              className="btn-secondary mb-3 w-full text-sm"
            >
              + Ürün Ekle
            </button>

            {(category.products || []).map((product) => (
              <div key={product.id} className="mb-4 last:mb-0">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold dark:text-zinc-100">{product.name}</h4>
                    {product.group && (
                      <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-500/15 dark:text-sky-400">
                        {product.group}
                      </span>
                    )}
                    {product.active === false && (
                      <span className="text-[10px] font-semibold uppercase text-gray-400">Pasif</span>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    {product.id !== mainProductId(category.id) && (
                      <button
                        type="button"
                        onClick={() => setProductActive(category.id, product.id, product.active === false)}
                        className="btn-ghost px-2 py-1 text-xs"
                      >
                        {product.active === false ? 'Aktif' : 'Pasif'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setAddVarietyFor(product)}
                      className="btn-secondary px-2.5 py-1 text-xs"
                    >
                      + Yeni Çeşit Ekle
                    </button>
                  </div>
                </div>

                {(product.varieties || []).length === 0 ? (
                  <p className="py-2 text-center text-xs text-gray-400">Henüz çeşit yok</p>
                ) : (
                  <div className="space-y-2">
                    {(product.varieties || []).map((variety) => (
                      <div
                        key={variety.id}
                        className={`flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-50 px-3 py-2.5 dark:border dark:border-white/5 dark:bg-slate-800/50 ${
                          variety.active === false ? 'opacity-60' : ''
                        }`}
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                          <span
                            className={`stock-badge ${
                              variety.stock <= 5
                                ? 'stock-badge-low'
                                : variety.stock <= 0
                                  ? 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'
                                  : 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400'
                            }`}
                          >
                            {variety.stock}
                          </span>
                          <div className="min-w-0">
                            <span className="font-medium dark:text-zinc-100">{variety.name}</span>
                            {variety.active === false && (
                              <span className="ml-2 text-[10px] uppercase text-gray-400">Pasif</span>
                            )}
                            {(variety.price != null || variety.cost != null) && (
                              <p className="text-xs text-gray-400">
                                {variety.price != null && `Fiyat: ${formatMoney(variety.price)}`}
                                {variety.price != null && variety.cost != null && ' · '}
                                {variety.cost != null && `Maliyet: ${formatMoney(variety.cost)}`}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditModal({ variety, category, product })}
                            className="btn-secondary px-2.5 py-1.5 text-xs"
                          >
                            Düzenle
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setStockModal({ categoryId: category.id, productId: product.id, variety })
                            }
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
            ))}
          </div>
        )}
      </div>

      {stockModal && (
        <AddStockModal
          categoryName={`${category.name} · ${stockModal.variety.name}`}
          variation={stockModal.variety}
          onClose={() => setStockModal(null)}
          onConfirm={(amount) => {
            useStore
              .getState()
              .addStock(stockModal.categoryId, stockModal.productId, stockModal.variety.id, amount);
            setStockModal(null);
          }}
        />
      )}

      {addProductOpen && (
        <AddProductModal
          categoryName={category.name}
          onClose={() => setAddProductOpen(false)}
          onConfirm={(name) => addProduct(category.id, name)}
        />
      )}

      {addVarietyFor && (
        <AddVarietyModal
          productName={addVarietyFor.name}
          onClose={() => setAddVarietyFor(null)}
          onConfirm={(data) => addVariety(category.id, addVarietyFor.id, data)}
        />
      )}

      {editModal && (
        <EditVarietyModal
          variety={editModal.variety}
          category={editModal.category}
          product={editModal.product}
          categories={categories}
          onClose={() => setEditModal(null)}
          onConfirm={(updates) =>
            updateVariety(editModal.category.id, editModal.product.id, editModal.variety.id, updates)
          }
          onToggleActive={(makeActive) => {
            setVarietyActive(
              editModal.category.id,
              editModal.product.id,
              editModal.variety.id,
              makeActive
            );
            setEditModal((prev) =>
              prev
                ? {
                    ...prev,
                    variety: { ...prev.variety, active: makeActive },
                  }
                : null
            );
          }}
        />
      )}
    </>
  );
}
