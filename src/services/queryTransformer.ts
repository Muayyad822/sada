export type TransformedQuery = {
  query: string;
  reason: string;
  category: 'negative' | 'positive' | 'neutral' | 'mixed';
};

const FEELING_TO_THEME: Record<string, TransformedQuery> = {
  rejected: { 
    query: "Allah mercy acceptance not rejecting believers", 
    reason: "Allah does not reject those who turn to Him", 
    category: 'negative' 
  },
  alone: { 
    query: "Allah presence companionship believers", 
    reason: "He is with you wherever you are", 
    category: 'negative' 
  },
  lonely: { 
    query: "He is near those who call Him", 
    reason: "Call upon Allah, He answers", 
    category: 'negative' 
  },
  anxious: { 
    query: "peace trust in Allah no fear", 
    reason: "Those who trust in Allah, He is sufficient for them", 
    category: 'negative' 
  },
  worried: { 
    query: "ease after hardship reliance on Allah", 
    reason: "With difficulty comes ease", 
    category: 'negative' 
  },
  lost: { 
    query: "guidance direct the righteous path", 
    reason: "Guide us to the straight path", 
    category: 'negative' 
  },
  sad: { 
    query: "comfort relieve after difficulty patience", 
    reason: "Indeed with hardship comes ease", 
    category: 'negative' 
  },
  hurt: { 
    query: "forgiveness healing mercy patience", 
    reason: "Repel evil with good", 
    category: 'negative' 
  },
  fearful: { 
    query: "Allah protector trust no fear", 
    reason: "Allah is the best protector", 
    category: 'negative' 
  },
  hopeless: { 
    query: "mercy forgiveness turn to Allah hope", 
    reason: "Never lose hope of Allah's mercy", 
    category: 'negative' 
  },
  guilty: { 
    query: "repentance forgiveness sin turn to Allah", 
    reason: "He accepts repentance", 
    category: 'negative' 
  },
  angry: { 
    query: "forgiveness patience reward Allah", 
    reason: "Those who restrain anger, Allah loves them", 
    category: 'negative' 
  },
  disappointed: { 
    query: "hope mercy patience after difficulty", 
    reason: "Do not lose hope or grieve", 
    category: 'negative' 
  },
  jealous: { 
    query: "contentment gratitude blessings trust", 
    reason: "Do not wish for what Allah gave others", 
    category: 'negative' 
  },
  tired: { 
    query: "ease after hardship rest in Allah patience", 
    reason: "No soul bears beyond capacity", 
    category: 'negative' 
  },
  overwhelmed: { 
    query: "ease after difficulty patience prayer", 
    reason: "Seek help through patience and prayer", 
    category: 'negative' 
  },
  confused: { 
    query: "guidance knowledge clarity wisdom", 
    reason: "Ask those who know", 
    category: 'negative' 
  },
  struggling: { 
    query: "patience trials reward Jannah steadfastness", 
    reason: "Indeed with hardship comes ease", 
    category: 'negative' 
  },
  doubtful: { 
    query: "guidance faith certainty signs", 
    reason: "We made the Quran easy for guidance", 
    category: 'negative' 
  },
  frustrated: { 
    query: "patience gratitude ease after difficulty", 
    reason: "Indeed with hardship comes ease", 
    category: 'negative' 
  },
  stressed: { 
    query: "peace tranquility reliance on Allah patience", 
    reason: "Those who trust in Allah, He is sufficient", 
    category: 'negative' 
  },
  depressed: { 
    query: "mercy hope light after darkness", 
    reason: "Indeed with hardship comes ease", 
    category: 'negative' 
  },
  betrayed: { 
    query: "forgiveness patience trust in Allah", 
    reason: "Repel evil with good", 
    category: 'negative' 
  },
  
  grateful: { 
    query: "blessings gratitude thanks increase favor", 
    reason: "Increase for the grateful", 
    category: 'positive' 
  },
  thankful: { 
    query: "favors blessings gratitude thanks favor", 
    reason: "Countless blessings to be grateful for", 
    category: 'positive' 
  },
  happy: { 
    query: "joy gratitude Allah's pleasure Jannah", 
    reason: "Wealth and children are the adornment of life", 
    category: 'positive' 
  },
  blessed: { 
    query: "blessings gratitude favor increase provision", 
    reason: "We give blessing from unexpected places", 
    category: 'positive' 
  },
  content: { 
    query: "contentment gratitude peace hearts remembrance", 
    reason: "Hearts find rest in remembrance of Allah", 
    category: 'positive' 
  },
  peaceful: { 
    query: "peace tranquility paradise gardens delight", 
    reason: "Enter in peace and security", 
    category: 'positive' 
  },
  hopeful: { 
    query: "hope mercy forgiveness Paradise reward", 
    reason: "Hope for Allah's mercy", 
    category: 'positive' 
  },
  proud: { 
    query: "accomplishment humility gratitude truth", 
    reason: "Not to walk proudly on earth", 
    category: 'positive' 
  },
  excited: { 
    query: "joy gratitude blessings excitement favor", 
    reason: "Taste the favors of your Lord", 
    category: 'positive' 
  },
  motivated: { 
    query: "righteous deeds striving patience reward", 
    reason: "Those who strive, Allah loves them", 
    category: 'positive' 
  },
  inspired: { 
    query: "guidance wisdom understanding revelation light", 
    reason: "We have made the Quran a light", 
    category: 'positive' 
  },
  joyful: { 
    query: "joy gratitude blessings delight favor", 
    reason: "Taste the favors of your Lord", 
    category: 'positive' 
  },
  accomplished: { 
    query: "righteous deeds gratitude increase provision", 
    reason: "Those who do good, We will give more", 
    category: 'positive' 
  },
  "at peace": { 
    query: "peace tranquility paradise gardens security", 
    reason: "Enter in peace and security", 
    category: 'positive' 
  },
  confident: { 
    query: "trust in Allah reliance certainty", 
    reason: "Those who trust in Allah, He is sufficient", 
    category: 'positive' 
  },
  loving: { 
    query: "love for Allah love of good halal relationship", 
    reason: "Love for the believing is from Allah", 
    category: 'mixed' 
  },
  
  searching: { 
    query: "guidance knowledge truth straight path", 
    reason: "Seek knowledge", 
    category: 'neutral' 
  },
  curious: { 
    query: "knowledge wisdom Signs creation", 
    reason: "Are they equal who know and know not", 
    category: 'neutral' 
  },
  reflective: { 
    query: "remembrance contemplation Signs wisdom", 
    reason: "Do they not contemplate the Quran", 
    category: 'neutral' 
  },
  introspective: { 
    query: "self-reflection repentance improvement", 
    reason: "And We created man to worship", 
    category: 'neutral' 
  },
  
  yearning: { 
    query: "patience gratitude longing halal desire", 
    reason: "Every person has a direction", 
    category: 'mixed' 
  },
  nostalgic: { 
    query: "past blessings gratitude remembrance patience", 
    reason: "Remember the favors of your Lord", 
    category: 'mixed' 
  },
  bored: { 
    query: "righteous deeds productivity remembrance dhikr", 
    reason: "Remember your Lord much", 
    category: 'mixed' 
  },
  restless: { 
    query: "patience gratitude peace remembrance", 
    reason: "Hearts find rest in remembrance", 
    category: 'mixed' 
  }
};

