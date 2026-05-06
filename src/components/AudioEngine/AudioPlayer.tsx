import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, Headphones, CloudRain, TreePine, Heart, Smartphone } from 'lucide-react';
import { userService } from '../../services/userService';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

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
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isCommuteMode, setIsCommuteMode] = useState(false);
  const [ambientTrack, setAmbientTrack] = useState<'none' | 'rain' | 'forest'>('none');
  const [isHearted, setIsHearted] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ambientRef = useRef<HTMLAudioElement | null>(null);

  const currentItem = playlist[currentIndex];

  if (!currentItem) {
    return null;
  }

  useEffect(() => {
    userService.isInCollection(currentItem.verse_key).then(setIsHearted);
  }, [currentIndex, currentItem.verse_key]);

  useEffect(() => {
    if (audioRef.current) {
      setError(null);
      
      if (isPlaying) {
        if (!currentItem?.audio_url) {
          setError("This verse is currently unavailable in the chosen recitation style.");
          setIsPlaying(false);
          return;
        }

        audioRef.current.play().catch(e => {
          console.error("Playback error caught in AudioPlayer:", e);
          if (e.name === 'NotSupportedError' || e.name === 'NotAllowedError') {
            setError("Audio format unsupported or playback blocked by browser settings.");
            setIsPlaying(false);
          } else {
            setError("An unexpected error occurred during playback.");
            setIsPlaying(false);
          }
        });

        if (ambientRef.current && ambientTrack !== 'none') {
            ambientRef.current.play().catch(() => {});
        }
      } else {
        audioRef.current.pause();
        if (ambientRef.current) ambientRef.current.pause();
      }
    }
  }, [isPlaying, currentIndex, currentItem.audio_url, ambientTrack]);

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

  const toggleHeart = async () => {
    const success = await userService.addToCollection(currentItem.verse_key);
    if (success) setIsHearted(true);
  };

  const ambientSources = {
    rain: 'https://cdn.pixabay.com/audio/2022/03/17/audio_0970a3c20c.mp3',
    forest: 'https://cdn.pixabay.com/audio/2021/08/09/audio_884b9cbc5f.mp3'
  };

  if (!currentItem) return null;

  return (
    <div className={`glass-card p-6 md:p-12 w-full relative overflow-hidden group/player transition-all duration-700 ${isCommuteMode ? 'bg-sada-slate-900 border-sada-sand-200/40 translate-y-[-10px] shadow-2xl scale-[1.02]' : ''}`}>
      {/* Ambient Audio Element */}
      {ambientTrack !== 'none' && (
        <audio 
          ref={ambientRef} 
          src={ambientSources[ambientTrack as keyof typeof ambientSources]} 
          loop 
          autoPlay={isPlaying}
        />
      )}
      {/* Background Decor */}
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover/player:opacity-10 transition-opacity">
        <Headphones size={120} />
      </div>

      <audio
        key={currentItem?.audio_url || `verse-${currentIndex}`}
        ref={audioRef}
        src={currentItem?.audio_url}
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
              className="absolute inset-0 z-50 flex items-center justify-center p-8 text-center bg-sada-slate-950/95 backdrop-blur-2xl rounded-2xl bg-dark"
            >
              <div className="space-y-4">
                 <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mx-auto">
                    <Volume2 size={32} />
                 </div>
                 <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.8 }}
                  className="text-lg md:text-2xl text-sada-sand-100/80 italic font-serif text-center mt-6 px-4"
                >
                  "{playlist[currentIndex].translation || 'Translation unavailable'}"
                </motion.p>
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
        <div className="w-full flex justify-between items-center mb-8">
           <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsCommuteMode(!isCommuteMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${isCommuteMode ? 'bg-sada-sand-200 text-sada-emerald-950 border-sada-sand-200' : 'text-sada-sand-200/40 border-sada-sand-200/10 hover:border-sada-sand-200/30'}`}
              >
                <Smartphone size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">{isCommuteMode ? 'Commute On' : 'Commute Mode'}</span>
              </button>
              
              {!isCommuteMode && (
                <div className="flex items-center gap-2 border-l border-white/10 pl-4 ml-2">
                  <button 
                    onClick={() => setAmbientTrack(ambientTrack === 'rain' ? 'none' : 'rain')}
                    className={`p-1.5 rounded-full transition-all ${ambientTrack === 'rain' ? 'bg-blue-500/20 text-blue-300' : 'text-white/20 hover:text-white/40'}`}
                    title="Rain Soundscape"
                  >
                    <CloudRain size={16} />
                  </button>
                  <button 
                    onClick={() => setAmbientTrack(ambientTrack === 'forest' ? 'none' : 'forest')}
                    className={`p-1.5 rounded-full transition-all ${ambientTrack === 'forest' ? 'bg-emerald-500/20 text-emerald-300' : 'text-white/20 hover:text-white/40'}`}
                    title="Forest Soundscape"
                  >
                    <TreePine size={16} />
                  </button>
                </div>
              )}
           </div>

           <div className="flex items-center gap-4">
            <button 
              onClick={toggleHeart}
              className={`p-2 transition-all ${isHearted ? 'text-rose-500 scale-125' : 'text-white/20 hover:text-white/60'}`}
            >
              <Heart size={20} fill={isHearted ? "currentColor" : "none"} />
            </button>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sada-sand-100/60 transition-colors">{currentIndex + 1} / {playlist.length} Verses</span>
           </div>
        </div>

        {/* Verse Content */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentItem.verse_key}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -100) {
                if (currentIndex < playlist.length - 1) setCurrentIndex(currentIndex + 1);
              } else if (info.offset.x > 100) {
                if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
              }
            }}
            className={`text-center w-full cursor-grab active:cursor-grabbing ${isCommuteMode ? 'py-12' : 'mb-14'}`}
          >
            <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="quran-text text-3xl md:text-5xl leading-[1.8] text-center px-4"
                >
                  {currentItem.text_uthmani}
                </motion.div>
            <div className="max-w-2xl mx-auto space-y-4">
              <p className={`text-sada-sand-100 font-medium leading-relaxed italic ${isCommuteMode ? 'text-2xl md:text-4xl' : 'text-xl md:text-2xl'}`}>
                "{currentItem.translation}"
              </p>
              
              {currentItem.reasoning && (
                <div className="pt-6 mt-6 border-t border-sada-sand-200/10">
                   <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sada-emerald-400/60 block mb-3">Divine Echo</span>
                   <p className="text-sm md:text-lg text-sada-sand-100/70 font-medium leading-relaxed">
                    {currentItem.reasoning}
                  </p>
                </div>
              )}

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
            <div className="h-2 w-full progress-track rounded-full overflow-hidden border border-white/5 relative group/bar cursor-pointer bg-dark transition-colors duration-500">
              <motion.div 
                className="h-full bg-gradient-to-r from-sada-emerald-700 to-sada-sand-200 rounded-full shadow-[0_0_15px_rgba(4,120,87,0.3)]" 
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-sada-sand-200/50 transition-colors">
              <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-12">
            <button 
              onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)} 
              disabled={currentIndex === 0}
              className="p-3 md:p-4 text-sada-sand-100/60 disabled:opacity-20 hover:text-sada-sand-200 transition-all hover:scale-110"
            >
              <SkipBack size={28} className="md:w-[32px] md:h-[32px]" fill="currentColor" />
            </button>
            
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-20 h-20 md:w-24 md:h-24 bg-sada-sand-200 text-sada-emerald-950 rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-sada-sand-200/40"
            >
              {isPlaying ? <Pause size={36} className="md:w-[42px] md:h-[42px]" fill={theme === 'dark' ? "currentColor" : "white"} /> : <Play size={36} className="ml-1 md:w-[42px] md:h-[42px]" fill={theme === 'dark' ? "currentColor" : "white"} />}
            </button>

            <button 
              onClick={() => currentIndex < playlist.length - 1 && setCurrentIndex(currentIndex + 1)} 
              disabled={currentIndex === playlist.length - 1}
              className="p-3 md:p-4 text-sada-sand-100/60 disabled:opacity-20 hover:text-sada-sand-200 transition-all hover:scale-110"
            >
              <SkipForward size={28} className="md:w-[32px] md:h-[32px]" fill="currentColor" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 text-sada-sand-100/40 transition-colors">
             <Volume2 size={16} />
             <div className="w-32 h-1 progress-track rounded-full overflow-hidden border border-white/5 bg-dark">
                <div className="h-full bg-sada-emerald-700/40 w-3/4" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
