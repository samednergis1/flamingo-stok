import { useState, useMemo } from 'react';
import useStore from '../../store/useStore';
import { getActiveCategories } from '../../utils/catalog';
import CategorySelector from '../POS/CategorySelector';
import ProductSelector from '../POS/ProductSelector';
import VariationGrid from '../POS/VariationGrid';
import IkramCart from './IkramCart';
import IkramSuccessOverlay from './IkramSuccessOverlay';
import IkramHistory from './IkramHistory';

export default function IkramTab() {
  const categories = useStore((s) => s.categories);
  const ikramRecipients = useStore((s) => s.ikramRecipients);
  const completeIkram = useStore((s) => s.completeIkram);

  const activeCategories = useMemo(() => getActiveCategories(categories), [categories]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(activeCategories[0]?.id ?? null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [cart, setCart] = useState([]);
  const [recipient, setRecipient] = useState('');
  const [note, setNote] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);
  const [successTotal, setSuccessTotal] = useState(null);

  const selectedCategory = activeCategories.find((c) => c.id === selectedCategoryId);
  const products = selectedCategory?.products || [];
  const effectiveProductId = selectedProductId || products[0]?.id || null;
  const selectedProduct = products.find((p) => p.id === effectiveProductId);

  const handleCategorySelect = (id) => {
    setSelectedCategoryId(id);
    const cat = activeCategories.find((c) => c.id === id);
    setSelectedProductId(cat?.products[0]?.id ?? null);
  };

  const addToCart = (variety, qty = 1) => {
    if (!selectedCategory || !selectedProduct) return;
    setCart((prev) => {
      const existing = prev.find(
        (item) =>
          item.categoryId === selectedCategoryId &&
          item.productId === effectiveProductId &&
          item.variationId === variety.id
      );
      if (existing) {
        return prev.map((item) =>
          item.categoryId === selectedCategoryId &&
          item.productId === effectiveProductId &&
          item.variationId === variety.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [
        ...prev,
        {
          categoryId: selectedCategoryId,
          categoryName: selectedCategory.name,
          productId: effectiveProductId,
          productName: selectedProduct.name,
          variationId: variety.id,
          variationName: variety.name,
          quantity: qty,
        },
      ];
    });
    setErrorMessage(null);
  };

  const updateCartQty = (categoryId, productId, variationId, quantity) => {
    if (quantity <= 0) {
      setCart((prev) =>
        prev.filter(
          (item) =>
            !(
              item.categoryId === categoryId &&
              item.productId === productId &&
              item.variationId === variationId
            )
        )
      );
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.categoryId === categoryId &&
          item.productId === productId &&
          item.variationId === variationId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const handleCompleteIkram = () => {
    const total = cart.reduce((s, item) => s + item.quantity, 0);
    const result = completeIkram(cart, { recipient, note });
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
            Kategori Seç → Ürün Seç → Çeşit Ekle → Kişi & Not → İkramı Tamamla
          </p>
        </div>

        {errorMessage && <div className="toast-error">{errorMessage}</div>}

        <CategorySelector
          categories={categories}
          selectedId={selectedCategoryId}
          onSelect={handleCategorySelect}
        />

        {selectedCategory && (
          <ProductSelector
            products={products}
            selectedId={effectiveProductId}
            onSelect={setSelectedProductId}
          />
        )}

        {selectedProduct && (
          <VariationGrid product={selectedProduct} onAdd={addToCart} />
        )}

        <IkramCart
          items={cart}
          total={cartTotal}
          recipient={recipient}
          recipients={ikramRecipients}
          onRecipientChange={setRecipient}
          note={note}
          onNoteChange={setNote}
          onUpdateQty={updateCartQty}
          onClear={() => setCart([])}
          onComplete={handleCompleteIkram}
        />

        <IkramHistory />
      </div>

      {successTotal !== null && (
        <IkramSuccessOverlay total={successTotal} onClose={() => setSuccessTotal(null)} />
      )}
    </>
  );
}
