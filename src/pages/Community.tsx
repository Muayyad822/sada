import { useState, useEffect } from 'react';
import { Users, Heart, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const USER_API_BASE = import.meta.env.VITE_QF_USER_API_URL || 'https://auth.quran.com/api/v1';

export const Community = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${USER_API_BASE}/posts/feed?limit=10`);
        if (response.ok) {
          const data = await response.json();
          setPosts(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch community posts', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="flex flex-col gap-10 max-w-4xl mx-auto py-8 px-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black text-sada-sand-50 tracking-tighter">
          Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-sada-sand-200 to-sada-sand-100">Echoes</span>
        </h1>
        <p className="text-sada-sand-100/60 text-lg italic">Reflections from the community.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sada-emerald-500" />
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={post.id}
              className="glass-card p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <Users size={18} className="text-sada-sand-200" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sada-sand-50">{post.author?.name || 'Seeker'}</h3>
                    <p className="text-xs text-sada-sand-100/40 uppercase tracking-widest">{new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              <p className="text-sada-sand-100/90 leading-relaxed mb-6">{post.body}</p>
              <div className="flex items-center gap-6 border-t border-white/5 pt-4">
                <button className="flex items-center gap-2 text-sada-sand-100/40 hover:text-rose-400 transition-colors">
                  <Heart size={18} />
                  <span className="text-sm font-bold">{post.likesCount || 0}</span>
                </button>
                <button className="flex items-center gap-2 text-sada-sand-100/40 hover:text-sada-sand-200 transition-colors">
                  <MessageSquare size={18} />
                  <span className="text-sm font-bold">{post.commentsCount || 0}</span>
                </button>
              </div>
            </motion.div>
          ))}
          {posts.length === 0 && (
            <div className="text-center py-20 text-sada-sand-100/40 italic">
              No recent reflections found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
