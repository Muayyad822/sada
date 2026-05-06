/**
 * Model Context Protocol (MCP) Service
 * Two-step handshake flow:
 * Step 1: Gemini transforms emotion → Primary_Concept + Search_Keywords
 * Step 2: QF Content API searches keywords → verse keys
 */
import { QFContentService } from './qfContentApi';
import { transformQuery, vetVersesWithAI, type EmotionalQueryResult, type VettingCandidate } from './aiQueryTransformer';
import { quranApi } from './quranApi';


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
  },
  {
    mood: 'lazy',
    verses: [
      { key: '62:10', reason: 'When prayer is ended, spread abroad' },
      { key: '33:35', reason: 'Enumerate the servants of Allah' },
      { key: '2:148', reason: 'Every person has a direction' },
      { key: '103:1', reason: 'By the afternoon - strive in good' }
    ]
  },
  {
    mood: 'tired',
    verses: [
      { key: '94:5', reason: 'Indeed, with hardship comes ease' },
      { key: '2:286', reason: 'No soul bears beyond capacity' },
      { key: '84:6', reason: 'On that Day shall you meet Allah' },
      { key: '53:39', reason: 'Each person gets what they strive for' }
    ]
  },
  {
    mood: 'confused',
    verses: [
      { key: '2:256', reason: 'Guidance is clear to those who seek' },
      { key: '29:69', reason: 'Those who strive, Allah loves them' },
      { key: '18:29', reason: 'Say the truth from your Lord' },
      { key: '21:37', reason: 'We made the Quran easy for guidance' }
    ]
  },
  {
    mood: 'disappointed',
    verses: [
      { key: '3:139', reason: 'Do not lose hope or grieve' },
      { key: '2:214', reason: 'Never lose hope of Allah\'s mercy' },
      { key: '39:53', reason: 'He forgives all sins - turn to Him' },
      { key: '94:6', reason: 'Indeed, difficulty comes with ease' }
    ]
  },
  {
    mood: 'lonely',
    verses: [
      { key: '2:186', reason: 'I am near when you call' },
      { key: '33:6', reason: 'He is the protector and helper' },
      { key: '57:4', reason: 'He is with you wherever you are' },
      { key: '8:24', reason: 'Help from Allah and victory near' }
    ]
  },
  {
    mood: 'hopeless',
    verses: [
      { key: '39:53', reason: 'He forgives all sins - hope in Him' },
      { key: '2:214', reason: 'Never lose hope of Allah\'s mercy' },
      { key: '3:139', reason: 'Do not lose hope or grieve' },
      { key: '94:5', reason: 'With hardship comes ease' }
    ]
  },
  {
    mood: 'jealous',
    verses: [
      { key: '4:32', reason: 'Do not wish for what Allah gave others' },
      { key: '57:20', reason: 'Life of this world is like rain' },
      { key: '25:15', reason: 'Ask about the ones before you' },
      { key: '28:60', reason: 'What you have is better for later' }
    ]
  },
  {
    mood: 'guilty',
    verses: [
      { key: '39:53', reason: 'He forgives all sins - turn to Him' },
      { key: '2:222', reason: 'He loves those who turn to Him' },
      { key: '3:135', reason: 'Those who admit sins and do good' },
      { key: '66:8', reason: 'Turn to Allah with sincere repentance' }
    ]
  },
  {
    mood: 'proud',
    verses: [
      { key: '57:23', reason: 'Not that He loves the proud' },
      { key: '31:18', reason: 'Do not turn away from others' },
      { key: '17:37', reason: 'Not to walk proudly on earth' },
      { key: '28:83', reason: 'Homecoming is to Allah' }
    ]
  },
  {
    mood: 'content',
    verses: [
      { key: '13:28', reason: 'Hearts at peace in remembrance' },
      { key: '16:18', reason: 'Countless blessings to be grateful' },
      { key: '14:7', reason: 'Increase for the grateful ones' },
      { key: '55:13', reason: 'Taste the favors of your Lord' }
    ]
  },
  {
    mood: 'struggling',
    verses: [
      { key: '2:155', reason: 'We will test you with fear and hunger' },
      { key: '29:2', reason: 'Do they think We cannot test them?' },
      { key: '3:142', reason: 'The believers compete in good deeds' },
      { key: '8:25', reason: 'Guard against a trial that cannot target' }
    ]
  },
  {
    mood: 'doubtful',
    verses: [
      { key: '21:37', reason: 'We made the Quran easy for guidance' },
      { key: '2:256', reason: 'There is no compulsion in religion' },
      { key: '10:99', reason: 'If your Lord willed, all would believe' },
      { key: '18:29', reason: 'Say truth from your Lord' }
    ]
  },
  {
    mood: 'hurt',
    verses: [
      { key: '42:40', reason: 'Repel evil with good - reward from Allah' },
      { key: '3:134', reason: 'Those who restrain anger and forgive' },
      { key: '41:34', reason: 'Repel evil with what is better' },
      { key: '16:125', reason: 'Invite to the way of your Lord' }
    ]
  },
  {
    mood: 'yearning',
    verses: [
      { key: '18:109', reason: 'Say: My Lord expands provision' },
      { key: '29:69', reason: 'Those who strive, Allah loves them' },
      { key: '2:186', reason: 'He responds to those who call' },
      { key: '56:79', reason: 'None can touch it except the pure' }
    ]
  }
];

