import { useState } from 'react';
import useStore from '../../store/useStore';
import CategorySelector from '../POS/CategorySelector';
import VariationGrid from '../POS/VariationGrid';
import IkramCart from './IkramCart';
import IkramSuccessOverlay from './IkramSuccessOverlay';

export default function IkramTab() {
  const categories = useStore((s) => s.categories);
  const completeIkram = useStore((s) => s.completeIkram);

  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id ?? null);
  const [cart, setCart] = useState([]);
  const [note, setNote] = useState('');
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

  const handleCompleteIkram = () => {
    const total = cart.reduce((s, item) => s + item.quantity, 0);
    const result = completeIkram(cart, note);
    if (result.success) {
      setCart([]);
      setNote('');
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
          <h2 className="text-xl font-bold">Misafir İkramı</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Kategori Seç → Ürün Ekle → İkramı Tamamla (ücretsiz)
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

        <IkramCart
          items={cart}
          total={cartTotal}
          note={note}
          onNoteChange={setNote}
          onUpdateQty={updateCartQty}
          onClear={() => setCart([])}
          onComplete={handleCompleteIkram}
        />
      </div>

      {successTotal !== null && (
        <IkramSuccessOverlay total={successTotal} onClose={() => setSuccessTotal(null)} />
      )}
    </>
  );
}
