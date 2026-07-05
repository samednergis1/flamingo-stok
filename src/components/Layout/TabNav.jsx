import useStore from '../../store/useStore';

const TABS = [
  { id: 'inventory', label: 'Stok', icon: '📦' },
  { id: 'pos', label: 'Satış', icon: '🛒' },
  { id: 'reports', label: 'Raporlar', icon: '📊' },
  { id: 'data', label: 'Veri', icon: '💾' },
];

export default function TabNav() {
  const activeTab = useStore((s) => s.activeTab);
  const setActiveTab = useStore((s) => s.setActiveTab);

  return (
    <nav className="surface-header sticky top-[57px] z-30 border-b">
      <div className="mx-auto flex max-w-6xl gap-1 px-3 py-2 sm:gap-2 sm:px-6 sm:py-2.5">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`tab-btn ${isActive ? 'tab-btn-active' : 'tab-btn-inactive'}`}
            >
              <span className={`text-lg sm:text-base ${isActive ? 'tab-icon-active' : ''}`}>
                {tab.icon}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
