import { useState, useMemo, useEffect } from 'react';
import useStore from '../../store/useStore';
import { getPosCategories, getSellableProducts, getProductGroups, filterProductsByGroup } from '../../utils/catalog';
import CategorySelector from './CategorySelector';
import ProductSelector from './ProductSelector';
import VariationGrid from './VariationGrid';
import Cart from './Cart';
import SaleSuccessOverlay from './SaleSuccessOverlay';
import SalesHistory from './SalesHistory';

export default function POSTab() {
  const categories = useStore((s) => s.categories);
  const completeSale = useStore((s) => s.completeSale);

  const posCategories = useMemo(() => getPosCategories(categories), [categories]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(posCategories[0]?.id ?? null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [cart, setCart] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successTotal, setSuccessTotal] = useState(null);

  const selectedCategory = posCategories.find((c) => c.id === selectedCategoryId);
  const products = useMemo(
    () => (selectedCategory ? getSellableProducts(selectedCategory) : []),
    [selectedCategory]
  );
  const productGroups = useMemo(() => getProductGroups(products), [products]);
  const visibleProducts = useMemo(
    () => filterProductsByGroup(products, selectedGroup),
    [products, selectedGroup]
  );
  const effectiveProductId = selectedProductId || visibleProducts[0]?.id || null;
  const selectedProduct = visibleProducts.find((p) => p.id === effectiveProductId);

  useEffect(() => {
    if (posCategories.length === 0) {
      setSelectedCategoryId(null);
      return;
    }
    if (!posCategories.some((c) => c.id === selectedCategoryId)) {
      setSelectedCategoryId(posCategories[0].id);
    }
  }, [posCategories, selectedCategoryId]);

  useEffect(() => {
    const groups = getProductGroups(products);
    const nextGroup = groups?.[0] ?? null;
    setSelectedGroup(nextGroup);
    const visible = filterProductsByGroup(products, nextGroup);
    setSelectedProductId(visible[0]?.id ?? null);
  }, [selectedCategoryId, products]);

  const handleCategorySelect = (id) => {
    setSelectedCategoryId(id);
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    const visible = filterProductsByGroup(products, group);
    setSelectedProductId(visible[0]?.id ?? null);
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
            Kategori Seç → Ürün Seç → Çeşit Ekle → Satışı Tamamla
          </p>
        </div>

        {errorMessage && <div className="toast-error">{errorMessage}</div>}

        <CategorySelector
          categories={categories}
          selectedId={selectedCategoryId}
          onSelect={handleCategorySelect}
        />

        {selectedCategory && visibleProducts.length === 0 && (
          <div className="card py-8 text-center text-gray-400">
            Bu kategoride henüz ürün bulunmuyor
          </div>
        )}

        {selectedCategory && visibleProducts.length > 0 && (
          <ProductSelector
            products={visibleProducts}
            groups={productGroups}
            selectedGroup={selectedGroup}
            onGroupSelect={handleGroupSelect}
            selectedId={effectiveProductId}
            onSelect={setSelectedProductId}
          />
        )}

        {selectedProduct && visibleProducts.length > 0 && (
          <VariationGrid product={selectedProduct} onAdd={addToCart} />
        )}

        <Cart
          items={cart}
          total={cartTotal}
          onUpdateQty={updateCartQty}
          onClear={() => setCart([])}
          onComplete={handleCompleteSale}
        />

        <SalesHistory />
      </div>

      {successTotal !== null && (
        <SaleSuccessOverlay total={successTotal} onClose={() => setSuccessTotal(null)} />
      )}
    </>
  );
}
