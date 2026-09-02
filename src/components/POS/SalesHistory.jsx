import useStore from '../../store/useStore';
import { formatDateTime } from '../../utils/exportImport';

export default function SalesHistory() {
  const sales = useStore((s) => s.sales);
  const cancelSale = useStore((s) => s.cancelSale);

  const recent = [...sales].reverse().slice(0, 10);
  if (!recent.length) return null;

  const handleCancel = (sale) => {
    if (sale.status === 'cancelled') return;
    const total = sale.items.reduce((s, i) => s + i.quantity, 0);
    if (
      confirm(
        `${formatDateTime(sale.timestamp)} tarihli satışı iptal etmek istiyor musunuz? ${total} adet stoğa iade edilecek.`
      )
    ) {
      const result = cancelSale(sale.id);
      if (!result.success) alert(result.message);
    }
  };

  return (
    <div className="card">
      <h3 className="mb-3 font-bold">Son Satışlar</h3>
      <div className="space-y-2">
        {recent.map((sale) => {
          const total = sale.items.reduce((s, i) => s + i.quantity, 0);
          const cancelled = sale.status === 'cancelled';
          return (
            <div
              key={sale.id}
              className={`rounded-xl border px-3 py-2.5 dark:border-white/5 ${
                cancelled
                  ? 'bg-gray-50 opacity-75 dark:bg-slate-800/40'
                  : 'bg-gray-50 dark:bg-slate-800/60'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium dark:text-zinc-100">
                    {formatDateTime(sale.timestamp)} · {total} adet
                    {cancelled && (
                      <span className="ml-2 text-red-600 dark:text-red-400">İptal edildi</span>
                    )}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-zinc-400">
                    {sale.items
                      .map((i) =>
                        i.productName
                          ? `${i.productName} – ${i.variationName} (${i.quantity})`
                          : `${i.variationName} (${i.quantity})`
                      )
                      .join(', ')}
                  </p>
                  {sale.username && (
                    <p className="text-xs text-gray-400">Personel: {sale.username}</p>
                  )}
                </div>
                {!cancelled && (
                  <button
                    type="button"
                    onClick={() => handleCancel(sale)}
                    className="btn-secondary shrink-0 px-2.5 py-1.5 text-xs text-red-600 dark:text-red-400"
                  >
                    Satışı İptal Et
                  </button>
                )}
              </div>
              {cancelled && sale.cancelledAt && (
                <p className="mt-1 text-xs text-gray-400">
                  İptal: {formatDateTime(sale.cancelledAt)}
                  {sale.cancelledBy ? ` · ${sale.cancelledBy}` : ''}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
