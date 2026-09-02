import { POS_TILE_GRID, posTileButtonClass } from './posTiles';

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
          <div className={POS_TILE_GRID}>
            {groups.map((group) => (
              <button
                key={group}
                type="button"
                onClick={() => onGroupSelect(group)}
                className={posTileButtonClass(selectedGroup === group)}
              >
                {group}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-medium text-gray-500 dark:text-zinc-400">Ürün Seç</p>
        <div className={POS_TILE_GRID}>
          {products.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => onSelect(product.id)}
              className={posTileButtonClass(selectedId === product.id)}
            >
              {product.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
