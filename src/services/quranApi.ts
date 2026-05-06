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
  },

  /**
   * Fetches multiple translations and synthesizes them into a "Simple English" version using Gemini.
   */
  getSynthesizedTranslation: async (verseKey: string, userFeeling?: string): Promise<string> => {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    try {
      // Fetch Clear Quran (131) and Sahih International (20)
      const response = await fetch(`${API_BASE}/verses/by_key/${verseKey}?translations=131,20&fields=text_uthmani`);
      const data = await response.json();
      const translations = data.verse?.translations || [];
      
      if (translations.length === 0) return 'Translation unavailable';
      
      const cleanTranslations = translations.map((t: any) => t.text.replace(/<[^>]*>/g, '').trim()).join('\n---\n');

      if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('YOUR_')) {
        return translations[0].text.replace(/<[^>]*>/g, '').trim(); // Fallback to first translation
      }

      const prompt = `Verse: ${verseKey}\n\nTranslations:\n${cleanTranslations}\n\n${userFeeling ? `User is feeling: "${userFeeling}"\n` : ''}Task: Synthesize these translations into ONE high-quality, modern, "Simple English" version. Keep it spiritually profound but accessible. Direct address preferred. Maximum 2 sentences.`;

      const aiResponse = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              contents: [{
                  parts: [{ text: prompt }]
              }],
              systemInstruction: {
                  parts: [{ text: "You are the 'Sada Voice of Guidance'. Your task is to provide clear, beautiful, and emotionally resonant English renderings of Quranic verses for a modern audience." }]
              },
              generationConfig: {
                  temperature: 0.2,
                  maxOutputTokens: 150,
              }
          })
      });

      const aiData = await aiResponse.json();
      return aiData.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/"/g, '').trim() || translations[0].text;
    } catch (error) {
      console.error('Synthesis error:', error);
      return 'Translation unavailable';
    }
  }
};
