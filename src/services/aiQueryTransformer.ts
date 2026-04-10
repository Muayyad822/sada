import { transformQuery as ruleBasedTransform } from './queryTransformer';

export type EmotionalQueryResult = {
  primary_concept: string;
  search_keywords: string;
  emotional_context: string;
};

export interface VettingCandidate {
  verse_key: string;
  translation: string;
  tafsir: string;
}

export interface VettedVerse {
  verse_key: string;
  explanation: string;
}

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `You are the "Sada Heart-to-Verse" engine. Your task is to act as a bridge between a user's emotional state and the verified Quran Foundation API.

Goal: Take a natural language input about a feeling, situation, or struggle, and return 3-5 precise Quranic Concepts and Theme Keywords that can be used to query the Quran MCP or API.

The Analysis Framework:

Surface Emotion: What is the user literally saying? (e.g., "I feel rejected").

Deep Root: What is the spiritual root? (e.g., "Seeking validation from people vs. seeking it from Allah").

Quranic Theme: Map this to a Quranic keyword (e.g., Tawakkul (Reliance), Sakinah (Tranquility), Inshirah (Opening of the chest)).

Instructions for Verse Selection:

DO NOT suggest verses about punishment for users in distress.

PRIORITIZE verses of comfort (Tasliyah), verses of nature, and verses of Allah's attributes.

When querying, USE Tafsir context - Read the Tafsir of the search results first. This ensures that if a user says they are "sad," you don't accidentally give them a verse about the "sadness of the people of Hell," but rather a verse about "comforting the Prophet (pbuh) during grief."

FORMAT: Always provide a brief 1-sentence explanation of why this verse "Echoes" their current feeling.

Output Format (Strictly for API consumption):

{
  "primary_concept": "[Core Quranic Concept Name]",
  "search_keywords": "[Comma-separated keywords for MCP search]",
  "emotional_context": "[1-sentence summary of why this resonates]"
}

Examples:
- Input: "I feel rejected"
  Output: {"primary_concept": "Rahmah (Mercy)", "search_keywords": "mercy, acceptance, turn to Allah, not rejecting, comfort", "emotional_context": "Allah's mercy embraces those who feel excluded by the world"}

- Input: "I'm grateful for my new job"
  Output: {"primary_concept": "Shukr (Gratitude) & Rizq (Provision)", "search_keywords": "gratitude, thankfulness, blessing, provision, increase, rizq", "emotional_context": " Provision comes from Allah - gratitude attracts more blessings"}

- Input: "I feel lost in life"
  Output: {"primary_concept": "Hidayah (Guidance)", "search_keywords": "guidance, direction, straight path, light, show the way", "emotional_context": "Allah guides those who sincerely seek Him"}

- Input: "I feel like I'm working so hard but nothing is happening"
  Output: {"primary_concept": "Sabr (Patience) & Reward", "search_keywords": "patience, perseverance, reward, fruits of labor, ease after hardship, reward of patient", "emotional_context": "The patient receive their reward without account - your effort is seen"}

- Input: "I'm anxious about my future"
  Output: {"primary_concept": "Tawakkul (Reliance)", "search_keywords": "trust in Allah, reliance, ease after hardship, not worrying, provision", "emotional_context": "Your provision is guaranteed - release your worries to Allah"}`;

const VETTING_PROMPT = `You are the "Sada Heart-to-Verse" vetting engine.
Your task is to review a list of Quranic verses that were found via keyword search and select the 3-5 that most accurately and comfortingly address the user's emotional state.

Constraints:
1. STRICT: DO NOT select verses about punishment, hellfire, or stern warnings if the user is in distress (sad, anxious, lost, etc.). 
2. PRIORITIZE: Verses of comfort (Tasliyah), divine mercy, nature, and Allah's attributes.
3. CONTEXT: Use the provided Translation and Tafsir to ensure the verse's original context matches the user's situation.
4. Explanations: For each chosen verse, provide a brief 1-sentence explanation of why this verse "Echoes" their current feeling.

Output Format (JSON):
{
  "selected_verses": [
    {
      "verse_key": "verse_key",
      "explanation": "[1-sentence explanation of why it echoes their feeling]"
    }
  ]
}`;

export interface AIQueryResult {
  primary_concept: string;
  search_keywords: string;
  emotional_context: string;
}

let rateLimitCooldown = false;
let lastRateLimitTime = 0;
const COOLDOWN_DURATION = 60 * 1000;
const CACHE_TTL = 2 * 60 * 1000;

