import { useState, useMemo } from 'react';
import useStore from '../../store/useStore';
import {
  filterSalesByRange,
  formatReportPeriod,
  formatReportWeekday,
  toDateKey,
} from '../../utils/dateFilters';
import { analyzeSales } from '../../utils/exportImport';
import TimeFilter from './TimeFilter';
import CategoryChart from './CategoryChart';
import VariationAnalysis from './VariationAnalysis';

export default function ReportsTab() {
  const sales = useStore((s) => s.sales);

  const [timeFilter, setTimeFilter] = useState('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedDay, setSelectedDay] = useState(toDateKey());

  const filteredSales = useMemo(
    () => filterSalesByRange(sales, timeFilter, customStart, customEnd, selectedDay),
    [sales, timeFilter, customStart, customEnd, selectedDay]
  );

  const analytics = useMemo(
    () => analyzeSales(filteredSales),
    [filteredSales]
  );

  const periodLabel = useMemo(
    () => formatReportPeriod(timeFilter, customStart, customEnd, selectedDay),
    [timeFilter, customStart, customEnd, selectedDay]
  );

  const weekday = useMemo(
    () => formatReportWeekday(timeFilter, customStart, selectedDay),
    [timeFilter, customStart, selectedDay]
  );

  const filterLabels = {
    today: 'Günlük Rapor',
    yesterday: 'Dünkü Özet',
    day: 'Gün Raporu',
    week: 'Haftalık Rapor',
    month: 'Aylık Rapor',
    custom: 'Özel Dönem Raporu',
  };

  const handleFilterChange = (filter) => {
    setTimeFilter(filter);
    if (filter === 'day' && !selectedDay) {
      setSelectedDay(toDateKey());
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Raporlar & Analiz</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Satış performansınızı takip edin
        </p>
      </div>

      <div className="card border-flamingo-200 bg-gradient-to-r from-flamingo-50 to-white dark:border-white/5 dark:from-slate-900 dark:to-slate-900">
        <div className="flex items-start gap-3">
          <span className="text-3xl">📅</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide accent-text">
              {filterLabels[timeFilter]}
            </p>
            <p className="mt-1 text-lg font-bold text-gray-900 dark:text-zinc-100">
              {periodLabel}
            </p>
            {weekday && (
              <p className="text-sm capitalize text-gray-500 dark:text-gray-400">{weekday}</p>
            )}
          </div>
        </div>
      </div>

      <TimeFilter
        active={timeFilter}
        onChange={handleFilterChange}
        customStart={customStart}
        customEnd={customEnd}
        selectedDay={selectedDay}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
        onSelectedDayChange={setSelectedDay}
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatCard label="Toplam Satış" value={analytics.totalItems} icon="🛍" />
        <StatCard label="İşlem Sayısı" value={analytics.saleCount} icon="🧾" />
        <StatCard
          label="Kategori"
          value={analytics.categoryBreakdown.length}
          icon="📂"
          className="col-span-2 sm:col-span-1"
        />
      </div>

      {analytics.totalItems === 0 ? (
        <div className="card py-12 text-center text-gray-400">
          <p className="text-4xl">📊</p>
          <p className="mt-2 font-medium">
            {periodLabel} için satış verisi yok
          </p>
          <p className="text-sm">Satış sekmesinden işlem yaptıkça burada görünür</p>
        </div>
      ) : (
        <>
          <CategoryChart data={analytics.categoryBreakdown} />
          <VariationAnalysis data={analytics.variationBreakdown} />
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, className = '' }) {
  return (
    <div className={`card flex items-center gap-3 ${className}`}>
      <span className="text-2xl">{icon}</span>
      <div>
        <p className="text-2xl font-bold accent-text">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}
