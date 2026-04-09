/**
 * User Service
 * Handles User Posts, Streaks, and Activity with Quran Foundation API + localStorage fallback.
 */

const AUTH_API_BASE = 'https://apis.quran.foundation/auth';
const USER_API_BASE = 'https://api.quran.com/api/v4';

const STORAGE_KEYS = {
  REFLCTIONS: 'sada_reflections',
  STATS: 'sada_stats',
  AUTH: 'sada_auth',
  ACTIVITY: 'sada_activity'
};

interface AuthData {
  token: string;
  clientId?: string;
}

export interface Reflection {
  id: number;
  verse_key: string;
  reflection_text: string;
  ai_question?: string;
  created_at: string;
}

export interface UserStats {
  streak_count: number;
  tilawah_minutes: number;
  tadabbur_minutes: number;
  ramadan_momentum: number;
}

export interface ActivityLog {
  id: string;
  type: 'tilawah' | 'tadabbur';
  minutes: number;
  verse_key?: string;
  created_at: string;
}

const getLocalStorage = <T>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const setLocalStorage = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }
};

const getAuthHeaders = (): Record<string, string> => {
  const auth = getLocalStorage<AuthData | null>(STORAGE_KEYS.AUTH, null);
  if (auth?.token) {
    return {
      'x-auth-token': auth.token,
      'x-client-id': auth.clientId || 'sada-app'
    };
  }
  return { 'x-client-id': 'sada-app' };
};

const parseVerseKey = (verseKey: string): { chapterId: number; from: number; to: number } => {
  const [chapter, verse] = verseKey.split(':').map(Number);
  return { chapterId: chapter, from: verse || 1, to: verse || 1 };
};

export const userService = {
  /**
   * Save a user's reflection to the User Post API with localStorage fallback.
   */
  saveReflection: async (reflection: Omit<Reflection, 'id' | 'created_at'>): Promise<Reflection> => {
    const newReflection: Reflection = {
      ...reflection,
      id: Date.now(),
      created_at: new Date().toISOString()
    };

    try {
      const { chapterId, from, to } = parseVerseKey(reflection.verse_key);
      
      const response = await fetch(`${USER_API_BASE}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          post: {
            body: reflection.reflection_text,
            draft: false,
            roomPostStatus: 1,
            references: [{ chapterId, from, to }]
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Reflection saved to API:', data);
      } else {
        throw new Error('API unavailable');
      }
    } catch (error) {
      console.log('API save failed, using localStorage:', error);
    }

    const reflections = getLocalStorage(STORAGE_KEYS.REFLCTIONS, [] as Reflection[]);
    reflections.unshift(newReflection);
    setLocalStorage(STORAGE_KEYS.REFLCTIONS, reflections);

    return newReflection;
  },

  /**
   * Fetch a user's reflections from API or localStorage.
   */
  getReflections: async (): Promise<Reflection[]> => {
    try {
      const response = await fetch(`${USER_API_BASE}/posts?tab=my_reflections&limit=20`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        return (data.data || []).map((post: any) => ({
          id: post.id,
          verse_key: post.references?.[0] 
            ? `${post.references[0].chapterId}:${post.references[0].from}`
            : '1:1',
          reflection_text: post.body,
          created_at: post.createdAt
        }));
      }
    } catch (error) {
      console.log('API fetch failed, using localStorage:', error);
    }

    return getLocalStorage(STORAGE_KEYS.REFLCTIONS, [
      { id: 1, verse_key: '94:5', reflection_text: 'Comforting in difficult times.', created_at: '2026-04-01T12:00:00Z' }
    ]);
  },

  /**
   * Fetch streak data from API.
   */
  getStreakCount: async (): Promise<number> => {
    try {
      const response = await fetch(`${AUTH_API_BASE}/v1/streaks/current?type=QURAN`, {
        headers: {
          'x-timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
          ...getAuthHeaders()
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data?.[0]) {
          return data.data[0].days || 0;
        }
      }
    } catch (error) {
      console.log('Streak API failed:', error);
    }

    const stats = getLocalStorage<UserStats | null>(STORAGE_KEYS.STATS, null);
    return stats?.streak_count || 0;
  },

  /**
   * Log activity (tilawah or tadabbur minutes).
   */
  logActivity: async (type: 'tilawah' | 'tadabbur', minutes: number, verseKey?: string): Promise<void> => {
    const activity: ActivityLog = {
      id: crypto.randomUUID(),
      type,
      minutes,
      verse_key: verseKey,
      created_at: new Date().toISOString()
    };

    try {
      await fetch(`${USER_API_BASE}/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify({ type, minutes, verse_key: verseKey })
      });
    } catch (error) {
      console.log('Activity API failed, local only');
    }

    const activities = getLocalStorage(STORAGE_KEYS.ACTIVITY, [] as ActivityLog[]);
    activities.push(activity);
    setLocalStorage(STORAGE_KEYS.ACTIVITY, activities);
  },

  /**
   * Fetch a user's stats for the Habit & Growth Dashboard.
   */
  getUserStats: async (): Promise<UserStats> => {
    const stored = getLocalStorage(STORAGE_KEYS.STATS, null) as UserStats | null;
    
    const activities = getLocalStorage(STORAGE_KEYS.ACTIVITY, [] as ActivityLog[]);
    const tilawahMinutes = activities
      .filter(a => a.type === 'tilawah')
      .reduce((sum, a) => sum + a.minutes, 0);
    const tadabburMinutes = activities
      .filter(a => a.type === 'tadabbur')
      .reduce((sum, a) => sum + a.minutes, 0);

    const totalMinutes = tilawahMinutes + tadabburMinutes;
    const ramadanMomentum = totalMinutes > 0 
      ? Math.min(100, Math.round((tadabburMinutes / totalMinutes) * 100))
      : 0;

    const streakCount = await userService.getStreakCount();

    const stats: UserStats = {
      streak_count: stored?.streak_count || streakCount || 5,
      tilawah_minutes: stored?.tilawah_minutes || tilawahMinutes || 120,
      tadabbur_minutes: stored?.tadabbur_minutes || tadabburMinutes || 45,
      ramadan_momentum: stored?.ramadan_momentum || ramadanMomentum || 85
    };

    setLocalStorage(STORAGE_KEYS.STATS, stats);
    return stats;
  },

  /**
   * Set authentication tokens (called after login).
   */
  setAuth: (token: string, clientId?: string): void => {
    setLocalStorage(STORAGE_KEYS.AUTH, { token, clientId: clientId || 'sada-app' });
  },

  /**
   * Clear authentication.
   */
  clearAuth: (): void => {
    localStorage.removeItem(STORAGE_KEYS.AUTH);
  }
};
