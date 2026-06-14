import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Percent, BarChart3, TrendingUp, RefreshCw, Layers } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import apiService from '../services/api';
import StatsCard from '../components/StatsCard';

export const Dashboard = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    
    try {
      const invData = await apiService.getInventory();
      setInventory(invData);
    } catch (e) {
      console.error("Dashboard failed to retrieve data:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const invData = await apiService.getInventory();
        if (active) setInventory(invData);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    
    // Auto-poll stats dashboard every 12 seconds
    const interval = setInterval(() => {
      fetchData(true);
    }, 12000);
    
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Compute metrics
  const totalProductCategories = inventory.length;
  const totalStockQuantity = inventory.reduce((acc, curr) => acc + curr.quantity, 0);
  const lowStockCount = inventory.filter(item => item.quantity <= 10 && item.quantity > 0).length;
  const outOfStockCount = inventory.filter(item => item.quantity === 0).length;
  
  // Custom mock classification accuracy
  const detectionAccuracy = "95.4%";

  // Prepare chart datasets
  const chartData = inventory.map(item => ({
    name: item.product_name,
    stock: item.quantity,
    fillRate: Math.min(Math.round((item.quantity / 30) * 100), 100) // Assumes max threshold level of 30 units per shelf line
  }));

  const COLORS = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Inventory Dashboard</h2>
          <p className="text-slate-400 text-sm">Real-time telemetry of retail shelf capacity, counts, and alert states.</p>
        </div>
        
        <button 
          onClick={() => fetchData(false)}
          disabled={loading || refreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-slate-300 transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} /> 
          {refreshing ? 'Refreshing...' : 'Refresh Telemetry'}
        </button>
      </div>

      {loading ? (
        <div className="p-32 text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Loading Analytics Summary...</p>
        </div>
      ) : (
        <>
          {/* Metrics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard 
              title="Unique Categories" 
              value={totalProductCategories} 
              icon={<Layers className="h-6 w-6" />} 
              color="indigo" 
              description="Monitored product classes" 
            />
            <StatsCard 
              title="Total Stock Count" 
              value={totalStockQuantity} 
              icon={<Package className="h-6 w-6" />} 
              color="cyan" 
              description="Units currently on shelves" 
            />
            <StatsCard 
              title="Alert Items" 
              value={lowStockCount + outOfStockCount} 
              icon={<AlertTriangle className="h-6 w-6" />} 
              color="rose" 
              description={`${outOfStockCount} deplete / ${lowStockCount} critical items`} 
            />
            <StatsCard 
              title="Model Accuracy" 
              value={detectionAccuracy} 
              icon={<Percent className="h-6 w-6" />} 
              color="emerald" 
              description="YOLOv8 confidence threshold" 
            />
          </div>

          {/* Charts Row 1: Bar & Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Bar Chart stock quantities */}
            <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-white/5 flex flex-col justify-between h-[400px]">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-indigo-400" />
                <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">Product Stock Quantities</h3>
              </div>
              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }}
                      labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                      itemStyle={{ color: '#818cf8' }}
                    />
                    <Bar dataKey="stock" fill="#6366f1" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.stock <= 10 ? '#f59e0b' : '#6366f1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pie Chart distribution */}
            <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-white/5 flex flex-col justify-between h-[400px]">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
                <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">Stock Distribution</h3>
              </div>
              <div className="flex-1 w-full min-h-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="stock"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] text-slate-400 font-medium pb-2">
                {chartData.slice(0, 4).map((entry, index) => (
                  <span key={entry.name} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    {entry.name} ({entry.stock})
                  </span>
                ))}
                {chartData.length > 4 && <span>+ {chartData.length - 4} more</span>}
              </div>
            </div>
          </div>

          {/* Charts Row 2: Shelf Fill Rates Area Chart */}
          <div className="glass-panel p-6 rounded-3xl border border-white/5 h-[320px] flex flex-col justify-between">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">Vending Shelf Fill Ratios (%)</h3>
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFillRate" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} unit="%" />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="fillRate" stroke="#06b6d4" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFillRate)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
