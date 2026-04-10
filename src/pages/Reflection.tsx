import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PenTool, Sparkles } from 'lucide-react';
import { Journal } from '../components/TadabburJournal/Journal';
import { motion } from 'framer-motion';

export const Reflection: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const verseKey = searchParams.get('verse') || '1:1';
  const initialContext = {
    feeling: searchParams.get('feeling') || '',
    echo: searchParams.get('echo') || ''
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col gap-12 py-8 max-w-5xl mx-auto px-6"
    >
      {/* Navigation */}
      <div className="flex justify-between items-center w-full">
         <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-3 text-sada-sand-200/40 hover:text-sada-sand-200 transition-colors uppercase text-[10px] font-black tracking-[0.3em]"
        >
          <ArrowLeft size={18} />
          Back to Player
        </button>
        <div className="text-sada-sand-200/20 text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 bg-white/5 py-2 px-6 rounded-full border border-white/5">
           <PenTool size={14} className="text-sada-sand-200/50" />
           Tadabbur Journal Entry
        </div>
      </div>

      {/* Header */}
      <section className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-black text-sada-sand-50 tracking-tighter drop-shadow-2xl">
          Reflect on <span className="text-transparent bg-clip-text bg-gradient-to-r from-sada-sand-200 to-sada-sand-100">{verseKey}</span>
        </h1>
        <p className="text-sada-sand-100/40 text-lg md:text-xl font-medium max-w-xl mx-auto italic">
          "Take a moment to capture what Allah is whispering to your heart."
        </p>
      </section>

      {/* Journal Component */}
      <section>
        <Journal 
          verseKey={verseKey} 
          initialContext={initialContext}
          onSaved={() => {
            console.log("Reflection saved!");
          }}
        />
      </section>

      {/* Encouragement */}
      <div className="flex items-center justify-center gap-6 py-10">
        <div className="h-px bg-sada-sand-100/10 flex-1" />
        <div className="flex items-center gap-3 text-sada-sand-200/20">
          <Sparkles size={24} />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Spiritually Grounded Reflection</span>
        </div>
        <div className="h-px bg-sada-sand-100/10 flex-1" />
      </div>
    </motion.div>
  );
};
