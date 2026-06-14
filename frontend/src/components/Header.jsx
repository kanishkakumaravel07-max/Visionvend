import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Bell, Cpu, User } from 'lucide-react';
import axios from 'axios';

export const Header = () => {
  const location = useLocation();
  const [engineStatus, setEngineStatus] = useState({ online: false, mode: 'checking' });
  const [unreadAlertCount, setUnreadAlertCount] = useState(0);

  // Parse path to friendly page name
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard Overview';
    if (path.includes('detect')) return 'AI Product Recognition';
    if (path.includes('inventory')) return 'Inventory Management';
    if (path.includes('alerts')) return 'Low Stock Alerts';
    return 'VisionVend';
  };

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await axios.get('http://localhost:5000/health');
        setEngineStatus({ online: true, mode: res.data.mode });
      } catch {
        setEngineStatus({ online: false, mode: 'offline' });
      }
    };

    const fetchAlerts = async () => {
      try {
        const res = await axios.get('http://localhost:5000/alerts');
        const activeAlerts = res.data.filter(a => a.status === 'LOW STOCK' || a.status === 'OUT OF STOCK');
        setUnreadAlertCount(activeAlerts.length);
      } catch {
        // Fallback silently if offline
      }
    };

    fetchHealth();
    fetchAlerts();

    // Poll status periodically (every 15s)
    const interval = setInterval(() => {
      fetchHealth();
      fetchAlerts();
    }, 15000);

    return () => clearInterval(interval);
  }, [location]);

  return (
    <header className="glass-panel border-b border-slate-800/80 h-16 fixed top-0 right-0 left-0 z-20 px-6 flex items-center justify-between">
      {/* Page Title & Breadcrumb */}
      <div>
        <h1 className="text-lg font-semibold text-slate-100 tracking-wide">{getPageTitle()}</h1>
      </div>

      {/* Utilities Section */}
      <div className="flex items-center gap-6">
        {/* API Engine Status Badge */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 text-xs font-medium">
          <Cpu className={`h-3.5 w-3.5 ${
            engineStatus.online ? 'text-indigo-400 animate-pulse' : 'text-slate-500'
          }`} />
          <span className="text-slate-400">AI Engine:</span>
          {engineStatus.online ? (
            <span className={`${engineStatus.mode === 'production' ? 'text-emerald-400' : 'text-cyan-400'}`}>
              Online ({engineStatus.mode === 'production' ? 'YOLOv8 best.pt' : 'Demo Mode'})
            </span>
          ) : (
            <span className="text-rose-400">Offline</span>
          )}
        </div>

        {/* Notifications Icon Button */}
        <Link to="/alerts" className="relative p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-300 hover:text-slate-100 transition-colors">
          <Bell className="h-5 w-5" />
          {unreadAlertCount > 0 && (
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
          )}
        </Link>

        {/* User Account Menu (Placeholder UI) */}
        <div className="flex items-center gap-2 pl-4 border-l border-slate-800/85">
          <div className="h-8.5 w-8.5 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-xs shadow-md shadow-indigo-500/10">
            <User className="h-4 w-4" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-xs font-semibold text-slate-200">System Admin</p>
            <p className="text-[10px] text-slate-400">Store Operator</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