const FEELING_PHRASES: Record<string, string[]> = {
  lazy: ['feeling lazy', 'too lazy', 'don\'t want to do anything', 'can\'t be bothered', 'no motivation', 'feeling unproductive'],
  tired: ['feeling tired', 'exhausted', 'so tired', 'drained', 'worn out', 'fatigued', 'burned out'],
  confused: ['feeling confused', 'don\'t know what to do', 'lost direction', 'uncertain', 'can\'t think clearly', 'mixed up'],
  disappointed: ['feeling disappointed', 'let down', 'heartbroken', 'unfulfilled', 'not what i expected', 'failed expectations'],
  lonely: ['feeling lonely', 'alone', 'no one understands', 'isolated', 'abandoned', 'left out'],
  hopeless: ['feeling hopeless', 'giving up', 'no hope', 'what\'s the point', 'can\'t go on', 'helpless'],
  jealous: ['feeling jealous', 'envious', 'wish i had', 'not fair', 'others have it better'],
  guilty: ['feeling guilty', 'regret', 'should have', 'sorry for what i did', 'bad about', 'remorse'],
  proud: ['feeling proud', 'accomplished', 'did well', 'happy with myself', 'successful'],
  content: ['feeling content', 'satisfied', 'at peace', 'happy with what i have', 'grateful and happy'],
  struggling: ['struggling with', 'going through', 'hard time', 'can\'t handle', 'burdened'],
  doubtful: ['feeling doubtful', 'not sure', 'uncertain', ' questioning', 'skeptical'],
  hurt: ['feeling hurt', 'wounded', 'pain', 'emotional pain', 'betrayed', 'let down'],
  yearning: ['longing for', 'yearning', 'wishing for', 'craving', 'desire', 'wanting something more'],
  anxious: ['feeling anxious', 'worried', 'nervous', 'stressed', 'can\'t relax', 'overthinking'],
  grateful: ['feeling grateful', 'thankful', 'blessed', 'appreciative', 'count my blessings'],
  angry: ['feeling angry', 'mad', 'frustrated', 'annoyed', 'irritated', 'furious'],
  searching: ['searching for', 'looking for meaning', 'seeking', 'trying to find', 'want guidance'],
  overwhelmed: ['feeling overwhelmed', 'too much', 'can\'t cope', 'swamped', 'drowning', 'everything at once'],
  sad: ['feeling sad', 'down', 'depressed', 'unhappy', 'blue', 'grief', 'sorrow'],
  hopeful: ['feeling hopeful', 'optimistic', 'looking forward', 'positive about future'],
  lost: ['feeling lost', 'don\'t know where to go', 'no direction', 'confused about life'],
  peaceful: ['feeling peaceful', 'calm', 'serene', 'tranquil', 'at ease'],
  fearful: ['feeling fearful', 'scared', 'afraid', 'terrified', 'frightened']
};

