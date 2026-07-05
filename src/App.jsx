import { useEffect } from 'react';
import useStore from './store/useStore';
import LoginPanel from './components/Auth/LoginPanel';
import Header from './components/Layout/Header';
import TabNav from './components/Layout/TabNav';
import InventoryTab from './components/Inventory/InventoryTab';
import POSTab from './components/POS/POSTab';
import ReportsTab from './components/Reports/ReportsTab';
import DataManagementTab from './components/DataManagement/DataManagementTab';

const TABS = {
  inventory: InventoryTab,
  pos: POSTab,
  reports: ReportsTab,
  data: DataManagementTab,
};

export default function App() {
  const isAuthenticated = useStore((s) => s.isAuthenticated);
  const activeTab = useStore((s) => s.activeTab);
  const initTheme = useStore((s) => s.initTheme);
  const initAuth = useStore((s) => s.initAuth);
  const ActiveComponent = TABS[activeTab];

  useEffect(() => {
    initAuth();
    initTheme();
  }, [initAuth, initTheme]);

  if (!isAuthenticated) {
    return <LoginPanel />;
  }

  return (
    <div className="app-bg theme-transition flex min-h-screen flex-col">
      <Header />
      <TabNav />
      <main className="mx-auto w-full max-w-6xl flex-1 px-3 py-4 sm:px-6 sm:py-6">
        <div key={activeTab} className="page-enter">
          <ActiveComponent />
        </div>
      </main>
    </div>
  );
}
