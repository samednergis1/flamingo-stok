import { useState } from 'react';
import useStore from '../../store/useStore';
import AddStockModal from './AddStockModal';
import {
  AddProductModal,
  AddVarietyModal,
  EditVarietyModal,
  ConfirmDeleteModal,
} from './InventoryModals';
import {
  countCategoryStock,
  countCategoryProducts,
  getPrimaryVariety,
  isMultiVarietyProduct,
  mainProductId,
} from '../../utils/catalog';
import { formatMoney } from '../../utils/exportImport';

function stockBadgeClass(stock) {
  if (stock <= 0) return 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400';
  if (stock <= 5) return 'stock-badge-low';
  return 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400';
}

function VarietyActions({ category, product, variety, multiVariety, onEdit, onAddStock, onDelete, allowDelete }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <button type="button" onClick={onEdit} className="btn-secondary px-2.5 py-1.5 text-xs">
        Düzenle
      </button>
      <button
        type="button"
        onClick={() =>
          onAddStock({
            categoryId: category.id,
            productId: product.id,
            variety,
            productName: product.name,
            multiVariety,
          })
        }
        className="btn-primary px-2.5 py-1.5 text-xs"
      >
        + Stok
      </button>
      {allowDelete && (
        <button type="button" onClick={onDelete} className="btn-danger-outline px-2.5 py-1.5 text-xs">
          Sil
        </button>
      )}
    </div>
  );
}

