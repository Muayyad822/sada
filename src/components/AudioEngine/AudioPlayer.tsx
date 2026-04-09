import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Headphones } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface PlaylistItem {
  verse_key: string;
  audio_url: string;
  text_uthmani: string;
  translation: string;
  reasoning?: string;
}

interface AudioPlayerProps {
  playlist: PlaylistItem[];
  onComplete?: () => void;
}

export const AudioPlayer = ({ playlist, onComplete }: AudioPlayerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentItem = playlist[currentIndex];

  useEffect(() => {
    if (audioRef.current && currentItem.audio_url) {
      setError(null);
      if (isPlaying) {
        audioRef.current.play().catch(e => {
          console.error("Playback error:", e);
          if (e.name === 'NotSupportedError' || e.name === 'NotAllowedError') {
            setError("Audio playback blocked or unsupported. Please check your browser settings.");
            setIsPlaying(false);
          }
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentIndex, currentItem.audio_url]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(p || 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    if (currentIndex < playlist.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsPlaying(false);
      if (onComplete) onComplete();
    }
  };

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (!currentItem) return null;

  return (
    <div className="glass-card p-10 md:p-16 w-full shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] relative overflow-hidden group/player">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/player:opacity-10 transition-opacity">
        <Headphones size={120} />
      </div>

      <audio
        key={currentItem.audio_url}
        ref={audioRef}
        src={currentItem.audio_url}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={() => setError("Failed to load audio source. The verse might be temporarily unavailable.")}
      />
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Error Overlay */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-0 z-50 flex items-center justify-center p-8 text-center bg-sada-slate-950/90 backdrop-blur-md rounded-2xl"
            >
              <div className="space-y-4">
                 <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto">
                    <Volume2 size={32} />
                 </div>
                 <h3 className="text-xl font-bold text-sada-sand-50">Playback Issue</h3>
                 <p className="text-sada-sand-100/60 max-w-xs mx-auto text-sm">{error}</p>
                 <button 
                  onClick={() => { setError(null); setIsPlaying(true); }}
                  className="btn-primary w-full"
                 >
                   Try Again
                 </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Progress & Metadata Overlay */}
        <div className="w-full flex justify-between items-center mb-12">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-sada-sand-200 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sada-sand-200/60">Live Recitation</span>
           </div>
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sada-sand-100/30">{currentIndex + 1} / {playlist.length} Verses</span>
        </div>

        {/* Verse Content */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentItem.verse_key}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center mb-14 w-full"
          >
            <h2 className="quran-text text-5xl md:text-7xl mb-10 leading-[1.8] text-sada-sand-50 drop-shadow-xl">
              {currentItem.text_uthmani}
            </h2>
            <div className="max-w-2xl mx-auto space-y-4">
              <p className="text-xl md:text-2xl text-sada-sand-100 font-medium leading-relaxed italic">
                "{currentItem.translation}"
              </p>
              <div className="flex items-center justify-center gap-4 text-sada-sand-200/40 text-xs font-black uppercase tracking-widest pt-4">
                <div className="h-px bg-sada-sand-200/10 w-8" />
                Verse {currentItem.verse_key}
                <div className="h-px bg-sada-sand-200/10 w-8" />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Playback Controls */}
        <div className="w-full max-w-xl mx-auto space-y-10">
          {/* Progress Bar Container */}
          <div className="space-y-3">
            <div className="h-2 w-full bg-sada-slate-950 rounded-full overflow-hidden border border-white/5 relative group/bar cursor-pointer">
              <motion.div 
                className="h-full bg-gradient-to-r from-sada-emerald-700 to-sada-sand-200 rounded-full shadow-[0_0_10px_rgba(253,230,138,0.3)]" 
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-sada-sand-200/30">
              <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-12">
            <button 
              onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)} 
              disabled={currentIndex === 0}
              className="p-4 text-sada-sand-100/30 disabled:opacity-30 hover:text-sada-sand-200 transition-all hover:scale-110"
            >
              <SkipBack size={32} fill="currentColor" />
            </button>
            
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-24 h-24 bg-sada-sand-200 text-sada-emerald-950 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-[0_0_40px_rgba(253,230,138,0.2)] hover:shadow-sada-sand-200/40"
            >
              {isPlaying ? <Pause size={42} fill="currentColor" /> : <Play size={42} className="ml-1" fill="currentColor" />}
            </button>

            <button 
              onClick={() => currentIndex < playlist.length - 1 && setCurrentIndex(currentIndex + 1)} 
              disabled={currentIndex === playlist.length - 1}
              className="p-4 text-sada-sand-100/30 disabled:opacity-30 hover:text-sada-sand-200 transition-all hover:scale-110"
            >
              <SkipForward size={32} fill="currentColor" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 text-sada-sand-100/20">
             <Volume2 size={16} />
             <div className="w-32 h-1 bg-sada-slate-950 rounded-full overflow-hidden border border-white/5">
                <div className="h-full bg-sada-sand-200/20 w-3/4" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
