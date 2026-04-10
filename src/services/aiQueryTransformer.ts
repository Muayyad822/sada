import { transformQuery as ruleBasedTransform } from './queryTransformer';

export type TransformedQuery = {
  query: string;
  reason: string;
  category: 'negative' | 'positive' | 'neutral' | 'mixed';
};

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `You are an Islamic spiritual assistant that helps users find relevant Quran verses based on their emotional state.

Your task is to analyze the user's input and transform it into a search query that will find meaningful Quran verses.

INPUT: User's emotional state or feeling (can be in any language, can be informal/slang)
OUTPUT: A search query in English that will find relevant Quran verses

Guidelines:
1. For DIFFICULT emotions (sad, anxious, rejected, lonely, hurt, hopeless, guilty, angry, etc.) - find verses about:
   - Allah's mercy, comfort, and ease after hardship
   - Patience and perseverance
   - Hope and forgiveness
   - Allah being near to those who call

2. For POSITIVE emotions (grateful, happy, blessed, content, hopeful, proud, inspired, etc.) - find verses about:
   - Gratitude and thankfulness
   - Blessings and favors
   - Joy and Paradise
   - Increasing good deeds

3. For NEUTRAL/SEARCHING emotions (searching, curious, confused, reflective) - find verses about:
   - Guidance and knowledge
   - Wisdom and Signs
   - The straight path

4. For MIXED emotions (yearning, nostalgic, restless) - find verses about:
   - Patience and gratitude
   - Remembrance of Allah
   - Contentment

5. Always respond with JSON in this exact format:
{
  "query": "search keywords separated by spaces",
  "reason": "A brief explanation of why these verses would help (1-2 sentences)",
  "category": "negative" | "positive" | "neutral" | "mixed"
}

Examples:
- Input: "feeling rejected" → {"query": "Allah mercy acceptance not rejecting believers", "reason": "Allah does not reject those who turn to Him", "category": "negative"}
- Input: "so grateful today" → {"query": "blessings gratitude thanks increase favor", "reason": "Increase for the grateful", "category": "positive"}
- Input: "lost in life" → {"query": "guidance direct the righteous path", "reason": "Guide us to the straight path", "category": "negative"}
- Input: "feeling blessed and content" → {"query": "contentment gratitude peace hearts remembrance", "reason": "Hearts find rest in remembrance of Allah", "category": "positive"}
`;

export interface AIQueryResult {
  query: string;
  reason: string;
  category: 'negative' | 'positive' | 'neutral' | 'mixed';
}

let rateLimitCooldown = false;
let lastRateLimitTime = 0;
const COOLDOWN_DURATION = 60 * 1000;
const CACHE_TTL = 2 * 60 * 1000;

const queryCache = new Map<string, { result: TransformedQuery; timestamp: number }>();

export const transformQueryWithAI = async (input: string): Promise<AIQueryResult | null> => {
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
          maxOutputTokens: 256,
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
      const parsed = JSON.parse(text) as AIQueryResult;
      
      if (parsed.query && parsed.reason && parsed.category) {
        return parsed;
      }
    }

    return null;
  } catch (error) {
    console.error('AI query transformation error:', error);
    return null;
  }
};

export const transformQuery = async (input: string): Promise<TransformedQuery | null> => {
  const normalizedInput = input.toLowerCase().trim();

  const cached = queryCache.get(normalizedInput);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }

  if (rateLimitCooldown || (lastRateLimitTime && Date.now() - lastRateLimitTime < COOLDOWN_DURATION)) {
    console.log('In rate limit cooldown, using rule-based fallback');
    return ruleBasedTransform(normalizedInput);
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

  return ruleBasedTransform(normalizedInput);
};

export const clearCache = () => {
  cachedResult = null;
};