export const mcpService = {
  /**
   * Detect mood from natural feeling phrases
   */
  detectMood: (query: string): string => {
    const normalizedQuery = query.toLowerCase();
    
    for (const [mood, phrases] of Object.entries(FEELING_PHRASES)) {
      for (const phrase of phrases) {
        if (normalizedQuery.includes(phrase)) {
          return mood;
        }
      }
    }
    return '';
  },

  /**
   * Get a random verse for discovery mode
   */
  getRandomVerse: async (): Promise<SemanticSearchResult[]> => {
    const RANDOM_VERSES = [
      { key: '94:8', reason: 'Remember your Lord much - find spiritual nourishment' },
      { key: '2:255', reason: 'Allah\'s light and guidance - feel His presence' },
      { key: '13:28', reason: 'Hearts find peace in Allah\'s remembrance' },
      { key: '2:286', reason: 'No burden beyond capacity - trust in Allah' },
      { key: '3:134', reason: 'Those who restrain anger and forgive - spiritual strength' },
      { key: '14:7', reason: 'Increase for the grateful - abundance mindset' },
      { key: '29:69', reason: 'Those who strive, Allah loves them - motivation' },
      { key: '39:53', reason: 'He forgives all sins - hope and mercy' },
      { key: '1:1', reason: 'Begin with Allah\'s names - seeking guidance' },
      { key: '55:13', reason: 'Taste the favors of your Lord - gratitude' },
      { key: '20:124', reason: 'Whoever turns away from My signs - guidance' },
      { key: '76:9', reason: 'We provide for you without measure - sustenance' },
      { key: '2:153', reason: 'Seek Allah with patience and prayer - strength' },
      { key: '93:4', reason: 'He is with you wherever you are - comfort' },
      { key: '57:4', reason: 'He is with you - never alone' }
    ];
    
    const shuffled = RANDOM_VERSES.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5).map((v, i) => ({
      verse_key: v.key,
      relevance_score: 1.0 - (i * 0.1),
      reasoning: v.reason
    }));
  },

