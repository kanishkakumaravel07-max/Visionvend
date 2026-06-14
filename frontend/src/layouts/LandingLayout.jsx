
import { Outlet, Link } from 'react-router-dom';
import { Camera } from 'lucide-react';

export const LandingLayout = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between overflow-x-hidden">
      {/* Landing Header */}
      <header className="glass-panel border-b border-white/5 sticky top-0 z-50 px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="bg-gradient-to-tr from-indigo-500 to-cyan-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/10">
            <Camera className="h-5 w-5" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent tracking-tight">
            VisionVend
          </span>
        </Link>

        <div>
          <Link 
            to="/dashboard" 
            className="px-5 py-2 rounded-xl text-sm font-semibold border border-indigo-500/30 text-indigo-300 hover:text-white hover:bg-indigo-500/10 transition-all duration-300"
          >
            Launch System
          </Link>
        </div>
      </header>

      {/* Main Showcase Panel */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Landing Footer */}
      <footer className="border-t border-slate-900/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6">
          <p>© {new Date().getFullYear()} VisionVend. AI-Based Product Recognition & Inventory System. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingLayout;
