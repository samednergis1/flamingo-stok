const FILTERS = [
  { id: 'today', label: 'Bugün' },
  { id: 'yesterday', label: 'Dünkü Özet' },
  { id: 'day', label: 'Tarih Seç' },
  { id: 'week', label: 'Bu Hafta' },
  { id: 'month', label: 'Bu Ay' },
  { id: 'custom', label: 'Aralık' },
];

export default function TimeFilter({
  active,
  onChange,
  customStart,
  customEnd,
  selectedDay,
  onCustomStartChange,
  onCustomEndChange,
  onSelectedDayChange,
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onChange(f.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition active:scale-95 ${
              active === f.id
                ? 'filter-btn-active'
                : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-slate-800 dark:text-zinc-300 dark:ring-white/10 dark:hover:bg-slate-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {active === 'day' && (
        <div className="card">
          <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Satışları görmek istediğiniz gün
          </label>
          <input
            type="date"
            value={selectedDay}
            onChange={(e) => onSelectedDayChange(e.target.value)}
            className="input-field"
          />
        </div>
      )}

      {active === 'custom' && (
        <div className="card flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Başlangıç</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => onCustomStartChange(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs text-gray-500 dark:text-gray-400">Bitiş</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => onCustomEndChange(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      )}
    </div>
  );
}
