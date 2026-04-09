import { useState, useEffect } from 'react';
import { Flame, BarChart3, TrendingUp, Sparkles, User, Award, Clock, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import { userService } from '../../services/userService';
import type { UserStats } from '../../services/userService';

export const Dashboard = () => {
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const s = await userService.getUserStats();
      setStats(s);
    };
    fetchStats();
  }, []);

  if (!stats) return null;

  return (
    <div className="flex flex-col gap-10 w-full max-w-6xl mx-auto">
      {/* Header Profile Section */}
      <div className="glass-card p-10 md:p-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-sada-sand-200/5 blur-[100px] -z-10 group-hover:bg-sada-sand-200/10 transition-colors" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <motion.div 
              whileHover={{ rotate: 5, scale: 1.05 }}
              className="w-20 h-20 bg-gradient-to-br from-sada-sand-200 to-sada-sand-100 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-sada-sand-200/20"
            >
              <User size={40} className="text-sada-emerald-950" />
            </motion.div>
            <div className="space-y-1">
              <h2 className="text-4xl font-black text-sada-sand-50 tracking-tighter">Salaam, Abdallah</h2>
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-sada-emerald-700" />
                 <p className="text-sada-sand-100/40 text-xs font-bold uppercase tracking-[0.2em]">Spiritual Habit Level: Seeker</p>
              </div>
            </div>
          </div>
          
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-6 px-10 py-6 bg-sada-slate-950/80 rounded-[2.5rem] border-2 border-orange-500/20 shadow-2xl relative group/flame"
          >
            <div className="relative">
              <Flame size={48} className="text-orange-500 animate-pulse relative z-10" fill="currentColor" />
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 blur-2xl bg-orange-400 rounded-full z-0"
              />
            </div>
            <div>
              <span className="block text-4xl font-black text-sada-sand-50 tracking-tighter leading-none">{stats.streak_count} Days</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-400/60 mt-2 block">Ramadan Momentum</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
        {/* Large Momentum Visualization */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="lg:col-span-8 glass-card p-12 bg-gradient-to-br from-sada-slate-900/60 to-sada-emerald-900/10 flex flex-col justify-between overflow-hidden relative group/hero"
        >
          <div className="absolute -right-20 -bottom-20 opacity-5 group-hover/hero:opacity-10 transition-all duration-700 group-hover/hero:-translate-y-10 group-hover/hero:-translate-x-10">
            <TrendingUp size={300} />
          </div>
          
          <div className="relative z-10">
            <h3 className="text-xl font-bold flex items-center gap-3 mb-10 text-sada-sand-200/40 font-ui uppercase tracking-[0.4em] text-[10px]">
              <Target size={14} /> Goal Completion
            </h3>
            
            <div className="space-y-4 mb-12">
               <div className="flex items-baseline gap-4">
                 <span className="text-8xl font-black text-sada-sand-50 tracking-tighter tabular-nums drop-shadow-2xl">{stats.ramadan_momentum}%</span>
                 <p className="text-sada-sand-100/30 text-lg font-medium italic max-w-xs">Of your post-Ramadan spiritual intensity maintained.</p>
               </div>
            </div>
            
            {/* ProgressBar */}
            <div className="w-full space-y-4">
              <div className="w-full h-10 bg-sada-slate-950 rounded-[1.5rem] p-2 border border-white/5 shadow-inner">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${stats.ramadan_momentum}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-sada-sand-100 via-sada-sand-200 to-sada-emerald-700 rounded-xl shadow-lg relative overflow-hidden"
                >
                   <motion.div 
                    animate={{ left: ["-100%", "200%"] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                    className="absolute top-0 w-1/3 h-full bg-white/30 blur-xl -skew-x-12" 
                  />
                </motion.div>
              </div>
              <div className="flex justify-between px-4 text-[10px] font-black text-sada-sand-200/30 uppercase tracking-[0.3em]">
                 <span>Beginning</span>
                 <span>Illumination</span>
              </div>
            </div>
          </div>
          
          <div className="mt-12 flex items-center gap-4 p-8 bg-sada-sand-200/5 rounded-[2rem] border border-white/5 relative z-10">
            <div className="w-12 h-12 bg-sada-sand-200/10 rounded-full flex items-center justify-center text-sada-sand-200">
               <Sparkles size={24} />
            </div>
            <p className="text-sada-sand-100 font-medium leading-relaxed italic">
               "Your heart has maintained a steady rhythm of remembrance. You are in the top 15% of consistent Seekers this month."
            </p>
          </div>
        </motion.div>

        {/* Breakdown Card */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="lg:col-span-4 glass-card p-12 bg-sada-slate-900/40 flex flex-col justify-between"
        >
          <div>
            <h3 className="text-xl font-bold flex items-center gap-3 mb-10 text-sada-sand-200/40 font-ui uppercase tracking-[0.4em] text-[10px]">
              <BarChart3 size={14} /> Activity Mix
            </h3>
            
            <div className="space-y-12">
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-sada-sand-100 flex items-center gap-3 font-bold group">
                    <div className="w-3 h-3 rounded-full bg-sada-sand-200 shadow-[0_0_10px_rgba(253,230,138,0.5)]" /> 
                    Tilawah
                  </span>
                  <span className="text-2xl font-black text-sada-sand-50 tabular-nums">{stats.tilawah_minutes}m</span>
                </div>
                <div className="w-full h-3 bg-sada-slate-950 rounded-full overflow-hidden p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '70%' }}
                    className="h-full bg-sada-sand-200 rounded-full" 
                  />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-sada-sand-100 flex items-center gap-3 font-bold">
                    <div className="w-3 h-3 rounded-full bg-sada-emerald-700 shadow-[0_0_10px_rgba(4,120,87,0.5)]" /> 
                    Tadabbur
                  </span>
                  <span className="text-2xl font-black text-sada-sand-50 tabular-nums">{stats.tadabbur_minutes}m</span>
                </div>
                <div className="w-full h-3 bg-sada-slate-950 rounded-full overflow-hidden p-0.5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: '30%' }}
                    className="h-full bg-sada-emerald-700 rounded-full" 
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-10 mt-10 border-t border-sada-sand-100/5 flex justify-between items-center group">
             <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-sada-sand-200/30 uppercase tracking-[0.3em]">Total Focus</span>
                <div className="flex items-baseline gap-2">
                   <span className="text-4xl font-black text-sada-sand-50 tracking-tighter">{stats.tilawah_minutes + stats.tadabbur_minutes}</span>
                   <span className="text-xs font-bold text-sada-sand-100/20 uppercase tracking-widest">Minutes</span>
                </div>
             </div>
             <motion.div 
               whileHover={{ rotate: 15 }}
               className="p-4 bg-sada-sand-200/5 rounded-2xl group-hover:bg-sada-sand-200/10 transition-colors"
             >
                <Award size={32} className="text-sada-sand-200/30" />
             </motion.div>
          </div>
        </motion.div>

        {/* Small Data Points */}
        <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
           {[
             { label: 'Weekly ListenTime', value: '4.2h', icon: <Clock /> },
             { label: 'Deep Reflections', value: '12', icon: <Sparkles /> },
             { label: 'Consistency Score', value: 'A+', icon: <TrendingUp /> },
             { label: 'Sada Community', value: 'Top 5%', icon: <Award /> }
           ].map((item, i) => (
             <motion.div 
               key={item.label}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 * i }}
               className="glass-card p-8 group border-transparent hover:border-sada-sand-200/10 transition-colors"
             >
                <div className="text-sada-sand-100/20 mb-6 group-hover:text-sada-sand-200 transition-colors">
                  {item.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sada-sand-200/30 block mb-1">{item.label}</span>
                <span className="text-2xl font-black text-sada-sand-50 tracking-tight">{item.value}</span>
             </motion.div>
           ))}
        </div>
      </div>
    </div>
  );
};
