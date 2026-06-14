import { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'info', onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-400" />,
    error: <XCircle className="h-5 w-5 text-rose-400" />,
    info: <Info className="h-5 w-5 text-cyan-400" />,
  };

  const borders = {
    success: 'border-emerald-500/30 shadow-emerald-500/10',
    warning: 'border-amber-500/30 shadow-amber-500/10',
    error: 'border-rose-500/30 shadow-rose-500/10',
    info: 'border-cyan-500/30 shadow-cyan-500/10',
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-xl border glass-panel shadow-lg ${borders[type]} max-w-md animate-slide-in relative overflow-hidden group`}>
      {/* Decorative colored left bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
        type === 'success' ? 'bg-emerald-500' :
        type === 'warning' ? 'bg-amber-500' :
        type === 'error' ? 'bg-rose-500' : 'bg-cyan-500'
      }`} />
      
      <div className="flex-shrink-0 ml-1">
        {icons[type]}
      </div>
      
      <div className="flex-grow">
        <p className="text-sm font-medium text-slate-100">{message}</p>
      </div>
      
      <button 
        onClick={onClose}
        className="flex-shrink-0 text-slate-400 hover:text-slate-200 transition-colors p-1 rounded-lg hover:bg-slate-800/40"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Toast;