function SimpleProductRow({
  category,
  product,
  onEdit,
  onAddStock,
  onDelete,
  onToggleProductActive,
  allowDelete,
}) {
  const variety = getPrimaryVariety(product);
  if (!variety) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-slate-800/50">
        <span className="text-sm font-medium dark:text-zinc-100">{product.name}</span>
        {allowDelete && (
          <button type="button" onClick={onDelete} className="btn-danger-outline px-2.5 py-1.5 text-xs">
            Sil
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-50 px-3 py-2.5 dark:border dark:border-white/5 dark:bg-slate-800/50 ${
        product.active === false || variety.active === false ? 'opacity-60' : ''
      }`}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <span className={`stock-badge ${stockBadgeClass(variety.stock)}`}>{variety.stock}</span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium dark:text-zinc-100">{product.name}</span>
            {product.group && (
              <span className="rounded-md bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-500/15 dark:text-sky-400">
                {product.group}
              </span>
            )}
            {(product.active === false || variety.active === false) && (
              <span className="text-[10px] font-semibold uppercase text-gray-400">Pasif</span>
            )}
          </div>
          {(variety.price != null || variety.cost != null) && (
            <p className="text-xs text-gray-400">
              {variety.price != null && `Fiyat: ${formatMoney(variety.price)}`}
              {variety.price != null && variety.cost != null && ' · '}
              {variety.cost != null && `Maliyet: ${formatMoney(variety.cost)}`}
            </p>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {product.id !== mainProductId(category.id) && (
          <button
            type="button"
            onClick={() => onToggleProductActive(product.active === false)}
            className="btn-ghost px-2 py-1 text-xs"
          >
            {product.active === false ? 'Aktif' : 'Pasif'}
          </button>
        )}
        <VarietyActions
          category={category}
          product={product}
          variety={variety}
          multiVariety={false}
          onEdit={onEdit}
          onAddStock={onAddStock}
          onDelete={onDelete}
          allowDelete={allowDelete}
        />
      </div>
    </div>
  );
}

function MultiVarietyProductBlock({
  category,
  product,
  onAddVariety,
  onEdit,
  onAddStock,
  onDeleteVariety,
  onToggleProductActive,
  allowDelete,
}) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
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
              onClick={() => onToggleProductActive(product.active === false)}
              className="btn-ghost px-2 py-1 text-xs"
            >
              {product.active === false ? 'Aktif' : 'Pasif'}
            </button>
          )}
          <button type="button" onClick={onAddVariety} className="btn-secondary px-2.5 py-1 text-xs">
            + Yeni Çeşit Ekle
          </button>
        </div>
      </div>

      {(product.varieties || []).length === 0 ? (
        <p className="py-2 text-center text-xs text-gray-400">Henüz çeşit yok</p>
      ) : (
        <div className="space-y-2 pl-1">
          {(product.varieties || []).map((variety) => (
            <div
              key={variety.id}
              className={`flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-50 px-3 py-2.5 dark:border dark:border-white/5 dark:bg-slate-800/50 ${
                variety.active === false ? 'opacity-60' : ''
              }`}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className={`stock-badge ${stockBadgeClass(variety.stock)}`}>{variety.stock}</span>
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
              <VarietyActions
                category={category}
                product={product}
                variety={variety}
                multiVariety
                onEdit={() => onEdit(variety)}
                onAddStock={onAddStock}
                onDelete={() => onDeleteVariety(variety)}
                allowDelete={allowDelete}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryCard({ category, categories, isExpanded, onToggle, onNotify }) {
  const addProduct = useStore((s) => s.addProduct);
  const addVariety = useStore((s) => s.addVariety);
  const updateVariety = useStore((s) => s.updateVariety);
  const setVarietyActive = useStore((s) => s.setVarietyActive);
  const setProductActive = useStore((s) => s.setProductActive);
  const deleteCategory = useStore((s) => s.deleteCategory);
  const deleteProduct = useStore((s) => s.deleteProduct);
  const deleteVariety = useStore((s) => s.deleteVariety);

  const [stockModal, setStockModal] = useState(null);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [addVarietyFor, setAddVarietyFor] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const categoryStock = countCategoryStock(category);
  const productCount = countCategoryProducts(category);
  const lowStock = (category.products || []).flatMap((p) =>
    (p.varieties || []).filter((v) => v.active !== false && v.stock <= 5)
  );

  const notify = (result) => {
    onNotify?.({
      type: result.success ? 'success' : 'error',
      message: result.message,
    });
  };

  const allowDelete = category.custom === true;

  const runDelete = () => {
    if (!confirmDelete) return;
    const result = confirmDelete.run();
    notify(result);
    if (result.success) setConfirmDelete(null);
  };

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
              {productCount} ürün · {categoryStock} stok
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
            <div className="mb-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setAddProductOpen(true)}
                className={`btn-secondary text-sm ${allowDelete ? 'min-w-0 flex-1' : 'w-full'}`}
              >
                + Ürün Ekle
              </button>
              {allowDelete && (
                <button
                  type="button"
                  onClick={() =>
                    setConfirmDelete({
                      title: 'Kategoriyi Sil',
                      message:
                        'Bu kategoriyi ve içindeki tüm ürünleri silmek istediğinize emin misiniz?',
                      run: () => deleteCategory(category.id),
                    })
                  }
                  className="btn-danger-outline shrink-0 px-3 text-sm"
                >
                  🗑 Kategoriyi Sil
                </button>
              )}
            </div>

            <div className="space-y-2">
              {(category.products || []).map((product) =>
                isMultiVarietyProduct(product) ? (
                  <MultiVarietyProductBlock
                    key={product.id}
                    category={category}
                    product={product}
                    onAddVariety={() => setAddVarietyFor(product)}
                    onEdit={(variety) => setEditModal({ variety, category, product })}
                    onAddStock={setStockModal}
                    onDeleteVariety={(variety) =>
                      setConfirmDelete({
                        title: 'Çeşidi Sil',
                        message: `"${variety.name}" çeşidini silmek istediğinize emin misiniz?`,
                        run: () => deleteVariety(category.id, product.id, variety.id),
                      })
                    }
                    onToggleProductActive={(makeActive) =>
                      setProductActive(category.id, product.id, makeActive)
                    }
                    allowDelete={allowDelete}
                  />
                ) : (
                  <SimpleProductRow
                    key={product.id}
                    category={category}
                    product={product}
                    onEdit={() => {
                      const variety = getPrimaryVariety(product);
                      if (variety) setEditModal({ variety, category, product });
                    }}
                    onAddStock={setStockModal}
                    onDelete={() =>
                      setConfirmDelete({
                        title: 'Ürünü Sil',
                        message: `"${product.name}" ürününü silmek istediğinize emin misiniz?`,
                        run: () => deleteProduct(category.id, product.id),
                      })
                    }
                    onToggleProductActive={(makeActive) =>
                      setProductActive(category.id, product.id, makeActive)
                    }
                    allowDelete={allowDelete}
                  />
                )
              )}
            </div>
          </div>
        )}
      </div>

      {stockModal && (
        <AddStockModal
          label={
            stockModal.multiVariety
              ? `${category.name} · ${stockModal.productName} · ${stockModal.variety.name}`
              : `${category.name} · ${stockModal.productName}`
          }
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

      {confirmDelete && (
        <ConfirmDeleteModal
          title={confirmDelete.title}
          message={confirmDelete.message}
          onClose={() => setConfirmDelete(null)}
          onConfirm={runDelete}
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