/**
   * Semantically search for verses based on mood/query using two-step handshake:
   * Step 1: Gemini (via transformQuery) returns Primary_Concept + Search_Keywords
   * Step 2: QF Content API searches keywords → verse keys
   * Uses Tafsir context to avoid inappropriate verses for distressed users
   */
  semanticSearch: async (query: string): Promise<SemanticSearchResult[]> => {
    const normalizedQuery = query.toLowerCase().trim();
    
    const transformed: EmotionalQueryResult | null = await transformQuery(normalizedQuery);
    
    if (!transformed) {
      try {
        const results = await QFContentService.search(normalizedQuery);
        if (results && results.length > 0) {
          return results.slice(0, 5).map((r: { verse_key?: string; chapter_id?: number; verse_number?: number; score?: number; text?: string }) => ({
            verse_key: r.verse_key || `${r.chapter_id}:${r.verse_number}`,
            relevance_score: r.score || 0.9,
            reasoning: r.text?.replace(/<[^>]*>/g, '').substring(0, 80) || `Verses matching: ${query}`
          }));
        }
      } catch (error) {
        console.error('MCP: QF Search error:', error);
      }
      
      const fallback = MOOD_VERSE_MAPPINGS.flatMap(m => m.verses);
      return fallback.slice(0, 4).map((v, i) => ({
        verse_key: v.key,
        relevance_score: 0.7 - (i * 0.1),
        reasoning: v.reason
      }));
    }

    try {
      const apiQuery = transformed.search_keywords;
      const initialResults = await QFContentService.search(apiQuery);

      if (initialResults && initialResults.length > 0) {
        // Step 3: Vetting with Tafsir
        // Fetch context for the top 8 candidates
        const candidates: VettingCandidate[] = await Promise.all(
          initialResults.slice(0, 8).map(async (r: { verse_key?: string; chapter_id?: number; verse_number?: number }) => {
            const verseKey = r.verse_key || `${r.chapter_id}:${r.verse_number}`;
            const verse = await quranApi.getVerseText(verseKey);
            const tafsir = await quranApi.getTafsir(verseKey);
            
            return {
              verse_key: verseKey,
              translation: verse.translations?.[0]?.text || 'Translation unavailable',
              tafsir: tafsir?.text || 'Tafsir unavailable'
            };
          })
        );

        const vettedResults = await vetVersesWithAI(normalizedQuery, candidates);

        if (vettedResults && vettedResults.length > 0) {
          return vettedResults.map((v, i) => ({
            verse_key: v.verse_key,
            relevance_score: 1.0 - (i * 0.05),
            reasoning: v.explanation
          }));
        }
      }
    } catch (error) {
      console.error('MCP: QF Search API or Vetting error:', error);
    }

    const detectedMood = mcpService.detectMood(normalizedQuery);
    const matchedMapping = detectedMood 
      ? MOOD_VERSE_MAPPINGS.find(m => m.mood === detectedMood)
      : MOOD_VERSE_MAPPINGS.find(m => m.mood === transformed?.primary_concept?.toLowerCase().split(' ')[0]);

    if (matchedMapping) {
      return matchedMapping.verses.map((v, i) => ({
        verse_key: v.key,
        relevance_score: 1.0 - (i * 0.1),
        reasoning: v.reason
      }));
    }

    return [{
      verse_key: '94:8',
      relevance_score: 0.9,
      reasoning: transformed.emotional_context
    }];
  },

  /**
   * Analyze reflection and provide a deepening question grounded in tafsir.
   */
  getDeepeningQuestion: async (reflection: string, verseKey: string): Promise<string> => {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    try {
      const verse = await quranApi.getVerseText(verseKey);
      const tafsir = await quranApi.getTafsir(verseKey);
      const tafsirText = tafsir?.text?.replace(/<[^>]*>/g, '').substring(0, 800) || '';

      if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('YOUR_')) {
        return `How does ${verseKey} specifically speak to the thoughts you just recorded?`;
      }

      const prompt = `Verse: ${verseKey}\nMeaning: ${verse.translations?.[0]?.text}\nTafsir Context: ${tafsirText}\n\nUser Reflection: "${reflection}"\n\nTask: Generate ONE deep, scholarly, and compassionate question that helps the user connect their personal reflection even more deeply with the classical tafsir or the verse's inner meaning. No placeholders.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              contents: [{
                  parts: [{ text: prompt }]
              }],
              systemInstruction: {
                  parts: [{ text: "You are the 'Sada Deepening Partner'. You help users reach a state of Tadabbur (deep contemplation) by bridging their personal trials with divine wisdom." }]
              },
              generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 150,
              }
          })
      });

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/"/g, '').trim() || `How does ${verseKey} provide clarity to the situation you described?`;
    } catch (error) {
      console.error('Deepening question error:', error);
      return `How does the scriptural wisdom of verse ${verseKey} specifically speak to your reflection?`;
    }
  },

  /**
   * Fetches Asbab al-Nuzul (reasons for revelation) and mirrors it to the user's emotion.
   */
  getContextualMirror: async (verseSecret: string, feeling: string): Promise<string> => {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    try {
      const tafsir = await quranApi.getTafsir(verseSecret);
      const tafsirText = tafsir?.text?.replace(/<[^>]*>/g, '').substring(0, 1000) || '';

      if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('YOUR_')) return '';

      const prompt = `Verse: ${verseSecret}\nTafsir/History: ${tafsirText}\nUser Feeling: "${feeling}"\n\nTask: Explain the historical context of this verse (the "Asbab al-Nuzul") and draw a direct parallel (mirror) to the user's current feeling. Start with: "History tells us that when this verse came down..." or similar. Maximum 3 sentences.`;

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              contents: [{
                  parts: [{ text: prompt }]
              }],
              systemInstruction: {
                  parts: [{ text: "You are the 'Sada Contextual Mirror'. You bring the history of the Quran alive by showing how the Prophets and early believers shared the same emotional human experiences as the user." }]
              },
              generationConfig: {
                  temperature: 0.6,
                  maxOutputTokens: 250,
              }
          })
      });

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    } catch {
      return '';
    }
  },

  /**
   * Generates a "seed question" for the AI Partner to start the conversation,
   * based on the initial emotional context from the search.
   */
  getInitialSeedQuestion: async (feeling: string, echo: string, verseKey: string): Promise<string> => {
    const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('YOUR_')) {
        return `You mentioned feeling "${feeling}". Looking at ${verseKey}, how does its message specifically address your state right now?`;
    }

    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: `User felt: "${feeling}"\nDivine Echo: "${echo}"\nVerse: "${verseKey}"\n\nGenerate ONE brief, compassionate, and deep opening question to start their journaling session. Direct and personal.` }]
                }],
                systemInstruction: {
                    parts: [{ text: "You are the 'Sada Scholarly Partner'. Your goal is to help users reflect deeply on the Quran. Start with a question that connects their current feeling to the verse they just heard." }]
                },
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 100,
                }
            })
        });
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/"/g, '') || `How does ${verseKey} resonate with your feeling of "${feeling}"?`;
    } catch {
        return `How does ${verseKey} resonate with your feeling of "${feeling}"?`;
    }
  }
};
