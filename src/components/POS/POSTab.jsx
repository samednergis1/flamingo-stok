import { useState } from 'react';
import useStore from '../../store/useStore';
import CategorySelector from './CategorySelector';
import VariationGrid from './VariationGrid';
import Cart from './Cart';
import SaleSuccessOverlay from './SaleSuccessOverlay';

export default function POSTab() {
  const categories = useStore((s) => s.categories);
  const completeSale = useStore((s) => s.completeSale);

  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id ?? null);
  const [cart, setCart] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successTotal, setSuccessTotal] = useState(null);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  const addToCart = (variation, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.categoryId === selectedCategoryId && item.variationId === variation.id
      );
      if (existing) {
        return prev.map((item) =>
          item.categoryId === selectedCategoryId && item.variationId === variation.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [
        ...prev,
        {
          categoryId: selectedCategoryId,
          categoryName: selectedCategory.name,
          variationId: variation.id,
          variationName: variation.name,
          quantity: qty,
        },
      ];
    });
    setErrorMessage(null);
  };

  const updateCartQty = (categoryId, variationId, quantity) => {
    if (quantity <= 0) {
      setCart((prev) =>
        prev.filter((item) => !(item.categoryId === categoryId && item.variationId === variationId))
      );
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.categoryId === categoryId && item.variationId === variationId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const handleCompleteSale = () => {
    const total = cart.reduce((s, item) => s + item.quantity, 0);
    const result = completeSale(cart);
    if (result.success) {
      setCart([]);
      setErrorMessage(null);
      setSuccessTotal(total);
    } else {
      setErrorMessage(result.message);
    }
  };

  const cartTotal = cart.reduce((s, item) => s + item.quantity, 0);

  return (
    <>
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold">Hızlı Satış</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kategori seç → çeşit ekle → satışı tamamla
          </p>
        </div>

        {errorMessage && <div className="toast-error">{errorMessage}</div>}

        <CategorySelector
          categories={categories}
          selectedId={selectedCategoryId}
          onSelect={setSelectedCategoryId}
        />

        {selectedCategory && (
          <VariationGrid category={selectedCategory} onAdd={addToCart} />
        )}

        <Cart
          items={cart}
          total={cartTotal}
          onUpdateQty={updateCartQty}
          onClear={() => setCart([])}
          onComplete={handleCompleteSale}
        />
      </div>

      {successTotal !== null && (
        <SaleSuccessOverlay
          total={successTotal}
          onClose={() => setSuccessTotal(null)}
        />
      )}
    </>
  );
}
