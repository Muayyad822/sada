/**
 * Model Context Protocol (MCP) Service
 */
import { QFContentService } from './qfContentApi';
import { transformQuery } from './aiQueryTransformer';

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
   * Semantically search for verses based on mood/query using query transformation + Quran API.
   * Uses thematic search to convert user feelings into relevant Quran verses.
   */
  semanticSearch: async (query: string): Promise<SemanticSearchResult[]> => {
    const normalizedQuery = query.toLowerCase().trim();
    
    const transformed = await transformQuery(normalizedQuery);
    
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
      const apiQuery = transformed.query;
      const results = await QFContentService.search(apiQuery);

      if (results && results.length > 0) {
        return results.slice(0, 5).map((r: { verse_key?: string; chapter_id?: number; verse_number?: number }, i: number) => {
          const score = 1.0 - (i * 0.05);
          return {
            verse_key: r.verse_key || `${r.chapter_id}:${r.verse_number}`,
            relevance_score: score,
            reasoning: transformed.reason
          };
        });
      }
    } catch (error) {
      console.error('MCP: QF Search API error:', error);
    }

    const detectedMood = mcpService.detectMood(normalizedQuery);
    const matchedMapping = detectedMood 
      ? MOOD_VERSE_MAPPINGS.find(m => m.mood === detectedMood)
      : MOOD_VERSE_MAPPINGS.find(m => m.mood === transformed?.query.split(' ')[0]);

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
      reasoning: transformed.reason
    }];
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