const FEELING_PHRASES: Record<string, string[]> = {
  rejected: ['feeling rejected', 'rejected', 'feel rejected', 'no one wants me', 'left out', 'pushed away'],
  alone: ['feeling alone', 'alone', 'by myself', 'no one here'],
  lonely: ['feeling lonely', 'lonely', 'no one understands', 'isolated', 'abandoned'],
  anxious: ['feeling anxious', 'anxious', 'worried', 'nervous', 'stressed', 'can\'t relax', 'overthinking'],
  worried: ['feeling worried', 'worried', 'worrying', 'concerned', 'uneasy'],
  lost: ['feeling lost', 'lost', 'don\'t know where to go', 'no direction', 'confused about life'],
  sad: ['feeling sad', 'sad', 'down', 'depressed', 'unhappy', 'blue', 'grief', 'sorrow', 'heartbroken'],
  hurt: ['feeling hurt', 'wounded', 'pain', 'emotional pain', 'betrayed', 'let down', 'pain'],
  fearful: ['feeling fearful', 'scared', 'afraid', 'terrified', 'frightened', 'fear'],
  hopeless: ['feeling hopeless', 'hopeless', 'giving up', 'no hope', 'what\'s the point', 'can\'t go on', 'helpless'],
  guilty: ['feeling guilty', 'guilty', 'regret', 'should have', 'sorry for what i did', 'bad about', 'remorse'],
  angry: ['feeling angry', 'angry', 'mad', 'frustrated', 'annoyed', 'irritated', 'furious', 'rage'],
  disappointed: ['feeling disappointed', 'disappointed', 'let down', 'unfulfilled', 'not what i expected'],
  jealous: ['feeling jealous', 'jealous', 'envious', 'wish i had', 'not fair', 'others have it better'],
  tired: ['feeling tired', 'tired', 'exhausted', 'so tired', 'drained', 'worn out', 'fatigued', 'burned out'],
  overwhelmed: ['feeling overwhelmed', 'overwhelmed', 'too much', 'can\'t cope', 'swamped', 'drowning', 'everything at once'],
  confused: ['feeling confused', 'confused', 'don\'t know what to do', 'uncertain', 'can\'t think clearly', 'mixed up'],
  struggling: ['struggling with', 'struggling', 'going through', 'hard time', 'can\'t handle', 'burdened'],
  doubtful: ['feeling doubtful', 'doubtful', 'not sure', 'uncertain', 'questioning', 'skeptical'],
  frustrated: ['feeling frustrated', 'frustrated', 'stuck', 'blocked', 'fed up'],
  stressed: ['feeling stressed', 'stressed', 'on edge', 'tense'],
  depressed: ['feeling depressed', 'depressed', 'low', 'heavy heart'],
  betrayed: ['feeling betrayed', 'betrayed', 'backstabbed', 'hurt by someone'],
  
  grateful: ['feeling grateful', 'grateful', 'thankful', 'blessed', 'appreciative', 'count my blessings'],
  thankful: ['feeling thankful', 'thankful', 'so grateful', 'really appreciate'],
  happy: ['feeling happy', 'happy', 'joyful', 'cheerful', 'feeling good'],
  blessed: ['feeling blessed', 'blessed', 'so blessed', 'god has been good'],
  content: ['feeling content', 'content', 'satisfied', 'at peace with what i have'],
  peaceful: ['feeling peaceful', 'peaceful', 'calm', 'serene', 'tranquil', 'at ease'],
  hopeful: ['feeling hopeful', 'hopeful', 'optimistic', 'looking forward', 'positive about future'],
  proud: ['feeling proud', 'proud', 'accomplished', 'did well', 'happy with myself', 'successful'],
  excited: ['feeling excited', 'excited', 'can\'t wait', 'thrilled', 'pumped'],
  motivated: ['feeling motivated', 'motivated', 'ready to go', 'fire inside'],
  inspired: ['feeling inspired', 'inspired', 'moved', 'touched', 'wow'],
  joyful: ['feeling joyful', 'joyful', 'full of joy', 'light hearted'],
  accomplished: ['feeling accomplished', 'accomplished', 'did it', 'finished', 'achieved'],
  'at peace': ['at peace', 'feeling at peace', 'feel at peace'],
  confident: ['feeling confident', 'confident', 'sure of myself', 'believing'],
  loving: ['loving', 'in love', 'feeling loving', 'love'],
  
  searching: ['searching for', 'looking for meaning', 'seeking', 'trying to find', 'want guidance'],
  curious: ['curious', 'wondering', 'wants to know', 'questioning'],
  reflective: ['reflective', 'thinking', 'contemplating', 'self reflection'],
  introspective: ['introspective', 'looking within', 'self examination'],
  
  yearning: ['longing for', 'yearning', 'wishing for', 'craving', 'desire', 'wanting something more'],
  nostalgic: ['nostalgic', 'miss the past', 'remember when', 'miss those days'],
  bored: ['bored', 'nothing to do', 'boring', 'don\'t know what to do with myself'],
  restless: ['restless', 'can\'t sit still', 'fidgety', 'need something']
};

