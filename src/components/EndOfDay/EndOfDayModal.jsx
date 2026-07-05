import { formatDayLabel } from '../../utils/dateFilters';

export default function EndOfDayModal({ dateKey, summary, onDismiss }) {
  const dateLabel = formatDayLabel(dateKey);
  const hasSales = summary.totalItems > 0;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/45 p-4 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-labelledby="eod-title"
    >
      <div className="animate-scale-in flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-flamingo-100 bg-white shadow-2xl dark:border-flamingo-900 dark:bg-gray-900">
        <div className="bg-gradient-to-r from-flamingo-50 to-white px-6 py-5 dark:from-flamingo-950/50 dark:to-gray-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-flamingo-500 dark:text-flamingo-400">
            Gün Sonu Özeti
          </p>
          <h2 id="eod-title" className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">
            {dateLabel}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="mb-5 flex items-center gap-3 rounded-2xl bg-flamingo-50 px-4 py-3 dark:bg-flamingo-950/40">
            <span className="text-3xl">📊</span>
            <div>
              <p className="text-3xl font-bold text-flamingo-600 dark:text-flamingo-400">
                {summary.totalItems}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                toplam satılan ürün · {summary.saleCount} işlem
              </p>
            </div>
          </div>

          {!hasSales ? (
            <p className="py-6 text-center text-sm text-gray-400">
              Bu gün için kayıtlı satış bulunmuyor.
            </p>
          ) : (
            <div className="space-y-5">
              <section>
                <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Kategori Bazlı
                </h3>
                <div className="space-y-2">
                  {summary.categoryBreakdown.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2.5 dark:bg-gray-800/60"
                    >
                      <span className="font-medium">{item.name}</span>
                      <span className="font-bold text-flamingo-600 dark:text-flamingo-400">
                        {item.count} adet
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Çeşit Detayı
                </h3>
                <div className="space-y-4">
                  {summary.variationBreakdown.map((cat) => (
                    <div key={cat.categoryName}>
                      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-flamingo-600 dark:text-flamingo-400">
                        {cat.categoryName}
                      </p>
                      <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
                        <table className="w-full text-sm">
                          <tbody>
                            {cat.items.map((item) => (
                              <tr
                                key={item.name}
                                className="border-t border-gray-50 first:border-t-0 dark:border-gray-800"
                              >
                                <td className="px-3 py-2">{item.name}</td>
                                <td className="px-3 py-2 text-right font-bold text-flamingo-600 dark:text-flamingo-400">
                                  {item.count}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}
        </div>

        <div className="border-t border-gray-100 px-6 py-4 dark:border-gray-800">
          <button type="button" onClick={onDismiss} className="btn-primary w-full py-3.5 text-base">
            Kapat ve Yeni Güne Başla
          </button>
        </div>
      </div>
    </div>
  );
}
