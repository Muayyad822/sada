import { useState, useEffect, useRef } from 'react';
import { BookOpen, Quote, Save, Loader2, CheckCircle2, Mic, MicOff, Sparkles } from 'lucide-react';
import { quranApi } from '../../services/quranApi';
import { mcpService } from '../../services/mcpService';
import { userService } from '../../services/userService';
import type { Reflection } from '../../services/userService';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

interface JournalProps {
  verseKey: string;
  onSaved?: (reflection: Reflection) => void;
}

export const Journal = ({ verseKey, onSaved }: JournalProps) => {
  const { theme } = useTheme();
  const [tafsir, setTafsir] = useState<{ text: string } | null>(null);
  const [verseText, setVerseText] = useState<{ text_uthmani: string; translations: any[] } | null>(null);
  const [reflection, setReflection] = useState('');
  const [aiQuestion, setAiQuestion] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const aiQuestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (aiQuestion && aiQuestionRef.current) {
      aiQuestionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [aiQuestion]);

  useEffect(() => {
    const fetchData = async () => {
      const v = await quranApi.getVerseText(verseKey);
      setVerseText(v);
      const t = await quranApi.getTafsir(verseKey);
      setTafsir(t);
    };
    fetchData();
  }, [verseKey]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Voice recording not supported in this browser');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ar-SA';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          }
        }
        if (finalTranscript) {
          setReflection(prev => prev + finalTranscript);
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (error) {
      console.warn('Failed to start voice recording');
    }
  };

  const stopVoiceRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
  };

  const handleReflect = async () => {
    if (!reflection.trim()) return;
    setIsAnalyzing(true);
    const question = await mcpService.getDeepeningQuestion(reflection, verseKey);
    setAiQuestion(question);
    setIsAnalyzing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const saved = await userService.saveReflection({
      verse_key: verseKey,
      reflection_text: reflection,
      ai_question: aiQuestion || undefined
    });
    setIsSaving(false);
    setIsSaved(true);
    if (onSaved) onSaved(saved);
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Verse & Tafsir Context */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-10 flex flex-col justify-between border-sada-sand-200/5">
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-sada-sand-200/60 transition-colors">
              <BookOpen size={18} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Scriptural Context</span>
            </div>
            {verseText && (
              <div className="space-y-8">
                <h3 className="quran-text text-4xl text-right text-sada-sand-50 leading-relaxed drop-shadow-lg">{verseText.text_uthmani}</h3>
                <p className="text-lg text-sada-sand-100 font-medium leading-relaxed italic border-l-2 border-sada-sand-200/20 pl-6">
                  "{verseText.translations?.[0]?.text}"
                </p>
              </div>
            )}
          </div>
        </div>

        <div className={`glass-card p-10 border-sada-emerald-800/10 transition-colors duration-500 ${theme === 'dark' ? 'bg-sada-emerald-900/5' : 'bg-sada-emerald-800/5'}`}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3 text-sada-emerald-700">
              <Quote size={18} className="text-sada-sand-200" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-sada-sand-200/60 transition-colors">Classical Tafsir</span>
            </div>
          </div>
          {!tafsir ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-sada-sand-100/40 transition-colors">
              <Loader2 className="animate-spin" size={32} />
              <span className="text-xs font-black uppercase tracking-widest">Illuminating Insights...</span>
            </div>
          ) : (
            <div 
              className="text-sada-sand-100/70 text-base leading-8 max-h-[300px] overflow-y-auto pr-4 scrollbar-thin font-medium prose prose-invert"
              dangerouslySetInnerHTML={{ __html: tafsir.text }}
            />
          )}
        </div>
      </div>

      {/* Reflection Input Area */}
      <div className="glass-card p-10 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sada-sand-100/20 to-transparent" />
        
        <div className="max-w-3xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-black text-sada-sand-50 tracking-tight">Your Tadabbur Journal</h2>
            <p className="text-sada-sand-100/60 text-sm font-medium uppercase tracking-widest transition-colors text-center">Record the whispers of your heart</p>
          </div>

          <div className="relative group/input">
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              disabled={isSaved}
              placeholder="How does this verse speak to your current state? Write your reflection here..."
              className="w-full bg-sada-slate-950/50 border-2 border-white/5 rounded-3xl p-10 text-xl text-sada-sand-50 min-h-[250px] outline-none transition-all focus:border-sada-sand-100/20 focus:bg-sada-slate-950 placeholder:text-sada-sand-100/20 resize-none font-medium leading-relaxed shadow-inner bg-dark"
            />
            <button 
              type="button"
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              disabled={isSaved}
              className={`absolute bottom-6 right-6 p-4 rounded-full transition-all duration-300 group-hover/input:scale-110 shadow-lg ${
                isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : theme === 'dark'
                    ? 'bg-sada-sand-200/5 text-sada-sand-200 hover:bg-sada-sand-200 hover:text-sada-emerald-950'
                    : 'bg-sada-sand-200/20 text-sada-sand-100 hover:bg-sada-emerald-700 hover:text-white'
              } ${isSaved ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isRecording ? <MicOff size={24} /> : <Mic size={24} />}
            </button>
          </div>
          
          <AnimatePresence mode="wait">
            {!aiQuestion && !isAnalyzing && (
              <motion.button 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleReflect}
                disabled={!reflection.trim() || isSaved}
                className="btn-primary w-full py-6 text-xl flex items-center justify-center gap-3 group shadow-xl"
              >
                <Sparkles size={24} className="group-hover:animate-spin" />
                <span>Invite Reflection Partner</span>
              </motion.button>
            )}

            {isAnalyzing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-10 gap-4 text-sada-sand-200"
              >
                <div className="relative">
                   <Sparkles className="animate-spin" size={48} />
                   <div className="absolute inset-0 blur-xl bg-sada-sand-200/20 rounded-full" />
                </div>
                <span className="text-sm font-black uppercase tracking-[0.4em] animate-pulse">Deepening Perspective...</span>
              </motion.div>
            )}

            {aiQuestion && (
              <motion.div 
                ref={aiQuestionRef}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-10 bg-gradient-to-br from-sada-sand-200/5 to-transparent border-2 border-sada-sand-200/10 rounded-3xl shadow-inner relative overflow-hidden"
              >
                <div className="absolute top-4 left-4 opacity-5">
                   <Sparkles size={64} />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2 mb-2 text-sada-sand-200/40 text-[10px] font-black uppercase tracking-[0.4em]">
                    Scholarly Grounded Question
                  </div>
                  <p className="text-2xl font-black text-sada-sand-50 leading-relaxed italic">
                    "{aiQuestion}"
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {aiQuestion && !isSaved && (
              <motion.button 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleSave}
                disabled={isSaving}
                className="btn-primary w-full py-6 text-xl flex items-center justify-center gap-4 bg-sada-emerald-900 text-white hover:bg-sada-emerald-800 border border-sada-sand-200/20"
              >
                {isSaving ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                <span>{isSaving ? 'Preserving Tadabbur...' : 'Record to Personal Journey'}</span>
              </motion.button>
            )}
          </AnimatePresence>

          {isSaved && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center gap-4 p-10 text-sada-sand-200 bg-sada-emerald-900/10 rounded-3xl border border-sada-emerald-800/30"
            >
              <CheckCircle2 size={48} className="animate-bounce" />
              <div className="text-center">
                 <span className="text-2xl font-black block mb-1">Reflection Enshrined</span>
                 <span className="text-xs font-bold uppercase tracking-[0.2em] opacity-40">Your progress has been synced with Quran Foundation</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
