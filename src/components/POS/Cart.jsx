export default function Cart({ items, total, onUpdateQty, onClear, onComplete }) {
  return (
    <div className="card border-flamingo-200 bg-white/95 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold">
          Sepet
          {total > 0 && (
            <span className="ml-2 rounded-full accent-badge px-2 py-0.5 text-sm">
              {total} ürün
            </span>
          )}
        </h3>
        {items.length > 0 && (
          <button type="button" onClick={onClear} className="btn-ghost text-xs text-red-500">
            Temizle
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-400">Sepet Boş — Ürün Ekleyin</p>
      ) : (
        <div className="mb-3 max-h-40 space-y-2 overflow-y-auto">
          {items.map((item) => (
            <div
              key={`${item.categoryId}-${item.variationId}`}
              className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 dark:bg-gray-800"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.variationName}</p>
                <p className="text-xs text-gray-400">{item.categoryName}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateQty(item.categoryId, item.variationId, item.quantity - 1)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 text-lg font-bold dark:bg-gray-700"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateQty(item.categoryId, item.variationId, item.quantity + 1)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-flamingo-100 text-lg font-bold text-flamingo-600 dark:bg-cream-100/20 dark:text-cream-100"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={onComplete}
        disabled={items.length === 0}
        className="btn-primary w-full py-3.5 text-base"
      >
        ✓ Satışı Tamamla ({total})
      </button>
    </div>
  );
}
