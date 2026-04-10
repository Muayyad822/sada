/**
 * User Service
 * Handles User Posts, Streaks, and Activity with Quran Foundation API + localStorage fallback.
 */

function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
}

function base64UrlEncode(buffer: Uint8Array): string {
  let str = '';
  buffer.forEach(b => str += String.fromCharCode(b));
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

const AUTH_API_BASE = 'https://apis.quran.foundation/auth';
const USER_API_BASE = 'https://api.quran.com/api/v4';

const STORAGE_KEYS = {
  REFLCTIONS: 'sada_reflections',
  AUTH: 'sada_auth',
  ACTIVITY: 'sada_activity',
  THEMES: 'sada_themes'
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
  reflection_count: number;
  weekly_minutes: number;
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

    return getLocalStorage(STORAGE_KEYS.REFLCTIONS, []);
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

    return 0;
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

    const reflections = getLocalStorage(STORAGE_KEYS.REFLCTIONS, [] as Reflection[]);
    const weeklyMinutes = activities
      .filter(a => {
        const date = new Date(a.created_at);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        return diff < 7 * 24 * 60 * 60 * 1000;
      })
      .reduce((sum, a) => sum + a.minutes, 0);

    const stats: UserStats = {
      streak_count: streakCount,
      tilawah_minutes: tilawahMinutes,
      tadabbur_minutes: tadabburMinutes,
      ramadan_momentum: ramadanMomentum,
      reflection_count: reflections.length,
      weekly_minutes: weeklyMinutes
    };

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
  },

  /**
   * Generate the OAuth login URL.
   */
  getLoginUrl: async (): Promise<string> => {
    const clientId = import.meta.env.VITE_QF_CLIENT_ID;
    const redirectUri = `${window.location.origin}/oauth/callback`;
    const productionRedirectUri = 'https://sada.vercel.app/oauth/callback';
    const finalRedirectUri = window.location.origin.includes('localhost') ? redirectUri : productionRedirectUri;
    const state = Math.random().toString(36).substring(2, 15);
    const codeVerifier = generateCodeVerifier();
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    sessionStorage.setItem('oauth_state', state);
    sessionStorage.setItem('code_verifier', codeVerifier);
    return `https://oauth2.quran.foundation/oauth2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(finalRedirectUri)}&response_type=code&scope=openid+offline_access+user+collection&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`;
  },

  /**
   * Get the current user's display name or fallback.
   */
  getUserName: (): string => {
    const auth = getLocalStorage<AuthData | null>(STORAGE_KEYS.AUTH, null);
    if (!auth?.token) return 'Seeker';
    
    try {
      // Basic JWT decode if token is JWT, otherwise fallback
      const payload = JSON.parse(atob(auth.token.split('.')[1]));
      return payload.name || payload.username || 'Traveler';
    } catch {
      return 'Traveler';
    }
  },

  /**
   * Check if user is authenticated.
   */
  isAuthenticated: (): boolean => {
    const auth = getLocalStorage<AuthData | null>(STORAGE_KEYS.AUTH, null);
    return !!auth?.token;
  },

  /**
   * Log a primary concept/theme for the Spiritual Landscape dashboard.
   */
  logThemeSearch: (concept: string): void => {
    if (!concept) return;
    const themes = getLocalStorage<Record<string, number>>(STORAGE_KEYS.THEMES, {});
    themes[concept] = (themes[concept] || 0) + 1;
    setLocalStorage(STORAGE_KEYS.THEMES, themes);
  },

  /**
   * Get all theme frequencies.
   */
  getThemeStats: (): Record<string, number> => {
    return getLocalStorage<Record<string, number>>(STORAGE_KEYS.THEMES, {});
  }
};
