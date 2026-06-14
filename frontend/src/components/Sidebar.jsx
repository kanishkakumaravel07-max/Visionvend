import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Camera, Package, Bell, ChevronLeft, ChevronRight } from 'lucide-react';

export const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'AI Detection', path: '/detect', icon: <Camera className="h-5 w-5" /> },
    { name: 'Inventory Manager', path: '/inventory', icon: <Package className="h-5 w-5" /> },
    { name: 'Alerts', path: '/alerts', icon: <Bell className="h-5 w-5" /> },
  ];

  return (
    <aside 
      className={`glass-panel border-r border-slate-800/80 fixed left-0 top-0 h-screen z-30 transition-all duration-300 flex flex-col ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Logo Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-800/80 h-16">
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden">
          <div className="bg-gradient-to-tr from-indigo-500 to-cyan-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/20">
            <Camera className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent tracking-tight whitespace-nowrap">
              VisionVend
            </span>
          )}
        </NavLink>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500/15 to-cyan-500/15 text-indigo-400 border-l-4 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/35 border-l-4 border-transparent'
              }`
            }
          >
            <span className="flex-shrink-0 transition-transform group-hover:scale-105">
              {item.icon}
            </span>
            {!isCollapsed && (
              <span className="whitespace-nowrap transition-opacity duration-300">
                {item.name}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Collapse Trigger Footer Toggle */}
      <div className="p-4 border-t border-slate-800/80 flex items-center justify-center">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
