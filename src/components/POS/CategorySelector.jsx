import { getActiveCategories } from '../../utils/catalog';
import { POS_TILE_GRID, posTileButtonClass } from './posTiles';

export default function CategorySelector({ categories, selectedId, onSelect }) {
  const activeCategories = getActiveCategories(categories);

  return (
    <div className={POS_TILE_GRID}>
      {activeCategories.map((cat) => (
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
