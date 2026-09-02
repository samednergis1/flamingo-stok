import { formatDateTime } from '../../utils/exportImport';

export default function IkramPersonDetailModal({ person, onClose }) {
  if (!person) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-white/5 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold dark:text-zinc-100">{person.name}</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">
              Toplam {person.totalItems} adet ikram
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn-ghost px-2 py-1 text-lg">
            ✕
          </button>
        </div>

        <div className="mb-4 rounded-xl bg-amber-50 p-3 dark:bg-amber-500/10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
            Özet
          </p>
          <ul className="space-y-1 text-sm dark:text-zinc-200">
            {person.products.map((product) => (
              <li key={product.name}>
                {product.name}: <strong>{product.count}</strong>
              </li>
            ))}
          </ul>
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
          Tüm İkramlar
        </p>
        <div className="space-y-2">
          {person.entries.map((entry, idx) => (
            <div
              key={`${entry.ikramId}-${idx}`}
              className="rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 dark:border-white/5 dark:bg-slate-800/60"
            >
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                {formatDateTime(entry.timestamp)}
              </p>
              <p className="mt-1 font-medium dark:text-zinc-100">
                {entry.productName} – {entry.variationName} · {entry.quantity} adet
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400">
                Not: {entry.note || 'Not eklenmedi'}
              </p>
            </div>
          ))}
        </div>

        <button type="button" onClick={onClose} className="btn-primary mt-5 w-full">
          Kapat
        </button>
      </div>
    </div>
  );
}
