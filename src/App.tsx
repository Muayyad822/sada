import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Headphones, PenTool, LayoutDashboard } from 'lucide-react';
import { Home } from './pages/Home';
import { Reflection } from './pages/Reflection';
import { Stats } from './pages/Stats';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { About } from './pages/About';

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
      <div className="glass-card py-4 px-6 flex items-center justify-around shadow-[0_20px_50px_rgba(0,0,0,0.5)] border-white/5">
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

const Header = () => (
  <header className="flex justify-between items-center py-4 px-4 md:py-6 md:px-12 border-b border-sada-sand-100/5 bg-sada-slate-950/50 backdrop-blur-md sticky top-0 z-40">
      <Link to="/" className="flex items-center gap-3 md:gap-4 group cursor-pointer">
      <img src="/logo.png" alt="SADA Logo" className="w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center -rotate-12 transition-transform group-hover:rotate-0 duration-300 shadow-lg shadow-sada-sand-200/20 object-cover" />
      <div>
        <h1 className="text-xl md:text-2xl font-black text-sada-sand-50 tracking-tighter leading-none">SADA</h1>
        <p className="text-[8px] md:text-[10px] font-bold text-sada-sand-200/40 uppercase tracking-[0.2em] mt-0.5 md:mt-1 hidden sm:block">Echoes of Quran</p>
      </div>
    </Link>
    <div className="flex items-center gap-3 md:gap-6">
        <div className="flex items-center gap-2 md:gap-4">
          <Link to="/about" className="text-[9px] md:text-[10px] font-black text-sada-sand-100/30 uppercase tracking-[0.15em] md:tracking-[0.2em] hover:text-sada-sand-100/60 transition-colors">About</Link>
          <Link to="/privacy" className="text-[9px] md:text-[10px] font-black text-sada-sand-100/30 uppercase tracking-[0.15em] md:tracking-[0.2em] hover:text-sada-sand-100/60 transition-colors hidden sm:block">Privacy</Link>
          <Link to="/terms" className="text-[9px] md:text-[10px] font-black text-sada-sand-100/30 uppercase tracking-[0.15em] md:tracking-[0.2em] hover:text-sada-sand-100/60 transition-colors hidden sm:block">Terms</Link>
        </div>
      </div>
  </header>
);

function App() {
  return (
    <div className="min-h-screen bg-sada-slate-950 text-sada-sand-50 relative pb-32 selection:bg-sada-sand-200/30 selection:text-sada-sand-50">
      <ScrollToTop />
      <div className="max-w-7xl mx-auto relative z-10">
        <Header />
        <main className="px-6 py-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/reflection" element={<Reflection />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/about" element={<About />} />
          </Routes>
        </main>
        <Navbar />
      </div>
      
      {/* Dynamic Background Glow */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sada-emerald-900/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-sada-emerald-800/10 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
      </div>
    </div>
  );
}

export default App;
