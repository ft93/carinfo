import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import Parts from './pages/Parts';
import Purchases from './pages/Purchases';
import Usages from './pages/Usages';
import Vehicles from './pages/Vehicles';
import Report from './pages/Report';

const TABS = [
  { key: 'dashboard', label: 'Home', icon: '🏠', el: <Dashboard /> },
  { key: 'beli', label: 'Beli', icon: '📥', el: <Purchases /> },
  { key: 'pakai', label: 'Pakai', icon: '🔧', el: <Usages /> },
  { key: 'part', label: 'Sparepart', icon: '📦', el: <Parts /> },
  { key: 'mobil', label: 'Mobil', icon: '🚗', el: <Vehicles /> },
  { key: 'laporan', label: 'Laporan', icon: '📊', el: <Report /> },
] as const;

const current = () => location.hash.replace('#', '') || 'dashboard';

export default function App() {
  const [tab, setTab] = useState(current());
  useEffect(() => {
    const on = () => setTab(current());
    addEventListener('hashchange', on);
    return () => removeEventListener('hashchange', on);
  }, []);
  const active = TABS.find((t) => t.key === tab) ?? TABS[0];

  return (
    <div className="app">
      <header className="topbar">Sparepart Bengkel</header>
      <main>{active.el}</main>
      <nav className="tabs">
        {TABS.map((t) => (
          <a key={t.key} href={'#' + t.key} className={t.key === active.key ? 'on' : ''}>
            <span>{t.icon}</span>
            {t.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
