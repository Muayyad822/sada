const API_BASE = 'https://api.quran.com/api/v4';

export interface Recitation {
  id: number;
  reciter_name: string;
  style?: string;
}

export interface Verse {
  id: number;
  verse_key: string;
  text_uthmani: string;
  translations?: { text: string; resource_id: number }[];
}

export const quranApi = {
  getRecitations: async (): Promise<Recitation[]> => {
    const response = await fetch(`${API_BASE}/resources/recitations`);
    const data = await response.json();
    return data.recitations;
  },

  getChapterAudio: async (recitationId: number, chapterId: number) => {
    const response = await fetch(`${API_BASE}/chapter_recitations/${recitationId}/${chapterId}`);
    const data = await response.json();
    return data.audio_file;
  },

  getVerseAudio: async (recitationId: number, verseKey: string) => {
    try {
      const response = await fetch(`${API_BASE}/recitations/${recitationId}/by_ayah/${verseKey}`);
      if (!response.ok) throw new Error(`Audio API responded with ${response.status}`);
      
      const data = await response.json();
      const audio = data.audio_files?.[0];
      
      if (!audio || !audio.url) {
        console.warn(`No audio found for verse ${verseKey} and recitation ${recitationId}`);
        return { url: '' };
      }

      // Handle audio URL formatting
      let url = audio.url;
      if (url.startsWith('http')) {
        // URL is already absolute
      } else if (url.startsWith('//')) {
        // Handle protocol-relative URLs
        url = `https:${url}`;
      } else {
        // Handle all other relative paths (e.g., "Alafasy/..." or "/Alafasy/...")
        // verses.quran.com is the current reliable mirror for this content
        const cleanPath = url.startsWith('/') ? url : `/${url}`;
        url = `https://verses.quran.com${cleanPath}`;
      }
      
      return { ...audio, url };
    } catch (error) {
      console.error(`Error fetching audio for ${verseKey}:`, error);
      return { url: '' };
    }
  },

  getVerseText: async (verseKey: string, translationId: number = 20) => {
    const response = await fetch(`${API_BASE}/verses/by_key/${verseKey}?translations=${translationId}&fields=text_uthmani`);
    const data = await response.json();
    const verse = data.verse;

    if (verse && verse.translations) {
      verse.translations = verse.translations.map((t: any) => ({
        ...t,
        text: t.text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
      }));
    }

    return verse;
  },

  getTafsir: async (verseKey: string, tafsirId: number = 169) => {
    const response = await fetch(`${API_BASE}/tafsirs/${tafsirId}/by_ayah/${verseKey}`);
    const data = await response.json();
    return data.tafsir;
  }
};
