import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Headphones, PenTool, LayoutDashboard, Sun, Moon, LogIn, LogOut, User } from 'lucide-react';
import { Home } from './pages/Home';
import { Reflection } from './pages/Reflection';
import { Stats } from './pages/Stats';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { About } from './pages/About';
import { NotFound } from './pages/NotFound';
import { Callback } from './pages/Callback';
import { useTheme } from './contexts/ThemeContext';
import { userService } from './services/userService';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Navbar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-6">
      <div className="glass-card py-4 px-6 flex items-center justify-around border-white/5">
        <Link 
          to="/" 
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 hover:text-sada-sand-200 ${isActive('/') ? 'text-sada-sand-200 scale-110' : 'text-sada-sand-100/40'}`}
        >
          <Headphones size={24} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">Listen</span>
        </Link>
        
        <Link 
          to="/reflection" 
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 hover:text-sada-sand-200 ${isActive('/reflection') ? 'text-sada-sand-200 scale-110' : 'text-sada-sand-100/40'}`}
        >
          <PenTool size={24} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">Reflect</span>
        </Link>

        <Link 
          to="/stats" 
          className={`flex flex-col items-center gap-1.5 transition-all duration-300 hover:text-sada-sand-200 ${isActive('/stats') ? 'text-sada-sand-200 scale-110' : 'text-sada-sand-100/40'}`}
        >
          <LayoutDashboard size={24} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">Growth</span>
        </Link>
      </div>
    </nav>
  );
};

const Header = () => {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <header className="flex justify-between items-center py-4 px-6 md:py-6 md:px-12 border-b border-sada-sand-100/5 bg-sada-slate-950/50 backdrop-blur-md sticky top-0 z-40 bg-dark">
      <Link to="/" className="flex items-center gap-3 md:gap-4 group cursor-pointer">
      <img src="/logo.png" alt="SADA Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center -rotate-12 transition-transform group-hover:rotate-0 duration-300 shadow-lg shadow-sada-sand-200/20 object-cover" />
      <div className="flex flex-col">
        <h1 className="text-lg md:text-2xl font-black text-sada-sand-50 tracking-tighter leading-none">SADA</h1>
        <p className="text-[8px] md:text-[10px] font-bold text-sada-sand-200/40 uppercase tracking-[0.2em] mt-0.5 md:mt-1 hidden sm:block">Echoes of Quran</p>
      </div>
    </Link>
    <div className="flex items-center gap-3 md:gap-6">
        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/about" className="text-[9px] md:text-[10px] font-black text-sada-sand-100/30 uppercase tracking-[0.15em] md:tracking-[0.2em] hover:text-sada-sand-100/60 transition-colors">About</Link>
          <Link to="/privacy" className="text-[9px] md:text-[10px] font-black text-sada-sand-100/30 uppercase tracking-[0.15em] md:tracking-[0.2em] hover:text-sada-sand-100/60 transition-colors hidden sm:block">Privacy</Link>
          <Link to="/terms" className="text-[9px] md:text-[10px] font-black text-sada-sand-100/30 uppercase tracking-[0.15em] md:tracking-[0.2em] hover:text-sada-sand-100/60 transition-colors hidden sm:block">Terms</Link>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3 border-l border-sada-sand-100/10 pl-3 md:pl-6">
          {userService.isAuthenticated() ? (
            <div className="flex items-center gap-3">
               <button 
                onClick={() => { userService.clearAuth(); window.location.reload(); }}
                className="p-2 rounded-full hover:bg-red-500/10 text-sada-sand-100/40 hover:text-red-400 transition-colors"
                title="Sign Out"
              >
                <LogOut size={18} />
              </button>
              <div className="w-8 h-8 rounded-full bg-sada-sand-200/10 flex items-center justify-center text-sada-sand-200 border border-sada-sand-200/20">
                <User size={16} />
              </div>
            </div>
          ) : (
            <button 
              onClick={async () => window.location.href = await userService.getLoginUrl()}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-sada-sand-200/10 text-sada-sand-200 hover:bg-sada-sand-200 hover:text-sada-emerald-950 transition-all text-[10px] font-black uppercase tracking-widest border border-sada-sand-200/20"
            >
              <LogIn size={14} />
              <span className="hidden sm:inline">Sign In</span>
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-sada-sand-100/10 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={20} className="text-sada-sand-200" /> : <Moon size={20} className="text-sada-sand-100" />}
          </button>
        </div>
      </div>
    </header>
  );
};

function App() {
  const { theme } = useTheme();
  return (
    <div className="min-h-screen bg-sada-slate-950 text-sada-sand-50 relative pb-32 selection:bg-sada-sand-200/30 selection:text-sada-sand-50 bg-dark transition-colors duration-500 overflow-x-hidden">
      <ScrollToTop />
      <div className="max-w-7xl mx-auto relative z-10 overflow-x-hidden">
        <Header />
        <main className="px-6 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reflection" element={<Reflection />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/about" element={<About />} />
            <Route path="/oauth/callback" element={<Callback />} />
            <Route path="/callback" element={<Callback />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Navbar />
      </div>
      
      {/* Dynamic Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full animate-pulse transition-colors duration-1000 ${theme === 'dark' ? 'bg-sada-emerald-900/20' : 'bg-sada-emerald-800/5'}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] blur-[120px] rounded-full animate-pulse [animation-delay:2s] transition-colors duration-1000 ${theme === 'dark' ? 'bg-sada-emerald-800/10' : 'bg-sada-emerald-700/5'}`} />
      </div>
    </div>
  );
}

export default App;
