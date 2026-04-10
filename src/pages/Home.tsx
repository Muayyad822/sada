import { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, PenTool, Sparkles, Shuffle, Heart, Moon, Sun, Wind, Flame, Shield, Leaf, Mic, MicOff } from 'lucide-react';
import { mcpService } from '../services/mcpService';
import { quranApi } from '../services/quranApi';
import { userService } from '../services/userService';
import { AudioPlayer } from '../components/AudioEngine/AudioPlayer';
import type { PlaylistItem } from '../components/AudioEngine/AudioPlayer';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

export const Home = () => {
  const { theme } = useTheme();
  const [mood, setMood] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [showJournalTrigger, setShowJournalTrigger] = useState(false);
  const [lastTransformed, setLastTransformed] = useState<{ concept: string; context: string } | null>(null);
  const journalRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (playlist.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [playlist]);

  useEffect(() => {
    if (showJournalTrigger && journalRef.current) {
      journalRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [showJournalTrigger]);
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const toggleVoiceSearch = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setMood(transcript);
      handleMoodSubmit(undefined, transcript);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleMoodSubmit = async (e?: React.FormEvent, manualMood?: string) => {
    if (e) e.preventDefault();
    const targetMood = manualMood || mood;
    if (!targetMood.trim()) return;

    setIsSearching(true);
    try {
      const results = await mcpService.semanticSearch(targetMood);
      
      if (!results || results.length === 0) {
        console.warn("No verses found for:", targetMood);
        setIsSearching(false);
        return;
      }

      // Log the concept for stats
      // We'll extract a simplified concept name for the dashboard
      const concept = results[0].reasoning.split(' ')[0].replace(/[^a-zA-Z]/g, '');
      userService.logThemeSearch(concept || 'Hidayah');
      setLastTransformed({ 
        concept: concept || 'Hidayah', 
        context: results[0].reasoning 
      });
      
      const items: PlaylistItem[] = await Promise.all(
        results.map(async (res) => {
          const verse = await quranApi.getVerseText(res.verse_key);
          const audio = await quranApi.getVerseAudio(7, res.verse_key);
          
          return {
            verse_key: res.verse_key,
            audio_url: audio.url || '',
            text_uthmani: verse.text_uthmani || '',
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

  const handleRandomDiscovery = async () => {
    setIsSearching(true);
    try {
      const results = await mcpService.getRandomVerse();
      
      if (!results || results.length === 0) {
        console.warn("No verses found for random discovery");
        setIsSearching(false);
        return;
      }
      
      const items: PlaylistItem[] = await Promise.all(
        results.map(async (res) => {
          const verse = await quranApi.getVerseText(res.verse_key);
          const audio = await quranApi.getVerseAudio(7, res.verse_key);
          
          return {
            verse_key: res.verse_key,
            audio_url: audio.url || '',
            text_uthmani: verse.text_uthmani || '',
            translation: verse.translations?.[0]?.text || 'Translation unavailable',
            reasoning: res.reasoning
          };
        })
      );

      setPlaylist(items);
      setShowJournalTrigger(false);
      setMood('✨ Random Discovery');
    } catch (error) {
      console.error("Error creating random playlist:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const suggestedMoods = [
    { label: 'Grateful', icon: <Sparkles className={theme === 'dark' ? "text-orange-300" : "text-orange-600"} />, desc: 'Count your blessings' },
    { label: 'Anxious', icon: <Wind className={theme === 'dark' ? "text-blue-300" : "text-blue-600"} />, desc: 'Find your calm' },
    { label: 'Searching', icon: <Search className={theme === 'dark' ? "text-emerald-300" : "text-emerald-600"} />, desc: 'Seek guidance' },
    { label: 'Overwhelmed', icon: <BookOpen className={theme === 'dark' ? "text-purple-300" : "text-purple-600"} />, desc: 'Find your rest' },
    { label: 'Lazy', icon: <Leaf className={theme === 'dark' ? "text-green-300" : "text-green-600"} />, desc: 'Find motivation' },
    { label: 'Lonely', icon: <Heart className={theme === 'dark' ? "text-rose-300" : "text-rose-600"} />, desc: 'Feel His presence' },
    { label: 'Tired', icon: <Moon className={theme === 'dark' ? "text-indigo-300" : "text-indigo-600"} />, desc: 'Renew your strength' },
    { label: 'Confused', icon: <Sun className={theme === 'dark' ? "text-yellow-300" : "text-yellow-600"} />, desc: 'Find clarity' },
    { label: 'Disappointed', icon: <Flame className={theme === 'dark' ? "text-red-300" : "text-red-600"} />, desc: 'Rediscover hope' },
    { label: 'Lost', icon: <Shield className={theme === 'dark' ? "text-teal-300" : "text-teal-600"} />, desc: 'Find your path' },
    { label: 'Guilty', icon: <Sparkles className={theme === 'dark' ? "text-amber-300" : "text-amber-600"} />, desc: 'Find forgiveness' },
    { label: 'Hopeful', icon: <Sparkles className={theme === 'dark' ? "text-cyan-300" : "text-cyan-600"} />, desc: 'Embrace the light' }
  ];

  return (
    <div className="flex flex-col gap-12 max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-3xl sm:text-4xl md:text-7xl font-black text-sada-sand-50 tracking-tighter leading-[1.1]">
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
          className="hero-input-container mt-8 md:mt-12 max-w-2xl mx-auto shadow-2xl shadow-sada-emerald-900/10 group !overflow-hidden"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              placeholder={isRecording ? "Listening to your heart..." : "Feeling a bit lost, anxious, grateful..."}
              className={`hero-input w-full ${isRecording ? 'animate-pulse text-sada-emerald-400' : ''}`}
            />
            {isRecording && (
              <div className="absolute inset-0 pointer-events-none rounded-full ring-4 ring-sada-emerald-500/20 animate-ping" />
            )}
          </div>
          
          <div className="flex items-center gap-2 pr-2">
            <button
              type="button"
              onClick={toggleVoiceSearch}
              className={`p-4 rounded-full transition-all duration-500 ${isRecording ? 'bg-red-500 text-white' : 'text-sada-sand-200/40 hover:text-sada-sand-200 hover:bg-white/5'}`}
            >
              {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
            <button 
              type="submit"
              disabled={isSearching || isRecording}
              className="btn-primary flex items-center justify-center p-2.5 rounded-full md:rounded-full md:px-8 md:py-4 transition-all min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sada-emerald-950" />
              ) : (
                <Search size={20} />
              )}
              <span className="hidden md:inline ml-2 whitespace-nowrap">{isSearching ? 'Seeking...' : 'Find Peace'}</span>
            </button>
          </div>
        </motion.form>
      </section>

      {/* Audio Player Section */}
      <AnimatePresence>
        {playlist.length > 0 && (
          <motion.section 
            ref={resultsRef}
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
          ref={journalRef}
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
              onClick={() => {
                const url = new URL('/reflection', window.location.origin);
                url.searchParams.set('verse', playlist[0].verse_key);
                if (lastTransformed) {
                  url.searchParams.set('feeling', mood);
                  url.searchParams.set('echo', lastTransformed.context);
                }
                window.location.href = url.toString();
              }}
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
          
          {/* Random Discovery Button */}
          <div className="flex justify-center">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              onClick={handleRandomDiscovery}
              disabled={isSearching}
              className="glass-card px-8 py-4 group flex items-center gap-3 hover:bg-sada-sand-200/5 hover:border-sada-sand-200/30 transition-all"
            >
              <Shuffle size={20} className={theme === 'dark' ? "text-purple-300" : "text-purple-600"} />
              <div className="text-left">
                <span className="block text-sada-sand-200/60 text-[10px] font-black uppercase tracking-[0.2em] transition-colors">Feeling Adventurous?</span>
                <span className="text-lg font-black text-sada-sand-50 tracking-tight group-hover:text-sada-sand-200 transition-colors">Random Discovery</span>
              </div>
            </motion.button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {suggestedMoods.map((m, idx) => (
              <motion.button 
                key={m.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + (idx * 0.05) }}
                onClick={() => { setMood(m.label); handleMoodSubmit(undefined, m.label); }}
                className="glass-card p-4 sm:p-6 group hover:bg-sada-sand-200/5 hover:border-sada-sand-200/20 transition-all text-left"
              >
                <div className="mb-3 opacity-40 group-hover:opacity-100 transition-opacity">
                  {m.icon}
                </div>
                <span className="block mb-1 text-sada-sand-200/60 text-[9px] font-black uppercase tracking-[0.15em] transition-colors">Spiritual Antidote</span>
                <span className="block text-xl font-black text-sada-sand-50 tracking-tight group-hover:text-sada-sand-200 transition-colors mb-1">{m.label}</span>
                <span className="text-xs text-sada-sand-100/50 group-hover:text-sada-sand-100/70 transition-colors">{m.desc}</span>
              </motion.button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
