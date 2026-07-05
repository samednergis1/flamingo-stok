import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import useStore from '../../store/useStore';

const COLORS_LIGHT = ['#f93d63', '#ff6480', '#ff9dad', '#ffc6d0', '#e71d4f', '#c30f3f', '#a3103a'];
const COLORS_DARK = ['#f5f0eb', '#ebe4db', '#ddd4c8', '#d4ccc3', '#c4bbb0', '#b5aa9e', '#a69888'];

export default function CategoryChart({ data }) {
  const theme = useStore((s) => s.theme);
  const colors = theme === 'dark' ? COLORS_DARK : COLORS_LIGHT;

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
                <Cell key={i} fill={colors[i % colors.length]} />
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
                  backgroundColor: colors[i % colors.length],
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
