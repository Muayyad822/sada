import { useState, useEffect } from 'react';
import { Flame, Sparkles, User, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { userService } from '../../services/userService';
import type { UserStats } from '../../services/userService';

export const Dashboard = () => {
  const { theme } = useTheme();
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
      <div className="glass-card p-6 md:p-12 relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-64 h-64 blur-[100px] -z-10 transition-colors duration-1000 ${theme === 'dark' ? 'bg-sada-sand-200/5 group-hover:bg-sada-sand-200/10' : 'bg-sada-sand-200/10'}`} />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 relative z-10">
          <div className="flex items-center gap-6">
            <motion.div 
              whileHover={{ rotate: 5, scale: 1.05 }}
              className={`w-20 h-20 bg-gradient-to-br from-sada-sand-200 to-sada-sand-100 rounded-[2rem] flex items-center justify-center shadow-2xl ${theme === 'dark' ? 'shadow-sada-sand-200/20' : 'shadow-sada-sand-100/10'}`}
            >
              <User size={40} className={theme === 'dark' ? 'text-sada-emerald-950' : 'text-white'} />
            </motion.div>
            <div className="space-y-1">
              <h2 className="text-2xl md:text-4xl font-black text-sada-sand-50 tracking-tighter">Salaam, {userService.getUserName()}</h2>
              <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-sada-emerald-700" />
                  <p className="text-sada-sand-100/40 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em]">Spiritual Habit Level: {stats.streak_count > 0 ? 'Seeker' : 'Beginner'}</p>
               </div>
            </div>
          </div>
          
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="flex items-center gap-6 px-6 py-4 md:px-10 md:py-6 bg-sada-slate-950/80 rounded-[2rem] md:rounded-[2.5rem] border-2 border-orange-500/20 shadow-2xl relative group/flame bg-dark w-full md:w-auto"
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
              <span className="block text-3xl md:text-4xl font-black text-sada-sand-50 tracking-tighter leading-none">{stats.streak_count} Days</span>
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-400 block mt-2">Current Streak</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              { label: 'Weekly ListenTime', value: `${(stats.weekly_minutes / 60).toFixed(1)}h`, icon: <Clock /> },
              { label: 'Deep Reflections', value: stats.reflection_count.toString(), icon: <Sparkles /> }
            ].map((item, i) => (
             <motion.div 
               key={item.label}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.1 * i }}
               className="glass-card p-8 group border-transparent hover:border-sada-sand-200/10 transition-colors"
             >
                <div className="text-sada-sand-100/40 mb-6 group-hover:text-sada-sand-200 transition-colors">
                  {item.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sada-sand-200/50 block mb-1 transition-colors">{item.label}</span>
                <span className="text-2xl font-black text-sada-sand-50 tracking-tight">{item.value}</span>
             </motion.div>
            ))}
      </div>
    </div>
  );
};
