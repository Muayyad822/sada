import { Dashboard } from '../components/HabitDashboard/Dashboard';
import { motion } from 'framer-motion';
import { userService } from '../services/userService';
import { useEffect, useState } from 'react';
import { Award, MapPin } from 'lucide-react';

export const Stats: React.FC = () => {
  const [themeStats, setThemeStats] = useState<Record<string, number>>({});
  const [badges, setBadges] = useState<string[]>([]);
  const [cycleProgress, setCycleProgress] = useState(0);

  useEffect(() => {
    setThemeStats(userService.getThemeStats());
    setBadges(userService.getBadges());
    const uniqueThemes = Object.keys(userService.getThemeStats()).length;
    setCycleProgress((uniqueThemes % 3) / 3 * 100 || (uniqueThemes > 0 ? 100 : 0));
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
        

      </div>

      {/* Emotional Cycle & Badges */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-10 bg-gradient-to-br from-sada-slate-900 to-sada-emerald-900/20 border-sada-sand-200/10 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:rotate-12 transition-all">
              <Award size={120} />
           </div>
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-sada-emerald-400 mb-6 block">Emotional Cycle Progress</span>
           <h3 className="text-4xl font-black text-white mb-4">Khatm of the Soul</h3>
           <p className="text-sada-sand-100/60 mb-8 max-w-md">Complete a cycle by reflecting on 3 distinct spiritual themes (concepts) to earn a new badge.</p>
           
           <div className="space-y-4">
              <div className="flex justify-between items-end mb-2">
                 <span className="text-xs font-black uppercase text-sada-sand-200/40">Current Cycle</span>
                 <span className="text-xl font-black text-sada-sand-100">{Math.round(cycleProgress)}%</span>
              </div>
              <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${cycleProgress}%` }}
                    className="h-full bg-gradient-to-r from-sada-emerald-600 to-sada-sand-200"
                 />
              </div>
           </div>
        </div>

        <div className="glass-card p-8 bg-dark/50 border-sada-sand-200/10">
           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-sada-sand-200/40 mb-8 block">Unlocked Badges</span>
           <div className="space-y-4">
              {badges.length > 0 ? badges.map(badge => (
                <div key={badge} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-sada-sand-200/20 transition-all">
                   <div className="w-10 h-10 rounded-full bg-sada-sand-200/10 flex items-center justify-center text-sada-sand-200">
                      <Award size={20} />
                   </div>
                   <span className="font-bold text-sada-sand-100">{badge}</span>
                </div>
              )) : (
                <div className="text-center py-8 opacity-20 italic text-sm">No badges earned yet.</div>
              )}
           </div>
        </div>
      </section>

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






    </div>
  );
};
