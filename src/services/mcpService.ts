/**
 * Model Context Protocol (MCP) Service
 * Handles semantic search and scholarly grounding via AI with Quranic context.
 */

const QURAN_API = 'https://api.quran.com/api/v4';

export interface SemanticSearchResult {
  verse_key: string;
  relevance_score: number;
  reasoning: string;
}

interface MoodVerseMapping {
  mood: string;
  verses: { key: string; reason: string }[];
}

const MOOD_VERSE_MAPPINGS: MoodVerseMapping[] = [
  {
    mood: 'anxious',
    verses: [
      { key: '94:5', reason: 'Relief after hardship - Indeed, with hardship comes ease' },
      { key: '2:153', reason: 'Patience and prayer - Seek Allah with patience' },
      { key: '13:28', reason: 'Hearts find rest in Allah\'s remembrance' },
      { key: '2:286', reason: 'No burden beyond capacity' },
      { key: '65:7', reason: 'Allah will provide sustenance' }
    ]
  },
  {
    mood: 'grateful',
    verses: [
      { key: '14:7', reason: 'Increase for the grateful' },
      { key: '55:13', reason: 'Favors of the Lord - which.taste it' },
      { key: '16:18', reason: 'Countless blessings' },
      { key: '31:20', reason: 'Signs for the grateful' },
      { key: '7:160', reason: 'We gave them doubling mercy' }
    ]
  },
  {
    mood: 'angry',
    verses: [
      { key: '3:134', reason: 'Those who restrain anger' },
      { key: '42:37', reason: 'Forgiveness when angry' },
      { key: '41:34', reason: 'Repel evil with good' },
      { key: '16:125', reason: 'Invited with wisdom' }
    ]
  },
  {
    mood: 'searching',
    verses: [
      { key: '29:69', reason: 'Those who strive, Allah loves them' },
      { key: '2:186', reason: 'He responds to those who call' },
      { key: '51:31', reason: 'Guidance for the seekers' }
    ]
  },
  {
    mood: 'overwhelmed',
    verses: [
      { key: '94:8', reason: 'So remember your Lord much' },
      { key: '2:45', reason: 'Seek help through patience and prayer' },
      { key: '7:56', reason: 'Scatter with mercy' }
    ]
  },
  {
    mood: 'sad',
    verses: [
      { key: '2:157', reason: 'We are tested with what we love' },
      { key: '3:173', reason: 'What Allah wills will happen' },
      { key: '9:40', reason: 'With difficulties comes ease' }
    ]
  },
  {
    mood: 'hopeful',
    verses: [
      { key: '2:214', reason: 'Hope for Allah\'s mercy' },
      { key: '39:53', reason: 'He forgives all sins' },
      { key: '33:24', reason: 'Truthful will have truth' }
    ]
  },
  {
    mood: 'lost',
    verses: [
      { key: '2:256', reason: 'There is no compulsion in religion' },
      { key: '1:6', reason: 'Guide us to the straight path' },
      { key: '20:82', reason: 'We have repented - we follow guidance' }
    ]
  },
  {
    mood: 'peaceful',
    verses: [
      { key: '13:28', reason: 'Hearts at peace in remembrance' },
      { key: '6:127', reason: 'They will have gardens of peace' },
      { key: '10:10', reason: 'Pure wives and Allah\'s pleasure' }
    ]
  },
  {
    mood: 'fearful',
    verses: [
      { key: '2:62', reason: 'Those who believe and do good' },
      { key: '93:4', reason: 'He is with you always' },
      { key: '87:8', reason: 'We will ease you to ease' }
    ]
  }
];

export const mcpService = {
  /**
   * Semantically search for verses based on mood/query using Quran API + contextual mapping.
   * Falls back to Quran.com search for production, uses mood mapping for development.
   */
  semanticSearch: async (query: string): Promise<SemanticSearchResult[]> => {
    const normalizedQuery = query.toLowerCase().trim();
    
    const matchedMapping = MOOD_VERSE_MAPPINGS.find(m => 
      m.mood === normalizedQuery || normalizedQuery.includes(m.mood)
    );

    if (matchedMapping) {
      return matchedMapping.verses.map((v, i) => ({
        verse_key: v.key,
        relevance_score: 1.0 - (i * 0.1),
        reasoning: v.reason
      }));
    }

    try {
      const searchResponse = await fetch(
        `${QURAN_API}/search?text=${encodeURIComponent(query)}&size=5`,
        { headers: { 'Accept': 'application/json' } }
      );

      if (searchResponse.ok) {
        const data = await searchResponse.json();
        if (data.results?.length > 0) {
          return data.results.slice(0, 5).map((r: any) => ({
            verse_key: `${r.chapter_id}:${r.verse_number}`,
            relevance_score: r.score || 0.9,
            reasoning: r.text_matches?.[0] || 'Search result'
          }));
        }
      }
    } catch (error) {
      console.log('MCP search API unavailable, using fallback');
    }

    const genericMood = MOOD_VERSE_MAPPINGS.flatMap(m => m.verses);
    return genericMood.slice(0, 4).map((v, i) => ({
      verse_key: v.key,
      relevance_score: 0.85 - (i * 0.1),
      reasoning: v.reason
    }));
  },

  /**
   * Analyze reflection and provide a deepening question grounded in tafsir.
   */
  getDeepeningQuestion: async (reflection: string, verseKey: string): Promise<string> => {
    try {
      const tafsirResponse = await fetch(`${QURAN_API}/tafsirs/169/by_ayah/${verseKey}`);
      if (tafsirResponse.ok) {
        const tafsirData = await tafsirResponse.json();
        const tafsirText = tafsirData.tafsir?.text?.substring(0, 500);
        
        if (tafsirText) {
          return `Based on the classical tafsir: "${tafsirText}..." - How does this insight from Ibn Kathir connect to what you reflected about "${reflection.substring(0, 50)}..."?`;
        }
      }
    } catch (error) {
      console.log('Tafsir API unavailable, using contextual question');
    }

    const contextualQuestions: Record<string, string> = {
      '1:1': 'How does calling upon "Al-Rahman" (The Most Merciful) change your understanding of Allah\'s mercy?',
      '2:153': 'How can patience become an act of worship in your daily life?',
      '94:5': 'Can you identify a recent hardship that was followed by ease?',
      '2:255': 'How does Ayat al-Kursi reassure you in difficult moments?',
      '3:134': 'When you feel anger rising, what specific actions can you take to restrain it?',
      '14:7': 'In what ways has Allah already shown gratitude for your gratitude?',
      '13:28': 'How does intentionally remembering Allah bring peace to your heart?'
    };

    return contextualQuestions[verseKey] || 
      `How does the wisdom of ${verseKey} apply to your reflection on "${reflection.substring(0, 30)}..."?`;
  }
};
