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
    const response = await fetch(`${API_BASE}/recitations/${recitationId}/by_ayah/${verseKey}`);
    const data = await response.json();
    const audio = data.audio_files?.[0];
    if (!audio || !audio.url) return { url: '' };

    // Handle relative URLs (starting with //)
    let url = audio.url;
    if (url.startsWith('//')) {
      url = `https:${url}`;
    } else if (url.startsWith('/')) {
      // In case it's a relative path from quran.com
      url = `https://mirrors.quran.com${url}`;
    }
    
    return { ...audio, url };
  },

  getVerseText: async (verseKey: string, translationId: number = 131) => {
    const response = await fetch(`${API_BASE}/verses/by_key/${verseKey}?translations=${translationId}&fields=text_uthmani`);
    const data = await response.json();
    return data.verse;
  },

  getTafsir: async (verseKey: string, tafsirId: number = 169) => {
    const response = await fetch(`${API_BASE}/tafsirs/${tafsirId}/by_ayah/${verseKey}`);
    const data = await response.json();
    return data.tafsir;
  }
};
