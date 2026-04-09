import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="max-w-3xl mx-auto text-center py-16">
      <h1 className="text-6xl font-black text-sada-sand-50 mb-4">404</h1>
      <p className="text-xl text-sada-sand-100/60 mb-8">Page not found</p>
      <p className="text-sada-sand-100/40 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link 
        to="/" 
        className="inline-flex items-center gap-2 px-6 py-3 bg-sada-emerald-900/50 hover:bg-sada-emerald-900 text-sada-sand-50 rounded-lg transition-colors"
      >
        <Home size={20} />
        <span className="font-bold">Back to Home</span>
      </Link>
    </div>
  );
};