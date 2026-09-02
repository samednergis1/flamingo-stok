import { getPosCategories } from '../../utils/catalog';
import { POS_TILE_GRID, posTileButtonClass } from './posTiles';

export default function CategorySelector({ categories, selectedId, onSelect }) {
  const posCategories = getPosCategories(categories);

  if (posCategories.length === 0) {
    return (
      <div className="card py-8 text-center text-gray-400">
        Satış için aktif kategori bulunmuyor
      </div>
    );
  }

  return (
    <div className={POS_TILE_GRID}>
      {posCategories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.id)}
          className={posTileButtonClass(selectedId === cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
