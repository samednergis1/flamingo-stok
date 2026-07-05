export default function VariationAnalysis({ data }) {
  if (!data.length) return null;

  return (
    <div className="card">
      <h3 className="mb-1 font-bold">Çeşit Bazlı Analiz</h3>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        Her kategoride hangi çeşitlerin ne kadar satıldığı
      </p>

      <div className="space-y-5">
        {data.map((category) => (
          <div key={category.categoryName}>
            <div className="mb-2 flex items-baseline justify-between">
              <h4 className="font-semibold accent-text">
                {category.categoryName}
              </h4>
              <span className="text-sm text-gray-500">
                Toplam: <strong>{category.categoryTotal}</strong> adet
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-gray-800">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-left text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                    <th className="px-3 py-2 font-medium">Çeşit</th>
                    <th className="px-3 py-2 text-right font-medium">Adet</th>
                    <th className="px-3 py-2 text-right font-medium">Oran</th>
                  </tr>
                </thead>
                <tbody>
                  {category.items.map((item, idx) => (
                    <tr
                      key={item.name}
                      className={`border-t border-gray-50 dark:border-gray-800 ${
                        idx === 0 ? 'bg-flamingo-50/50 dark:bg-cream-100/10' : ''
                      }`}
                    >
                      <td className="px-3 py-2.5 font-medium">
                        {idx === 0 && <span className="mr-1">🏆</span>}
                        {item.name}
                      </td>
                      <td className="px-3 py-2.5 text-right font-bold">{item.count}</td>
                      <td className="px-3 py-2.5 text-right text-gray-500">
                        {item.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-2 text-xs text-gray-400">
              {category.categoryTotal} adet {category.categoryName} satıldı:{' '}
              {category.items.map((item, i) => (
                <span key={item.name}>
                  {i > 0 && (i === category.items.length - 1 ? ' ve ' : ', ')}
                  <strong>{item.count}</strong> {item.name}
                </span>
              ))}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
