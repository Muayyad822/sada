import { useState } from 'react';
import { Search, BookOpen, PenTool, Sparkles, Clock } from 'lucide-react';
import { mcpService } from '../services/mcpService';
import { quranApi } from '../services/quranApi';
import { AudioPlayer } from '../components/AudioEngine/AudioPlayer';
import type { PlaylistItem } from '../components/AudioEngine/AudioPlayer';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

export const Home = () => {
  const { theme } = useTheme();
  const [mood, setMood] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [showJournalTrigger, setShowJournalTrigger] = useState(false);

  const handleMoodSubmit = async (e?: React.FormEvent, manualMood?: string) => {
    if (e) e.preventDefault();
    const targetMood = manualMood || mood;
    if (!targetMood.trim()) return;

    setIsSearching(true);
    try {
      const results = await mcpService.semanticSearch(targetMood);
      const items: PlaylistItem[] = await Promise.all(
        results.map(async (res) => {
          const verse = await quranApi.getVerseText(res.verse_key);
          const audio = await quranApi.getVerseAudio(7, res.verse_key);
          
          return {
            verse_key: res.verse_key,
            audio_url: audio.url,
            text_uthmani: verse.text_uthmani,
            translation: verse.translations?.[0]?.text || 'Translation unavailable',
            reasoning: res.reasoning
          };
        })
      );

      setPlaylist(items);
      setShowJournalTrigger(false);
    } catch (error) {
      console.error("Error creating mood playlist:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="flex flex-col gap-12 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-7xl font-black text-sada-sand-50 tracking-tighter leading-[1.1]">
            How are you feeling <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sada-sand-200 to-sada-sand-100">spiritually</span> today?
          </h1>
          <p className="text-sada-sand-100/60 text-lg md:text-xl font-medium mt-6 max-w-2xl mx-auto transition-colors">
            Connect your current state with the timeless wisdom of the Quran.
          </p>
        </motion.div>
        
        <motion.form 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          onSubmit={handleMoodSubmit} 
          className="hero-input-container mt-12 max-w-2xl mx-auto shadow-2xl shadow-sada-emerald-900/10 group"
        >
          <input
            type="text"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            placeholder="Grateful, Anxious, Seeking guidance..."
            className="hero-input"
          />
          <button 
            type="submit"
            disabled={isSearching}
            className="btn-primary flex items-center gap-2"
          >
            {isSearching ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sada-emerald-950" /> : <Search size={22} />}
            <span className="hidden sm:inline">{isSearching ? 'Seeking...' : 'Find Peace'}</span>
          </button>
        </motion.form>
      </section>

      {/* Audio Player Section */}
      <AnimatePresence>
        {playlist.length > 0 && (
          <motion.section 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full"
          >
            <AudioPlayer 
              playlist={playlist} 
              onComplete={() => setShowJournalTrigger(true)}
            />
          </motion.section>
        )}
      </AnimatePresence>

      {/* Journal Prompt */}
      {showJournalTrigger && (
        <motion.section 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className={`glass-card p-12 max-w-2xl mx-auto border-sada-sand-200/20 transition-colors duration-500 ${theme === 'dark' ? 'bg-sada-emerald-900/10 hover:bg-sada-emerald-900/20' : 'bg-sada-emerald-800/5 hover:bg-sada-emerald-800/10'}`}>
            <BookOpen size={48} className="text-sada-sand-200 mx-auto mb-6" />
            <h3 className="text-3xl font-black text-sada-sand-50 mb-4 tracking-tight">Deepen Your Reflection</h3>
            <p className="text-sada-sand-100/60 text-lg mb-10 italic font-medium">
              "Every echo of the Quran deserves a home in your heart."
            </p>
            <button 
              onClick={() => window.location.href = '/reflection?verse=' + playlist[0].verse_key}
              className="btn-primary w-full shadow-xl shadow-sada-sand-200/5 group flex items-center justify-center gap-3"
            >
              <PenTool size={22} className="group-hover:rotate-12 transition-transform" />
              <span>Open Tadabbur Journal</span>
            </button>
          </div>
        </motion.section>
      )}

      {/* Suggested Moods Grid */}
      {playlist.length === 0 && (
        <section className="space-y-8 pt-12">
          <div className="flex items-center gap-4">
            <div className="h-px bg-sada-sand-100/10 flex-1" />
            <span className="text-[10px] font-black text-sada-sand-100/60 uppercase tracking-[0.3em] whitespace-nowrap transition-colors">Explore by State</span>
            <div className="h-px bg-sada-sand-100/10 flex-1" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Grateful', icon: <Sparkles className={theme === 'dark' ? "text-orange-300" : "text-orange-600"} /> },
              { label: 'Anxious', icon: <Clock className={theme === 'dark' ? "text-blue-300" : "text-blue-600"} /> },
              { label: 'Searching', icon: <Search className={theme === 'dark' ? "text-emerald-300" : "text-emerald-600"} /> },
              { label: 'Overwhelmed', icon: <BookOpen className={theme === 'dark' ? "text-purple-300" : "text-purple-600"} /> }
            ].map((m, idx) => (
              <motion.button 
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * idx }}
                onClick={() => { setMood(m.label); handleMoodSubmit(undefined, m.label); }}
                className="glass-card p-8 group hover:bg-sada-sand-200/5 hover:border-sada-sand-200/20 transition-all text-left"
              >
                <div className="mb-6 opacity-30 group-hover:opacity-100 transition-opacity">
                  {m.icon}
                </div>
                <span className="block mb-1 text-sada-sand-200/60 text-[10px] font-black uppercase tracking-[0.2em] transition-colors">Contextual Mood</span>
                <span className="text-2xl font-black text-sada-sand-50 tracking-tight group-hover:text-sada-sand-200 transition-colors">{m.label}</span>
              </motion.button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
