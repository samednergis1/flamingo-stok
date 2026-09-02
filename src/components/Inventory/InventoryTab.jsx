import { useState } from 'react';
import useStore from '../../store/useStore';
import CategoryCard from './CategoryCard';
import { AddCategoryModal } from './InventoryModals';
import { countCategoryStock } from '../../utils/catalog';

export default function InventoryTab() {
  const categories = useStore((s) => s.categories);
  const addCategory = useStore((s) => s.addCategory);
  const [expandedId, setExpandedId] = useState(categories[0]?.id ?? null);
  const [addCategoryOpen, setAddCategoryOpen] = useState(false);

  const totalStock = categories.reduce((sum, c) => sum + countCategoryStock(c), 0);
  const totalVarieties = categories.reduce(
    (sum, c) => sum + (c.products || []).reduce((s, p) => s + (p.varieties || []).length, 0),
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Ürünler & Stok</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {categories.length} kategori · {totalVarieties} çeşit · {totalStock} toplam stok
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddCategoryOpen(true)}
          className="btn-primary shrink-0"
        >
          + Kategori Ekle
        </button>
      </div>

      <div className="space-y-3">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            categories={categories}
            isExpanded={expandedId === category.id}
            onToggle={() => setExpandedId(expandedId === category.id ? null : category.id)}
          />
        ))}
      </div>

      {addCategoryOpen && (
        <AddCategoryModal
          onClose={() => setAddCategoryOpen(false)}
          onConfirm={addCategory}
        />
      )}
    </div>
  );
}
