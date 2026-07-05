import { useState } from 'react';
import useStore from '../../store/useStore';
import CategoryCard from './CategoryCard';

export default function InventoryTab() {
  const categories = useStore((s) => s.categories);
  const [expandedId, setExpandedId] = useState(categories[0]?.id ?? null);

  const totalStock = categories.reduce(
    (sum, c) => sum + c.variations.reduce((s, v) => s + v.stock, 0),
    0
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold">Ürünler & Stok</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {categories.length} kategori · {totalStock} toplam stok
          </p>
        </div>
      </div>

      <div className="card border-flamingo-200/80 bg-flamingo-50/40 text-sm text-gray-600 dark:border-flamingo-900/50 dark:bg-flamingo-950/20 dark:text-gray-300">
        Ürün kategorileri sabittir — tüm cihazlarda aynı listeyi görürsünüz. Sadece stok miktarlarını güncelleyebilirsiniz.
      </div>

      <div className="space-y-3">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            isExpanded={expandedId === category.id}
            onToggle={() => setExpandedId(expandedId === category.id ? null : category.id)}
          />
        ))}
      </div>
    </div>
  );
}
