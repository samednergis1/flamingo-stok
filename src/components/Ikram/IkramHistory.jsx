import { useState } from 'react';
import useStore from '../../store/useStore';
import { formatDateTime } from '../../utils/exportImport';
import IkramDetailModal from './IkramDetailModal';

export default function IkramHistory() {
  const ikrams = useStore((s) => s.ikrams);
  const [detailIkram, setDetailIkram] = useState(null);

  const recent = [...ikrams].reverse().slice(0, 15);
  if (!recent.length) return null;

  return (
    <>
      <div className="card">
        <h3 className="mb-3 font-bold">İkram Geçmişi</h3>
        <div className="space-y-2">
          {recent.map((ikram) => {
            const total = ikram.items.reduce((s, i) => s + i.quantity, 0);
            return (
              <div
                key={ikram.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-gray-50 px-3 py-2.5 dark:border dark:border-white/5 dark:bg-slate-800/60"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium dark:text-zinc-100">
                    {formatDateTime(ikram.timestamp)} · {total} adet
                  </p>
                  <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-zinc-400">
                    {ikram.items
                      .map((i) =>
                        i.productName
                          ? `${i.productName} – ${i.variationName} (${i.quantity})`
                          : `${i.variationName} (${i.quantity})`
                      )
                      .join(', ')}
                  </p>
                  {ikram.note ? (
                    <p className="mt-0.5 truncate text-xs text-amber-600 dark:text-amber-400">
                      Not: {ikram.note}
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setDetailIkram(ikram)}
                  className="btn-secondary shrink-0 px-2.5 py-1.5 text-xs"
                >
                  Detay
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {detailIkram && (
        <IkramDetailModal ikram={detailIkram} onClose={() => setDetailIkram(null)} />
      )}
    </>
  );
}
