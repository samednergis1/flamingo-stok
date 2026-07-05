import { useState, useMemo } from 'react';
import useStore from '../../store/useStore';
import { filterSalesByRange, formatReportPeriod, formatReportWeekday } from '../../utils/dateFilters';
import { analyzeSales } from '../../utils/exportImport';
import TimeFilter from './TimeFilter';
import CategoryChart from './CategoryChart';
import VariationAnalysis from './VariationAnalysis';

export default function ReportsTab() {
  const sales = useStore((s) => s.sales);

  const [timeFilter, setTimeFilter] = useState('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const filteredSales = useMemo(
    () => filterSalesByRange(sales, timeFilter, customStart, customEnd),
    [sales, timeFilter, customStart, customEnd]
  );

  const analytics = useMemo(
    () => analyzeSales(filteredSales),
    [filteredSales]
  );

  const periodLabel = useMemo(
    () => formatReportPeriod(timeFilter, customStart, customEnd),
    [timeFilter, customStart, customEnd]
  );

  const weekday = useMemo(
    () => formatReportWeekday(timeFilter, customStart),
    [timeFilter, customStart]
  );

  const filterLabels = {
    today: 'Günlük Rapor',
    week: 'Haftalık Rapor',
    month: 'Aylık Rapor',
    custom: 'Özel Dönem Raporu',
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Raporlar & Analiz</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Satış performansınızı takip edin
        </p>
      </div>

      <div className="card border-flamingo-200 bg-gradient-to-r from-flamingo-50 to-white dark:border-flamingo-900 dark:from-flamingo-950/40 dark:to-gray-900">
        <div className="flex items-start gap-3">
          <span className="text-3xl">📅</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-flamingo-600 dark:text-flamingo-400">
              {filterLabels[timeFilter]}
            </p>
            <p className="mt-1 text-lg font-bold text-gray-900 dark:text-gray-100">
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
        onChange={setTimeFilter}
        customStart={customStart}
        customEnd={customEnd}
        onCustomStartChange={setCustomStart}
        onCustomEndChange={setCustomEnd}
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
        <p className="text-2xl font-bold text-flamingo-600 dark:text-flamingo-400">{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}
