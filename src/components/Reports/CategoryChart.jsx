import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const COLORS = ['#f93d63', '#ff6480', '#ff9dad', '#ffc6d0', '#e71d4f', '#c30f3f', '#a3103a'];

export default function CategoryChart({ data }) {
  if (!data.length) return null;

  return (
    <div className="card">
      <h3 className="mb-4 font-bold">Kategori Bazlı Satış</h3>

      <div className="mb-4 hidden h-52 sm:block">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip
              formatter={(value) => [`${value} adet`, 'Satış']}
              labelFormatter={(label) => `Kategori: ${label}`}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={item.name}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-medium">{item.name}</span>
              <span className="text-gray-500">
                {item.count} adet ({item.percentage}%)
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${item.percentage}%`,
                  backgroundColor: COLORS[i % COLORS.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
