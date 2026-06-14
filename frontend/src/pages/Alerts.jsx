import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, HelpCircle, RefreshCw } from 'lucide-react';
import apiService from '../services/api';
import Toast from '../components/Toast';

export const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Tab states: ALL, ACTIVE (LOW STOCK + OUT OF STOCK), RESOLVED
  const [activeTab, setActiveTab] = useState("ALL");
  const [toast, setToast] = useState(null);

  const fetchAlertsData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getAlerts();
      setAlerts(data);
    } catch (e) {
      console.error(e);
      setError("Failed to fetch notification logs from the server. Check backend online status.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await apiService.getAlerts();
        if (active) setAlerts(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const getAlertStyles = (status) => {
    switch (status) {
      case 'OUT OF STOCK':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-rose-400 animate-pulse" />,
          color: 'bg-rose-500/10 border-rose-500/20 text-rose-200',
          badge: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
          indicator: 'bg-rose-500'
        };
      case 'LOW STOCK':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-amber-400 animate-bounce" />,
          color: 'bg-amber-500/10 border-amber-500/20 text-amber-200',
          badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
          indicator: 'bg-amber-500'
        };
      case 'RESOLVED':
        return {
          icon: <CheckCircle className="h-5 w-5 text-emerald-400" />,
          color: 'bg-emerald-500/5 border-emerald-500/15 text-slate-300',
          badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
          indicator: 'bg-emerald-500'
        };
      default:
        return {
          icon: <HelpCircle className="h-5 w-5 text-slate-400" />,
          color: 'bg-slate-800/40 border-slate-700/50 text-slate-300',
          badge: 'bg-slate-800 text-slate-400',
          indicator: 'bg-slate-500'
        };
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (activeTab === "ALL") return true;
    if (activeTab === "ACTIVE") return a.status === "LOW STOCK" || a.status === "OUT OF STOCK";
    if (activeTab === "RESOLVED") return a.status === "RESOLVED";
    return true;
  });

  return (
    <div className="space-y-8 max-w-4xl mx-auto relative">
      {toast && (
        <div className="fixed top-5 right-5 z-50">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Bell className="h-6 w-6 text-indigo-400" /> System Alerts Feed
          </h2>
          <p className="text-slate-400 text-sm">Review real-time low-stock events, product depletion states, and resolution logs.</p>
        </div>

        <button 
          onClick={fetchAlertsData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-slate-300 transition"
        >
          <RefreshCw className="h-4 w-4" /> Reload Logs
        </button>
      </div>

      {error && (
        <div className="glass-panel border-rose-500/20 p-4 rounded-xl flex items-center gap-3 bg-rose-500/5 text-rose-300 text-sm">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Tabs list filter */}
      <div className="flex border-b border-slate-900 gap-6">
        {[
          { label: 'All Activities', value: 'ALL' },
          { label: 'Active Shortages', value: 'ACTIVE' },
          { label: 'Replenishment Log', value: 'RESOLVED' }
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`pb-3 font-semibold text-sm transition-all relative ${
              activeTab === tab.value 
                ? 'text-indigo-400 font-bold' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {tab.label}
            {activeTab === tab.value && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-cyan-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Timeline items log */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin mx-auto" />
            <p className="text-slate-500 text-xs font-semibold">Fetching system logs...</p>
          </div>
        ) : filteredAlerts.length > 0 ? (
          <div className="relative border-l border-slate-800 ml-4 pl-6 space-y-6">
            {filteredAlerts.map((alert) => {
              const styles = getAlertStyles(alert.status);
              return (
                <div key={alert.id} className="relative group">
                  {/* Outer circle dot placement on timeline */}
                  <span className="absolute -left-[31px] top-1.5 flex h-3 w-3">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      alert.status === 'RESOLVED' ? 'bg-emerald-400/40' : 'bg-amber-400/40'
                    }`}></span>
                    <span className={`relative inline-flex rounded-full h-3 w-3 border border-slate-950 ${styles.indicator}`}></span>
                  </span>

                  {/* Glass Card alert details */}
                  <div className={`glass-panel border rounded-2xl p-5 ${styles.color} transition-all duration-350 hover:border-slate-700/60`}>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3.5">
                        <div className="p-2.5 bg-slate-950/70 border border-slate-800/80 rounded-xl">
                          {styles.icon}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-100 text-sm">{alert.product_name}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {alert.status === 'RESOLVED' 
                              ? 'Stock was replenished above critical threshold levels' 
                              : `Shelf quantity currently sitting at ${alert.current_stock} units`
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center w-full sm:w-auto border-t sm:border-0 border-white/5 pt-3.5 sm:pt-0 gap-1.5">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${styles.badge}`}>
                          {alert.status}
                        </span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          {new Date(alert.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass-panel p-16 rounded-3xl text-center space-y-3">
            <Bell className="h-10 w-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-400">All quiet in notifications log</h3>
            <p className="text-slate-500 text-xs max-w-xs mx-auto">
              No alert matches found. Active stock warnings appear here as soon as database triggers identify short supplies.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;
