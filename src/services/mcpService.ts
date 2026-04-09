/**
 * Model Context Protocol (MCP) Service
 */
import { QFContentService } from './qfContentApi';

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
    
    // Check for mood hints to improve search for abstract terms
    const matchedMapping = MOOD_VERSE_MAPPINGS.find(m => 
      m.mood === normalizedQuery || normalizedQuery.includes(m.mood)
    );

    try {
      // Use the raw query, but if it's a known mood, we can broaden it slightly for better results
      const apiQuery = matchedMapping ? `${matchedMapping.mood} peace guidance` : normalizedQuery;
      const results = await QFContentService.search(apiQuery);

      if (results && results.length > 0) {
        return results.slice(0, 6).map((r: any) => ({
          verse_key: r.verse_key || `${r.chapter_id}:${r.verse_number}`,
          relevance_score: r.score || 0.95,
          reasoning: r.text?.replace(/<[^>]*>/g, '').substring(0, 120) || `Verses related to your state of ${query}`
        }));
      }
    } catch (error) {
      console.error('MCP: QF Search API integration error:', error);
    }

    // Fallback logic: If API fails OR returns no results, use curated mapping if available
    if (matchedMapping) {
      return matchedMapping.verses.map((v, i) => ({
        verse_key: v.key,
        relevance_score: 1.0 - (i * 0.1),
        reasoning: v.reason
      }));
    }

    // Absolute fallback: Generic verses
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
        const rawText = tafsirData.tafsir?.text || '';
        
        // Strip HTML tags and normalize whitespace
        const cleanText = rawText.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        const tafsirText = cleanText.substring(0, 400);
        
        if (tafsirText) {
          // Analytical prompts based on common themes in reflections
          const lowercaseRef = reflection.toLowerCase();
          
          if (lowercaseRef.includes('struggle') || lowercaseRef.includes('hard') || lowercaseRef.includes('difficult')) {
            return `Classical scholarship (Ibn Kathir) emphasizes that this verse was sent to provide firmment in trials. Knowing that, how does the specific insight—"${tafsirText.substring(0, 150)}..."—reframing your current struggle?`;
          }
          
          if (lowercaseRef.includes('thank') || lowercaseRef.includes('grateful') || lowercaseRef.includes('blessing')) {
            return `The tafsir suggests this verse is a 'key to increase.' Looking at your reflection on gratitude, how does the scholarly context—"${tafsirText.substring(0, 150)}..."—reveal even deeper layers of Allah's favors to you?`;
          }

          if (lowercaseRef.includes('fear') || lowercaseRef.includes('anxious') || lowercaseRef.includes('worried')) {
            return `In the classical view, this passage serves as a 'shield for the heart.' How does the explanation—"${tafsirText.substring(0, 150)}..."—help you release the specific anxieties you mentioned?`;
          }

          return `Reflecting on what you wrote through the lens of Ibn Kathir: "${tafsirText.substring(0, 200)}..." — How does this classical perspective deepen your personal connection to ${verseKey}?`;
        }
      }
    } catch (error) {
      console.log('Tafsir API unavailable, using contextual question');
    }

    const contextualQuestions: Record<string, string> = {
      '1:1': 'How does calling upon "Al-Rahman" (The Most Merciful) change your understanding of Allah\'s mercy in your current state?',
      '2:153': 'If patience is a form of light, how is Allah illuminated your path through the "Sabr" you mentioned?',
      '94:5': 'Ibn Kathir notes that "ease" is mentioned twice to overpower one "hardship." Can you see that ease manifesting in your reflection?',
      '2:255': 'The "Kursi" represents Allah\'s absolute knowledge. How does His knowing your inner thoughts bring comfort to the situation you described?',
      '3:134': 'The verse describes those who "swallow" their anger. How does that visual metaphor apply to the situation you are navigating?',
      '14:7': 'Gratitude is a preservation of current blessings and a magnet for future ones. What specific blessing are you most afraid of losing if you aren\'t grateful?',
      '13:28': 'The heart\'s "rest" is a profound state of tranquility. Is there a part of your reflection that still feels restless, and how can this verse specifically calm it?'
    };

    return contextualQuestions[verseKey] || 
      `How does the scriptural wisdom of verse ${verseKey} specifically speak to the "whispers" you recorded in your journal?`;
  }
};
