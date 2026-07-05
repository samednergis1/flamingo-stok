const FILTERS = [
  { id: 'today', label: 'Bugün' },
  { id: 'week', label: 'Bu Hafta' },
  { id: 'month', label: 'Bu Ay' },
  { id: 'custom', label: 'Özel' },
];

export default function TimeFilter({
  active,
  onChange,
  customStart,
  customEnd,
  onCustomStartChange,
  onCustomEndChange,
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
                ? 'bg-flamingo-500 text-white shadow-sm'
                : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:ring-gray-700'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {active === 'custom' && (
        <div className="card flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1">
            <label className="mb-1 block text-xs text-gray-500">Başlangıç</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => onCustomStartChange(e.target.value)}
              className="input-field"
            />
          </div>
          <div className="flex-1">
            <label className="mb-1 block text-xs text-gray-500">Bitiş</label>
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
