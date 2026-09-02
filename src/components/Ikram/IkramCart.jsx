export default function IkramCart({ items, total, note, onNoteChange, onUpdateQty, onClear, onComplete }) {
  return (
    <div className="card border-amber-200 bg-white/95 backdrop-blur dark:border-amber-500/20 dark:bg-slate-900/95">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="font-bold dark:text-zinc-100">İkram Sepeti</h3>
          <p className="text-xs text-amber-600 dark:text-amber-400">Ücretsiz — gelir oluşturmaz</p>
        </div>
        {items.length > 0 && (
          <button type="button" onClick={onClear} className="btn-ghost text-xs text-red-500">
            Temizle
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-400">Sepet Boş — İkram Ürünü Ekleyin</p>
      ) : (
        <div className="mb-3 max-h-40 space-y-2 overflow-y-auto">
          {items.map((item) => (
            <div
              key={`${item.categoryId}-${item.productId}-${item.variationId}`}
              className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 dark:border dark:border-white/5 dark:bg-slate-800/60"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium dark:text-zinc-100">
                  {item.productName ? `${item.productName} – ${item.variationName}` : item.variationName}
                </p>
                <p className="text-xs text-gray-400">{item.categoryName}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() =>
                    onUpdateQty(item.categoryId, item.productId, item.variationId, item.quantity - 1)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-200 text-lg font-bold dark:bg-slate-700 dark:text-zinc-200"
                >
                  −
                </button>
                <span className="w-8 text-center font-bold">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    onUpdateQty(item.categoryId, item.productId, item.variationId, item.quantity + 1)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-lg font-bold text-amber-700 dark:bg-amber-400/15 dark:text-amber-400"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mb-3">
        <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-zinc-400">
          Not / Açıklama (opsiyonel)
        </label>
        <input
          type="text"
          value={note}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Örn: Ahmet'e doğum günü ikramı"
          className="input-field"
        />
      </div>

      <button
        type="button"
        onClick={onComplete}
        disabled={items.length === 0}
        className="w-full rounded-xl bg-amber-500 px-4 py-3.5 text-base font-semibold text-white shadow-sm transition hover:bg-amber-600 active:scale-[0.97] disabled:opacity-50 dark:bg-amber-500/90 dark:hover:bg-amber-500"
      >
        🎁 İkramı Tamamla ({total} ürün — ücretsiz)
      </button>
    </div>
  );
}
