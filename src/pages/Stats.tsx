import { Settings, Bell, Sparkles, Compass, MapPin } from 'lucide-react';
import { Dashboard } from '../components/HabitDashboard/Dashboard';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { userService } from '../services/userService';
import { useEffect, useState } from 'react';

export const Stats: React.FC = () => {
  const { theme } = useTheme();
  const [themeStats, setThemeStats] = useState<Record<string, number>>({});

  useEffect(() => {
    setThemeStats(userService.getThemeStats());
  }, []);

  const getThemeColor = (themeName: string) => {
    const colors: Record<string, string> = {
      Sabr: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
      Shukr: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
      Rahmah: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
      Hidayah: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
      Tawakkul: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
      Inshirah: 'text-rose-400 bg-rose-400/10 border-rose-400/20',
      Sakinah: 'text-indigo-400 bg-indigo-400/10 border-indigo-400/20',
    };
    return colors[themeName] || 'text-sada-sand-200 bg-white/5 border-white/10';
  };

  return (
    <div className="flex flex-col gap-12 py-10 max-w-6xl mx-auto px-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3 text-sada-sand-200/40">
             <div className="h-px w-8 bg-sada-sand-200/20" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Spiritual Analytics</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-sada-sand-50 tracking-tighter leading-none">
            Habit <span className="text-transparent bg-clip-text bg-gradient-to-r from-sada-sand-200 to-sada-sand-100">Growth</span>
          </h1>
          <p className="text-sada-sand-100/40 text-xl font-medium italic">Measuring the pulse of your daily devotion.</p>
        </div>
        
        <div className="flex gap-4 mb-2">
           <button className="p-4 bg-sada-slate-900 rounded-2xl text-sada-sand-200 hover:bg-sada-emerald-700 hover:text-white transition-all duration-300 border border-sada-sand-100/10 soft-shadow group bg-dark">
              <Bell size={24} className="group-hover:rotate-12" />
           </button>
           <button className="p-4 bg-sada-slate-900 rounded-2xl text-sada-sand-200 hover:bg-sada-emerald-700 hover:text-white transition-all duration-300 border border-sada-sand-100/10 soft-shadow group bg-dark">
              <Settings size={24} className="group-hover:spin-slow" />
           </button>
        </div>
      </div>

      {/* Stats Breakdown */}
      <section className="mt-10">
        <Dashboard />
      </section>

      {/* Spiritual Landscape */}
      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <div className="h-px bg-sada-sand-100/10 flex-1" />
          <span className="text-[10px] font-black text-sada-sand-100/60 uppercase tracking-[0.3em] whitespace-nowrap">Landscape of the Heart</span>
          <div className="h-px bg-sada-sand-100/10 flex-1" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {Object.entries(themeStats).length > 0 ? (
            Object.entries(themeStats).map(([name, count], idx) => (
              <motion.div
                key={name}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`glass-card p-6 flex flex-col items-center justify-center text-center gap-4 border ${getThemeColor(name)}`}
              >
                <div className="text-3xl font-black mb-1">{count}</div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">{name}</div>
                <div className="w-full h-1 bg-current opacity-20 rounded-full overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 1, delay: idx * 0.1 }}
                    className="h-full bg-current"
                   />
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-sada-sand-100/20">
              <MapPin size={48} className="mx-auto mb-4 opacity-5" />
              <p className="font-medium italic">Begin your emotional journey to map your spiritual landscape.</p>
            </div>
          )}
        </div>
      </section>

      {/* Deep Dive Action Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div 
          whileHover={{ y: -5, scale: 1.02 }}
          className={`glass-card p-12 group cursor-pointer border-sada-sand-200/10 hover:border-sada-sand-200/30 transition-all shadow-2xl overflow-hidden relative ${theme === 'dark' ? 'bg-gradient-to-br from-sada-emerald-900/40 to-sada-slate-900' : 'bg-gradient-to-br from-sada-emerald-800/10 to-sada-slate-900'}`}
        >
          <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-all">
             <Compass size={200} />
          </div>
          <div className="w-16 h-16 bg-sada-sand-200/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-sada-sand-200 transition-all duration-500 shadow-lg">
            <Compass size={32} className="text-sada-sand-200 group-hover:text-sada-emerald-950" />
          </div>
          <h3 className="text-3xl font-black text-sada-sand-50 mb-3 tracking-tight">Explore New Moods</h3>
          <p className="text-sada-sand-100/40 font-medium leading-relaxed max-w-sm">Discover verses for spiritual states you haven't explored yet based on your unique history.</p>
        </motion.div>

        <motion.div 
          whileHover={{ y: -5, scale: 1.02 }}
          className={`glass-card p-12 group cursor-pointer border-sada-sand-200/10 hover:border-sada-sand-200/30 transition-all shadow-2xl overflow-hidden relative ${theme === 'dark' ? 'bg-gradient-to-br from-sada-slate-900 to-sada-emerald-900/40' : 'bg-gradient-to-br from-sada-slate-900 to-sada-emerald-800/10'}`}
        >
          <div className="absolute -right-10 -bottom-10 opacity-5 group-hover:opacity-10 transition-all">
             <Sparkles size={200} />
          </div>
          <div className="w-16 h-16 bg-sada-emerald-600/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-sada-emerald-600 transition-all duration-500 shadow-lg">
            <Sparkles size={32} className="text-sada-emerald-600 group-hover:text-sada-sand-50" />
          </div>
          <h3 className="text-3xl font-black text-sada-sand-50 mb-3 tracking-tight">AI Pattern Analysis</h3>
          <p className="text-sada-sand-100/40 font-medium leading-relaxed max-w-sm">Review your journey and discover thematic patterns across all your recorded reflections.</p>
        </motion.div>
      </section>

      {/* Footer Banner - Wisdom Quote */}
      <div className="text-center py-24 bg-gradient-to-b from-sada-sand-200/5 to-transparent rounded-[4rem] border border-sada-sand-100/5 mt-10 relative overflow-hidden group">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sada-sand-200/5 pointer-events-none"
        >
           <Sparkles size={400} />
        </motion.div>
        
        <div className="relative z-10 space-y-8">
          <Sparkles size={48} className="text-sada-sand-200/20 mx-auto group-hover:scale-110 transition-transform duration-700" />
          <p className="text-sada-sand-50/70 text-2xl font-black max-w-2xl mx-auto italic tracking-tight leading-relaxed px-8">
            "The most beloved of deeds to Allah are those that are most consistent, even if they are small."
          </p>
          <div className="flex items-center justify-center gap-4 text-sada-sand-200/30">
             <div className="h-px w-10 bg-current" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Hadith Bukhari</span>
             <div className="h-px w-10 bg-current" />
          </div>
        </div>
      </div>
    </div>
  );
};
