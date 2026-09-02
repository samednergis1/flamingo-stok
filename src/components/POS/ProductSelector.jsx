export default function ProductSelector({
  products,
  groups,
  selectedGroup,
  onGroupSelect,
  selectedId,
  onSelect,
}) {
  if (!products || products.length <= 1) return null;

  return (
    <div className="space-y-3">
      {groups?.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-medium text-gray-500 dark:text-zinc-400">Alt Grup</p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {groups.map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => onGroupSelect(group)}
                className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-95 ${
                  selectedGroup === group
                    ? 'filter-btn-active shadow-md'
                    : 'bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-slate-800 dark:text-zinc-200 dark:ring-white/10 dark:hover:bg-slate-700'
                }`}
              >
                {group}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-medium text-gray-500 dark:text-zinc-400">Ürün Seç</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {products.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => onSelect(product.id)}
              className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition active:scale-95 ${
                selectedId === product.id
                  ? 'filter-btn-active shadow-md'
                  : 'bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-slate-800 dark:text-zinc-200 dark:ring-white/10 dark:hover:bg-slate-700'
              }`}
            >
              {product.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
