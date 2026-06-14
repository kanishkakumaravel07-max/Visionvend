
import { Link } from 'react-router-dom';
import { Camera, BarChart3, Bell, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const Landing = () => {
  const features = [
    {
      title: "YOLOv8 Product Recognition",
      description: "Instantly detect and classify products like beverages, chips, biscuits, and packages using our highly optimized deep learning model.",
      icon: <Camera className="h-6 w-6 text-indigo-400" />,
      color: "from-indigo-500/10 to-indigo-500/2"
    },
    {
      title: "Automated Stock Count",
      description: "Get precise, instant product quantities from computer vision scans. No manual inventory counts required.",
      icon: <BarChart3 className="h-6 w-6 text-cyan-400" />,
      color: "from-cyan-500/10 to-cyan-500/2"
    },
    {
      title: "Low Stock Alert Engine",
      description: "Automated trigger notifications when stock dips. Ensures shelves remain stocked and prevents sales disruptions.",
      icon: <Bell className="h-6 w-6 text-rose-400" />,
      color: "from-rose-500/10 to-rose-500/2"
    }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-10 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium mb-8">
          <Zap className="h-3.5 w-3.5 text-cyan-400" />
          <span>Real-Time Shelf Monitoring powered by Computer Vision</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.15]">
          Smart Shelf Recognition & <br />
          <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-pulse">
            Inventory Automation
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-slate-400 text-base md:text-lg mb-10 leading-relaxed">
          Monitor store products, track shelf stock ratios, and trigger instant low-stock alerts using state-of-the-art YOLOv8 deep learning models.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link to="/dashboard" className="btn-premium flex items-center gap-2 group w-full sm:w-auto text-center justify-center">
            <span>Access Dashboard</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <Link to="/detect" className="px-6 py-3 rounded-xl border border-slate-700 bg-slate-900/40 text-slate-300 hover:text-white hover:bg-slate-900 transition-all duration-300 w-full sm:w-auto text-center">
            Run AI Scanner
          </Link>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="max-w-5xl mx-auto rounded-2xl border border-white/5 glass-panel p-2 shadow-2xl relative shadow-indigo-500/5 group">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 to-cyan-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          <div className="bg-slate-950/80 rounded-xl overflow-hidden aspect-[16/9] flex items-center justify-center border border-slate-900">
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-indigo-400 animate-pulse">
                <Camera className="h-8 w-8" />
              </div>
              <p className="text-slate-400 font-medium max-w-sm text-sm">
                Upload image of retail shelf, detect products instantly, and preview real-time bounding boxes with precision scoring.
              </p>
              <Link to="/detect" className="inline-flex items-center gap-1.5 text-xs text-indigo-400 font-semibold hover:text-indigo-300 transition-colors">
                Try Uploading an Image <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-t border-slate-900/60 relative z-10">
        <h2 className="text-3xl font-bold text-center text-slate-100 mb-12">System Core Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, idx) => (
            <div 
              key={idx} 
              className={`glass-panel p-8 rounded-2xl border border-white/5 bg-gradient-to-b ${feature.color} flex flex-col items-start gap-4 transition-all duration-300 hover:scale-[1.01] hover:border-white/10`}
            >
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-100">{feature.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Small Tech Spec Showcase */}
      <section className="max-w-7xl mx-auto px-6 py-10 mb-12 text-center text-xs text-slate-500 flex items-center justify-center gap-6 flex-wrap">
        <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-emerald-400" /> YOLOv8 Inference</span>
        <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Flask Backend API</span>
        <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-emerald-400" /> MySQL Integration</span>
        <span className="flex items-center gap-1"><ShieldCheck className="h-4 w-4 text-emerald-400" /> React 19 + Tailwind v3</span>
      </section>
    </div>
  );
};

export default Landing;