const POSITIVE_KEYWORDS = [
  'grateful', 'thankful', 'happy', 'joy', 'joyful', 'blessed', 'content', 'peaceful', 'at peace',
  'hopeful', 'proud', 'excited', 'motivated', 'inspired', 'love', 'loving', 'accomplished',
  'confident', 'cheerful', 'wonderful', 'amazing', 'great', 'good', 'better'
];

const NEGATIVE_KEYWORDS = [
  'sad', 'unhappy', 'depressed', 'anxious', 'worried', 'fear', 'afraid', 'scared', 'lonely',
  'alone', 'rejected', 'hurt', 'pain', 'angry', 'mad', 'frustrated', 'annoyed',
  'guilty', 'regret', 'hopeless', 'lost', 'confused', 'overwhelmed', 'stressed',
  'tired', 'exhausted', 'fed up', 'betrayed', 'disappointed', 'jealous'
];

export const transformQuery = (input: string): TransformedQuery | null => {
  const normalizedInput = input.toLowerCase().trim();
  
  for (const [feeling, phrases] of Object.entries(FEELING_PHRASES)) {
    for (const phrase of phrases) {
      if (normalizedInput.includes(phrase)) {
        const theme = FEELING_TO_THEME[feeling];
        if (theme) {
          return { ...theme, reason: `${theme.reason} (${feeling})` };
        }
      }
    }
  }
  
  for (const feeling of Object.keys(FEELING_TO_THEME)) {
    if (normalizedInput.includes(feeling)) {
      const theme = FEELING_TO_THEME[feeling];
      if (theme) {
        return { ...theme, reason: `${theme.reason} (${feeling})` };
      }
    }
  }
  
  const hasPositive = POSITIVE_KEYWORDS.some(kw => normalizedInput.includes(kw));
  if (hasPositive) {
    return {
      query: "blessings gratitude thanks increase favor",
      reason: "Countless blessings to be grateful for (positive)",
      category: 'positive'
    };
  }
  
  const hasNegative = NEGATIVE_KEYWORDS.some(kw => normalizedInput.includes(kw));
  if (hasNegative) {
    return {
      query: "mercy hope comfort ease after difficulty",
      reason: "Indeed with hardship comes ease (difficult)",
      category: 'negative'
    };
  }
  
  return {
    query: normalizedInput,
    reason: "Seeking guidance",
    category: 'neutral'
  };
};

export const getCategoryLabel = (category: TransformedQuery['category']): string => {
  switch (category) {
    case 'negative': return 'Difficult Feeling';
    case 'positive': return 'Positive Feeling';
    case 'neutral': return 'Searching';
    case 'mixed': return 'Mixed';
    default: return 'General';
  }
};