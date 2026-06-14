

export const StatsCard = ({ title, value, icon, color = 'indigo', description }) => {
  const borderColors = {
    indigo: 'hover:border-indigo-500/30 hover:shadow-indigo-500/5',
    cyan: 'hover:border-cyan-500/30 hover:shadow-cyan-500/5',
    rose: 'hover:border-rose-500/30 hover:shadow-rose-500/5',
    emerald: 'hover:border-emerald-500/30 hover:shadow-emerald-500/5',
  };

  const iconBackgrounds = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    cyan: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    rose: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  };

  return (
    <div className={`glass-panel p-6 rounded-2xl transition-all duration-300 flex items-center justify-between border border-white/5 ${borderColors[color]} hover:translate-y-[-2px]`}>
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-400 tracking-wide uppercase">{title}</p>
        <h3 className="text-3xl font-bold text-slate-50 tracking-tight">{value}</h3>
        {description && (
          <p className="text-xs text-slate-400 font-medium">{description}</p>
        )}
      </div>
      
      <div className={`p-4 rounded-xl flex items-center justify-center ${iconBackgrounds[color]}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatsCard;
