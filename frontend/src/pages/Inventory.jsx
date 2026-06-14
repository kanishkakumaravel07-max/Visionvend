import { useState, useEffect } from 'react';
import { Search, Edit2, Check, X, Package, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import apiService from '../services/api';
import Toast from '../components/Toast';

export const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  
  // Inline editing state
  const [editingId, setEditingId] = useState(null);
  const [editVal, setEditVal] = useState("");
  const [savingId, setSavingId] = useState(null);

  const [toast, setToast] = useState(null);

  const fetchInventoryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getInventory();
      setInventory(data);
    } catch (e) {
      console.error(e);
      setError("Failed to fetch inventory from the server. Ensure the Flask API is online.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await apiService.getInventory();
        if (active) setInventory(data);
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

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setEditVal(item.quantity.toString());
  };

  const handleCancelClick = () => {
    setEditingId(null);
    setEditVal("");
  };

  const handleSaveClick = async (item) => {
    const qty = parseInt(editVal);
    if (isNaN(qty) || qty < 0) {
      setToast({
        message: "Please enter a valid non-negative integer quantity.",
        type: 'error'
      });
      return;
    }

    setSavingId(item.id);
    try {
      await apiService.updateInventory(item.product_name, qty);
      
      // Update local state
      setInventory(prev => prev.map(inv => {
        if (inv.id === item.id) {
          return { ...inv, quantity: qty, last_updated: new Date().toISOString() };
        }
        return inv;
      }));
      
      setToast({
        message: `Updated stock level for '${item.product_name}' to ${qty} units.`,
        type: 'success'
      });
      setEditingId(null);
    } catch (e) {
      console.error(e);
      setToast({
        message: `Failed to update stock: ${e.response?.data?.error || e.message}`,
        type: 'error'
      });
    } finally {
      setSavingId(null);
    }
  };

  // Helper to resolve stock status
  const getStockStatus = (quantity) => {
    if (quantity === 0) return { label: 'Out of Stock', color: 'bg-rose-500/10 text-rose-400 border border-rose-500/20', icon: <AlertCircle className="h-3.5 w-3.5" /> };
    if (quantity <= 10) return { label: 'Low Stock', color: 'bg-amber-500/10 text-amber-400 border border-amber-500/20', icon: <AlertTriangle className="h-3.5 w-3.5" /> };
    return { label: 'In Stock', color: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', icon: <Package className="h-3.5 w-3.5" /> };
  };

  // Filter items
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.product_name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const status = getStockStatus(item.quantity).label;
    if (statusFilter === "ALL") return matchesSearch;
    if (statusFilter === "IN_STOCK") return matchesSearch && status === "In Stock";
    if (statusFilter === "LOW_STOCK") return matchesSearch && status === "Low Stock";
    if (statusFilter === "OUT_OF_STOCK") return matchesSearch && status === "Out of Stock";
    
    return matchesSearch;
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto relative">
      {/* Toast Alert overlay */}
      {toast && (
        <div className="fixed top-5 right-5 z-50">
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        </div>
      )}

      {/* Title block */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Shelf Stocks Inventory</h2>
          <p className="text-slate-400 text-sm">Monitor core quantities, filter shortages, and adjust product levels.</p>
        </div>

        <button 
          onClick={fetchInventoryData}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-700 bg-slate-900/60 hover:bg-slate-900 text-slate-300 transition"
        >
          <RefreshCw className="h-4 w-4" /> Refresh Grid
        </button>
      </div>

      {error && (
        <div className="glass-panel border-rose-500/20 p-4 rounded-xl flex items-center gap-3 bg-rose-500/5 text-rose-300 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and search headers */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 h-4 w-4" />
          <input 
            type="text" 
            placeholder="Search products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm"
          />
        </div>

        {/* Status filters */}
        <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-slate-800/80 gap-1 overflow-x-auto w-full md:w-auto">
          {[
            { label: 'All Stocks', value: 'ALL' },
            { label: 'In Stock', value: 'IN_STOCK' },
            { label: 'Low Stock', value: 'LOW_STOCK' },
            { label: 'Out of Stock', value: 'OUT_OF_STOCK' }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                statusFilter === tab.value 
                  ? 'bg-gradient-to-r from-indigo-500 to-cyan-500 text-white shadow shadow-indigo-500/25' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Grid Table */}
      <div className="glass-panel rounded-3xl overflow-hidden border border-white/5 shadow-xl">
        {loading ? (
          <div className="p-20 text-center space-y-4">
            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-400 rounded-full animate-spin mx-auto" />
            <p className="text-slate-400 text-xs font-semibold">Loading stock levels from Database...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Product Category</th>
                  <th className="px-6 py-4">Availability</th>
                  <th className="px-6 py-4 text-center">Unit Stock Level</th>
                  <th className="px-6 py-4">Last Updated Time</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => {
                    const status = getStockStatus(item.quantity);
                    const isEditing = editingId === item.id;
                    const isSaving = savingId === item.id;

                    return (
                      <tr key={item.id} className="hover:bg-slate-800/10 transition-colors">
                        {/* Name */}
                        <td className="px-6 py-4 font-semibold text-slate-100">{item.product_name}</td>
                        
                        {/* Status badge */}
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${status.color}`}>
                            {status.icon} {status.label}
                          </span>
                        </td>
                        
                        {/* Quantity with inline editor */}
                        <td className="px-6 py-4 text-center">
                          {isEditing ? (
                            <input 
                              type="number"
                              value={editVal}
                              onChange={(e) => setEditVal(e.target.value)}
                              className="w-20 px-2.5 py-1 text-center font-bold text-sm bg-slate-900 border border-indigo-500 text-white rounded-lg focus:outline-none"
                              autoFocus
                              min="0"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveClick(item);
                                if (e.key === 'Escape') handleCancelClick();
                              }}
                            />
                          ) : (
                            <span className="font-bold text-slate-200">{item.quantity}</span>
                          )}
                        </td>

                        {/* Last updated */}
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {item.last_updated ? new Date(item.last_updated).toLocaleString() : 'Never'}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          {isEditing ? (
                            <div className="flex gap-2 justify-end">
                              <button 
                                onClick={() => handleSaveClick(item)}
                                disabled={isSaving}
                                className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white rounded-lg transition"
                                title="Save quantity"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button 
                                onClick={handleCancelClick}
                                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg transition"
                                title="Cancel"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => handleEditClick(item)}
                              className="p-2 hover:bg-slate-800/60 rounded-xl text-slate-400 hover:text-slate-100 transition inline-flex"
                              title="Modify Stock Count"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                      No matching products found. Try adjustments or execute an AI shelf detection scan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;