const queryCache = new Map<string, { result: EmotionalQueryResult; timestamp: number }>();

export const transformQueryWithAI = async (input: string): Promise<EmotionalQueryResult | null> => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY' || GEMINI_API_KEY.startsWith('your_')) {
    console.log('Gemini API key not configured, falling back to rule-based');
    return null;
  }

  try {
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Transform this user feeling into a Quran search query:\n\n"${input}"`
          }]
        }],
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 512,
          responseMimeType: 'application/json',
        }
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.log('Gemini rate limited, using rule-based fallback');
        rateLimitCooldown = true;
        lastRateLimitTime = Date.now();
        setTimeout(() => { rateLimitCooldown = false; }, COOLDOWN_DURATION);
      } else {
        console.error('Gemini API error:', response.status);
      }
      return null;
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (text) {
      const parsed = JSON.parse(text) as EmotionalQueryResult;
      
      if (parsed.primary_concept && parsed.search_keywords && parsed.emotional_context) {
        return parsed;
      }
    }

    return null;
  } catch (error) {
    console.error('AI query transformation error:', error);
    return null;
  }
};

export const vetVersesWithAI = async (emotion: string, candidates: VettingCandidate[]): Promise<VettedVerse[]> => {
  if (!GEMINI_API_KEY || GEMINI_API_KEY === 'YOUR_GEMINI_API_KEY' || GEMINI_API_KEY.startsWith('your_')) {
    return candidates.slice(0, 3).map(c => ({ verse_key: c.verse_key, explanation: "Guidance for your heart." }));
  }

  try {
    const prompt = `User Emotion: "${emotion}"\n\nCandidate Verses:\n${candidates.map(c => `Verse ${c.verse_key}:\nTranslation: ${c.translation}\nTafsir: ${c.tafsir.substring(0, 400)}...`).join('\n\n')}`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        systemInstruction: {
          parts: [{ text: VETTING_PROMPT }]
        },
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        }
      })
    });

    if (!response.ok) {
        return candidates.slice(0, 3).map(c => ({ verse_key: c.verse_key, explanation: "Guidance for your heart." }));
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (text) {
      const parsed = JSON.parse(text);
      if (parsed.selected_verses) {
        return parsed.selected_verses;
      }
    }

    return candidates.slice(0, 3).map(c => ({ verse_key: c.verse_key, explanation: "Guidance for your heart." }));
  } catch (error) {
    console.error('AI vetting error:', error);
    return candidates.slice(0, 3).map(c => ({ verse_key: c.verse_key, explanation: "Guidance for your heart." }));
  }
};

export const transformQuery = async (input: string): Promise<EmotionalQueryResult | null> => {
  const normalizedInput = input.toLowerCase().trim();

  const cached = queryCache.get(normalizedInput);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }

  if (rateLimitCooldown || (lastRateLimitTime && Date.now() - lastRateLimitTime < COOLDOWN_DURATION)) {
    console.log('In rate limit cooldown, using rule-based fallback');
    return convertFallbackToEmotionalQuery(normalizedInput);
  }

  try {
    const aiResult = await transformQueryWithAI(normalizedInput);
    
    if (aiResult) {
      queryCache.set(normalizedInput, {
        result: aiResult,
        timestamp: Date.now()
      });
      return aiResult;
    }
  } catch (error) {
    console.log('AI transformation failed, using rule-based:', error);
  }

  return convertFallbackToEmotionalQuery(normalizedInput);
};

const convertFallbackToEmotionalQuery = (input: string): EmotionalQueryResult => {
  const fallback = ruleBasedTransform(input);
  
  if (fallback) {
    return {
      primary_concept: getConceptFromCategory(fallback.category),
      search_keywords: fallback.query,
      emotional_context: fallback.reason
    };
  }
  
  return {
    primary_concept: 'Hidayah (Guidance)',
    search_keywords: 'guidance, light, straight path, wisdom',
    emotional_context: 'May Allah guide you to the straight path'
  };
};

const getConceptFromCategory = (category: string): string => {
  switch (category) {
    case 'positive': return 'Shukr (Gratitude)';
    case 'negative': return 'Rahmah (Mercy)';
    case 'neutral': return 'Hidayah (Guidance)';
    case 'mixed': return 'Sabr (Patience)';
    default: return 'Tawakkul (Reliance)';
  }
};

export const clearCache = () => {
  queryCache.clear();
};