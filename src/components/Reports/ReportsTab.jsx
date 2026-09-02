import { useState, useMemo } from 'react';
import useStore from '../../store/useStore';
import {
  filterSalesByRange,
  filterRecordsByRange,
  formatReportPeriod,
  formatReportWeekday,
  toDateKey,
} from '../../utils/dateFilters';
import {
  analyzeSales,
  analyzeIkrams,
  computeSalesRevenue,
  computeIkramCost,
  formatMoney,
} from '../../utils/exportImport';
import { analyzeIkramByRecipient } from '../../utils/ikramReports';
import TimeFilter from './TimeFilter';
import CategoryChart from './CategoryChart';
import VariationAnalysis from './VariationAnalysis';
import IkramRecipientReport from './IkramRecipientReport';

export default function ReportsTab() {
  const sales = useStore((s) => s.sales);
  const ikrams = useStore((s) => s.ikrams);
  const categories = useStore((s) => s.categories);

  const [timeFilter, setTimeFilter] = useState('today');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedDay, setSelectedDay] = useState(toDateKey());
  const [reportView, setReportView] = useState('overview');

  const filteredSales = useMemo(
    () => filterSalesByRange(sales, timeFilter, customStart, customEnd, selectedDay),
    [sales, timeFilter, customStart, customEnd, selectedDay]
  );

  const filteredIkrams = useMemo(
    () => filterRecordsByRange(ikrams, timeFilter, customStart, customEnd, selectedDay),
    [ikrams, timeFilter, customStart, customEnd, selectedDay]
  );

  const salesAnalytics = useMemo(() => analyzeSales(filteredSales), [filteredSales]);
  const ikramAnalytics = useMemo(() => analyzeIkrams(filteredIkrams), [filteredIkrams]);
  const salesRevenue = useMemo(
    () => computeSalesRevenue(filteredSales, categories),
    [filteredSales, categories]
  );
  const ikramCost = useMemo(
    () => computeIkramCost(filteredIkrams, categories),
    [filteredIkrams, categories]
  );
  const ikramRecipientReport = useMemo(
    () => analyzeIkramByRecipient(filteredIkrams),
    [filteredIkrams]
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

  const hasSales = salesAnalytics.totalItems > 0;
  const hasIkrams = ikramAnalytics.totalItems > 0;
  const hasAnyData = hasSales || hasIkrams;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold">Raporlar & Analiz</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Satış ve ikram performansınızı takip edin
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatCard label="Satış Adedi" value={salesAnalytics.totalItems} icon="🛍" />
        <StatCard label="Satış Geliri" value={formatMoney(salesRevenue)} icon="💰" />
        <StatCard label="İkram Adedi" value={ikramAnalytics.totalItems} icon="🎁" />
        <StatCard label="İkram Kişisi" value={ikramRecipientReport.uniquePeople} icon="👤" />
        <StatCard label="İkram Maliyeti" value={formatMoney(ikramCost)} icon="📉" className="col-span-2 sm:col-span-1" />
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Özet' },
          { id: 'sales', label: 'Satışlar' },
          { id: 'ikrams', label: 'İkramlar' },
        ].map((view) => (
          <button
            key={view.id}
            type="button"
            onClick={() => setReportView(view.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition active:scale-95 ${
              reportView === view.id ? 'filter-btn-active' : 'btn-secondary !shadow-none'
            }`}
          >
            {view.label}
          </button>
        ))}
      </div>

      {!hasAnyData ? (
        <div className="card py-12 text-center text-gray-400">
          <p className="text-4xl">📊</p>
          <p className="mt-2 font-medium">{periodLabel} için veri yok</p>
          <p className="text-sm">Satış veya ikram yaptıkça burada görünür</p>
        </div>
      ) : (
        <>
          {(reportView === 'overview' || reportView === 'sales') && (
            <ReportSection
              title="Satış Raporu"
              subtitle={`${salesAnalytics.saleCount} işlem · ${formatMoney(salesRevenue)} gelir`}
              emptyMessage={`${periodLabel} için satış verisi yok`}
              hasData={hasSales}
              analytics={salesAnalytics}
            />
          )}

          {(reportView === 'overview' || reportView === 'ikrams') && (
            <>
              <ReportSection
                title="İkram Raporu"
                subtitle={`${ikramAnalytics.ikramCount} işlem · ${formatMoney(ikramCost)} maliyet · gelire dahil değil`}
                emptyMessage={`${periodLabel} için ikram verisi yok`}
                hasData={hasIkrams}
                analytics={ikramAnalytics}
                accent="amber"
              />
              {hasIkrams && (
                <IkramRecipientReport
                  data={ikramRecipientReport}
                  periodLabel={periodLabel}
                  ikramCost={ikramCost}
                  formatMoney={formatMoney}
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

function ReportSection({ title, subtitle, emptyMessage, hasData, analytics, accent }) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className={`text-lg font-bold ${accent === 'amber' ? 'text-amber-700 dark:text-amber-400' : ''}`}>
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>

      {!hasData ? (
        <div className="card py-8 text-center text-gray-400">
          <p className="text-sm">{emptyMessage}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <StatCard label="Toplam Adet" value={analytics.totalItems} icon="📦" compact />
            <StatCard
              label="İşlem Sayısı"
              value={analytics.saleCount ?? analytics.ikramCount}
              icon="🧾"
              compact
            />
            <StatCard
              label="Kategori"
              value={analytics.categoryBreakdown.length}
              icon="📂"
              className="col-span-2 sm:col-span-1"
              compact
            />
          </div>
          <CategoryChart data={analytics.categoryBreakdown} />
          <VariationAnalysis data={analytics.variationBreakdown} />
        </>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, className = '', compact = false }) {
  return (
    <div className={`card flex items-center gap-3 ${className}`}>
      <span className={compact ? 'text-xl' : 'text-2xl'}>{icon}</span>
      <div>
        <p className={`font-bold accent-text ${compact ? 'text-xl' : 'text-2xl'}`}>{value}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
      </div>
    </div>
  );
}
