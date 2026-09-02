import { useState } from 'react';
import IkramPersonDetailModal from './IkramPersonDetailModal';

export default function IkramRecipientReport({ data, periodLabel, ikramCost, formatMoney }) {
  const [selectedPerson, setSelectedPerson] = useState(null);

  if (!data.totalItems) return null;

  return (
    <>
      <div className="card border-amber-200/80 dark:border-amber-500/20">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-amber-700 dark:text-amber-400">
            Kişi Bazlı İkram Raporu
          </h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">{periodLabel}</p>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <MiniStat label="Kişi Sayısı" value={data.uniquePeople} />
          <MiniStat label="Toplam İkram" value={`${data.totalItems} adet`} />
          <MiniStat label="İşlem Satırı" value={data.tableRows.length} />
          <MiniStat label="Toplam Maliyet" value={formatMoney(ikramCost)} />
        </div>

        <div className="mb-6 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-left text-xs text-gray-500 dark:border-white/5 dark:text-zinc-400">
                <th className="px-2 py-2 font-medium">Kişi</th>
                <th className="px-2 py-2 font-medium">Ürün</th>
                <th className="px-2 py-2 font-medium">Çeşit</th>
                <th className="px-2 py-2 text-right font-medium">Adet</th>
                <th className="px-2 py-2 font-medium">Not</th>
              </tr>
            </thead>
            <tbody>
              {data.tableRows.map((row, idx) => (
                <tr key={`${row.ikramId}-${idx}`} className="border-b border-gray-50 dark:border-white/5">
                  <td className="px-2 py-2.5">
                    <button
                      type="button"
                      onClick={() => setSelectedPerson(row.recipient)}
                      className="font-medium text-amber-700 hover:underline dark:text-amber-400"
                    >
                      {row.recipient}
                    </button>
                  </td>
                  <td className="px-2 py-2.5">{row.productName}</td>
                  <td className="px-2 py-2.5">{row.variationName}</td>
                  <td className="px-2 py-2.5 text-right font-bold">{row.quantity}</td>
                  <td className="px-2 py-2.5 text-gray-500 dark:text-zinc-400">
                    {row.note || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-400">
            Kişi Özetleri
          </p>
          {data.people.map((person) => (
            <div
              key={person.name}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-white/5 dark:bg-slate-800/50"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPerson(person.name)}
                  className="text-left font-bold text-amber-700 hover:underline dark:text-amber-400"
                >
                  {person.name}
                </button>
                <span className="text-sm text-gray-500 dark:text-zinc-400">
                  Toplam: {person.totalItems} adet
                </span>
              </div>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-zinc-300">
                {person.products.map((product) => (
                  <li key={product.name}>
                    {product.name}: <strong>{product.count}</strong>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {selectedPerson && (
        <IkramPersonDetailModal
          person={data.people.find((p) => p.name === selectedPerson)}
          onClose={() => setSelectedPerson(null)}
        />
      )}
    </>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-2.5 text-center dark:bg-slate-800/60">
      <p className="text-lg font-bold text-amber-700 dark:text-amber-400">{value}</p>
      <p className="text-xs text-gray-500 dark:text-zinc-400">{label}</p>
    </div>
  );
}
