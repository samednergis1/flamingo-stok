import { formatDateTime } from '../../utils/exportImport';

export default function IkramDetailModal({ ikram, onClose }) {
  const date = new Date(ikram.timestamp);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl dark:border-white/5 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold dark:text-zinc-100">İkram Detayı</h3>
          <button type="button" onClick={onClose} className="btn-ghost px-2 py-1 text-lg">
            ✕
          </button>
        </div>

        <dl className="space-y-3 text-sm">
          <DetailRow label="Tarih" value={date.toLocaleDateString('tr-TR')} />
          <DetailRow label="Saat" value={date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} />
          <DetailRow label="Personel" value={ikram.username || 'Belirtilmedi'} />
          <DetailRow
            label="Not"
            value={ikram.note?.trim() ? ikram.note : 'Not eklenmedi'}
            muted={!ikram.note?.trim()}
          />
        </dl>

        <div className="mt-4 border-t border-gray-100 pt-4 dark:border-white/5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
            İkram Edilen Ürünler
          </p>
          <div className="space-y-2">
            {ikram.items.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-gray-50 px-3 py-2 dark:bg-slate-800/60"
              >
                <p className="font-medium dark:text-zinc-100">
                  {item.productName || item.categoryName}
                </p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Kategori: {item.categoryName}
                </p>
                <p className="text-xs text-gray-500 dark:text-zinc-400">
                  Çeşit: {item.variationName} · {item.quantity} adet
                </p>
              </div>
            ))}
          </div>
        </div>

        <button type="button" onClick={onClose} className="btn-primary mt-5 w-full">
          Kapat
        </button>
      </div>
    </div>
  );
}

function DetailRow({ label, value, muted }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-gray-500 dark:text-zinc-400">{label}</dt>
      <dd className={`text-right font-medium ${muted ? 'text-gray-400' : 'dark:text-zinc-100'}`}>
        {value}
      </dd>
    </div>
  );
}
