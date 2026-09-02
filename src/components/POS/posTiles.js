export const POS_TILE_GRID =
  'grid grid-cols-[repeat(auto-fill,minmax(min(100%,130px),1fr))] gap-2.5';

export function posTileButtonClass(selected) {
  return `w-full min-h-11 rounded-xl px-3 py-2.5 text-sm font-semibold leading-tight transition active:scale-[0.98] ${
    selected
      ? 'filter-btn-active shadow-md'
      : 'bg-white text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-slate-800 dark:text-zinc-200 dark:ring-white/10 dark:hover:bg-slate-700'
  }`;
}
