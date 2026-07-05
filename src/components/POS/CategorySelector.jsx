export default function CategorySelector({ categories, selectedId, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {categories.map((cat) => (
        <button
          key={cat.id}
          type="button"
          onClick={() => onSelect(cat.id)}
          className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition active:scale-95 ${
            selectedId === cat.id
              ? 'filter-btn-active shadow-md'
              : 'bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700 dark:hover:bg-gray-700'
          }`}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
