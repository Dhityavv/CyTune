// Lyric Keywords, Kinetic Themed System & Mood Classifier for CyTune Dynamic Karaoke

import { LyricsWord } from '@/types/music';

export type SongPace = 'chill' | 'hype' | 'dynamic';

export interface StyledWord {
  raw: string;
  display: string;
  clean: string;
  isKeyword: boolean;
  time?: number; // millisecond-accurate vocal start time in seconds
  endTime?: number;
  colorClass?: string;
  extraClass?: string;
  emoji?: string;
  assetType?:
    | 'money'
    | 'ice'
    | 'fire'
    | 'big'
    | 'spark'
    | 'star'
    | 'shoe'
    | 'news'
    | 'lock'
    | 'heart'
    | 'electric'
    | 'crown'
    | 'clock';
  effectClass?: string;
}

export interface LyricPunchline {
  category: string;
  icon: string;
  tag: string;
  headline: string;
  subline: string;
  accentColor: string;
  assetType?:
    | 'money'
    | 'ice'
    | 'fire'
    | 'big'
    | 'spark'
    | 'star'
    | 'shoe'
    | 'news'
    | 'lock'
    | 'heart'
    | 'electric'
    | 'crown'
    | 'clock';
  notification?: {
    appName: string;
    headline: string;
    subline: string;
  };
}

// ============================================================
// SONG PACE & MOOD CLASSIFIER
// Accurately distinguishes chill/ballads from hype rap/trap
// ============================================================
export function detectSongPace(songTitle?: string, artist?: string): SongPace {
  const text = `${songTitle || ''} ${artist || ''}`.toLowerCase();

  const chillSignals = [
    'niki',
    'bruno mars',
    'adele',
    'joji',
    'billie eilish',
    'daniel caesar',
    'frank ocean',
    'sam smith',
    'laufey',
    'ed sheeran',
    'keshi',
    'mac ayres',
    'sza',
    'giveon',
    'brent faiyaz',
    'rex orange county',
    'cody fry',
    'ballad',
    'acoustic',
    'chill',
    'slow',
    'romantic',
    'heart',
    'sleep',
    'night',
    'you\'ll be in my heart',
    'risk it all',
    'talking to the moon',
    'versace on the floor',
    'when i was your man',
    'ocean eyes',
    'die with a smile',
    'glimpse of us',
    'lowkey',
    'every summertime',
  ];

  const hypeSignals = [
    'travis scott',
    'kendrick lamar',
    'drake',
    'playboi carti',
    'carti',
    '21 savage',
    'don toliver',
    'future',
    'metro boomin',
    'gunna',
    'lil uzi vert',
    'lil baby',
    'kanye west',
    'yeat',
    'asap rocky',
    'central cee',
    'jack harlow',
    'sicko mode',
    'money trees',
    'goosebumps',
    'fein',
    'no pole',
    'carnival',
    'rap',
    'trap',
    'drill',
    'hip hop',
    'subwoofer',
    'bass',
    'flex',
  ];

  for (const signal of chillSignals) {
    if (text.includes(signal)) return 'chill';
  }
  for (const signal of hypeSignals) {
    if (text.includes(signal)) return 'hype';
  }

  return 'dynamic';
}

interface KeywordRule {
  words: string[];
  colorClass: string;
  extraClass?: string;
  emoji?: string;
  assetType?:
    | 'money'
    | 'ice'
    | 'fire'
    | 'big'
    | 'spark'
    | 'star'
    | 'shoe'
    | 'news'
    | 'lock'
    | 'heart'
    | 'electric'
    | 'crown'
    | 'clock';
  effectClass?: string;
  chillEffectClass?: string;
  category: string;
  icon: string;
  tag: string;
  accentColor: string;
  transformUpper?: boolean;
}

const KEYWORD_RULES: KeywordRule[] = [
  // 1. BIG, GIANT, HUGE, BOSS, COLOSSAL (Golden scale expansion)
  {
    words: ['big', 'huge', 'giant', 'massive', 'heavy', 'boss', 'great', 'grand', 'colossal', 'colossus'],
    colorClass: 'text-amber-300 font-black drop-shadow-[0_0_22px_rgba(251,191,36,0.95)]',
    extraClass: 'tracking-tight',
    emoji: '💥',
    assetType: 'big',
    effectClass: 'animate-lyric-big',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Colossal',
    icon: '💥',
    tag: 'Scale',
    accentColor: '#FBBF24',
    transformUpper: true,
  },

  // 2. PULL, ACTION, SPEED, DRIFT (Kinetic neon lime dash)
  {
    words: [
      'pull',
      'slide',
      'dash',
      'speed',
      'rush',
      'drift',
      'glide',
      'whip',
      'drive',
      'push',
      'move',
      'skrrt',
      'hop',
      'jump',
      'zoom',
      'cruise',
    ],
    colorClass: 'text-lime-300 font-black italic drop-shadow-[0_0_18px_rgba(190,242,100,0.95)]',
    extraClass: 'tracking-wide',
    emoji: '⚡',
    assetType: 'spark',
    effectClass: 'animate-lyric-pull',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Kinetic',
    icon: '⚡',
    tag: 'Motion',
    accentColor: '#A3E635',
  },

  // 3. LOOT, MONEY, WEALTH, RACKS (Emerald mint cash bounce)
  {
    words: [
      'loot',
      'money',
      'cash',
      'bands',
      'racks',
      'dollar',
      'dollars',
      'rich',
      'wealth',
      'bills',
      'bank',
      'million',
      'billion',
      'bag',
      'revenue',
      'gucci',
      'prada',
      'profit',
      'check',
      'coins',
    ],
    colorClass: 'text-emerald-400 font-black drop-shadow-[0_0_18px_rgba(52,211,153,0.9)]',
    emoji: '💰',
    assetType: 'money',
    effectClass: 'animate-lyric-money',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Loot',
    icon: '💰',
    tag: 'Incoming',
    accentColor: '#10B981',
  },

  // 4. FIRE, FLAME, HEAT, BURN (Fiery orange/red blaze flicker)
  {
    words: [
      'fire',
      'flame',
      'flames',
      'hot',
      'burn',
      'burning',
      'blaze',
      'blazing',
      'heat',
      'lit',
      'wild',
      'smoke',
      'ignite',
      'torch',
      'furious',
    ],
    colorClass: 'text-orange-500 font-black drop-shadow-[0_0_22px_rgba(249,115,22,0.95)]',
    emoji: '🔥',
    assetType: 'fire',
    effectClass: 'animate-lyric-flame',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Energy',
    icon: '🔥',
    tag: 'Flame',
    accentColor: '#F97316',
  },

  // 5. ICE, COLD, FREEZE, DIAMOND (Frostbite cyan crystalline shine)
  {
    words: [
      'ice',
      'iced',
      'cold',
      'freeze',
      'freezing',
      'diamond',
      'diamonds',
      'chain',
      'wrist',
      'frost',
      'chilly',
      'glacier',
      'snow',
      'frozen',
      'winter',
      'zero',
    ],
    colorClass: 'text-cyan-300 font-black drop-shadow-[0_0_20px_rgba(103,232,249,0.95)]',
    emoji: '🧊',
    assetType: 'ice',
    effectClass: 'animate-lyric-ice',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Frost',
    icon: '💎',
    tag: 'Ice',
    accentColor: '#06B6D4',
  },

  // 6. LOVE, HEART, EMOTIONS, BALLAD (Rose quartz pulse or gentle chill glow)
  {
    words: [
      'love',
      'loved',
      'heart',
      'kiss',
      'baby',
      'darling',
      'tears',
      'cry',
      'crying',
      'broken',
      'smile',
      'feel',
      'touch',
      'safe',
      'warm',
      'forever',
      'sweet',
      'honey',
      'beautiful',
      'angel',
      'protect',
      'hold',
    ],
    colorClass: 'text-pink-400 font-black drop-shadow-[0_0_18px_rgba(244,114,182,0.9)]',
    emoji: '❤️',
    assetType: 'heart',
    effectClass: 'animate-lyric-beat',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Emotion',
    icon: '💖',
    tag: 'Feelings',
    accentColor: '#EC4899',
  },

  // 7. NIGHT, STARS, DREAMS, MOON, COSMOS (Starlight purple twinkle)
  {
    words: [
      'night',
      'stars',
      'star',
      'moon',
      'sky',
      'dream',
      'dreams',
      'dark',
      'orbit',
      'universe',
      'shine',
      'glow',
      'light',
      'sun',
      'sunrise',
      'sunset',
      'dawn',
      'glimmer',
    ],
    colorClass: 'text-violet-300 font-black drop-shadow-[0_0_18px_rgba(196,181,253,0.85)]',
    emoji: '✨',
    assetType: 'star',
    effectClass: 'animate-lyric-star',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Cosmic',
    icon: '✨',
    tag: 'Starlight',
    accentColor: '#A855F7',
  },

  // 8. CROWN, KING, QUEEN, ROYAL, CHAMPION
  {
    words: ['king', 'queen', 'royal', 'crown', 'champion', 'throne', 'glory', 'legend', 'goat'],
    colorClass: 'text-yellow-400 font-black drop-shadow-[0_0_20px_rgba(250,204,21,0.9)]',
    emoji: '👑',
    assetType: 'crown',
    effectClass: 'animate-lyric-big',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Royalty',
    icon: '👑',
    tag: 'Reign',
    accentColor: '#EAB308',
    transformUpper: true,
  },

  // 9. LOCKDOWN, 24 HOURS, TIME, 4:00 AM
  {
    words: [
      'lockdown',
      'locked',
      'lock',
      'prison',
      'jail',
      'cell',
      '24',
      'hour',
      'hours',
      'clock',
      'time',
      'midnight',
      '4:00',
      'morning',
      'alarm',
    ],
    colorClass: 'text-rose-400 font-mono font-black drop-shadow-[0_0_16px_rgba(251,113,133,0.85)]',
    emoji: '🔒',
    assetType: 'lock',
    effectClass: 'animate-lyric-shake',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Security',
    icon: '🔒',
    tag: '24 Hours',
    accentColor: '#F43F5E',
  },

  // 10. SNEAKER, DRIP, COUPES, WHIP, CARS
  {
    words: [
      'nike',
      'nikes',
      'jordans',
      'shoes',
      'kicks',
      'coupe',
      'coupes',
      'whip',
      'ride',
      'lambo',
      'ferrari',
      'porsche',
      'benz',
      'truck',
      'drip',
    ],
    colorClass: 'text-blue-400 font-black drop-shadow-[0_0_16px_rgba(96,165,250,0.85)]',
    emoji: '👟',
    assetType: 'shoe',
    effectClass: 'animate-lyric-pull',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Streetwear',
    icon: '👟',
    tag: 'Nike boy',
    accentColor: '#3B82F6',
  },

  // 11. ELECTRIC, SHOCK, THUNDER, VOLTAGE
  {
    words: ['electric', 'shock', 'thunder', 'lightning', 'voltage', 'power', 'spark', 'flash', 'volt'],
    colorClass: 'text-amber-300 font-black drop-shadow-[0_0_20px_rgba(251,191,36,0.95)]',
    emoji: '⚡',
    assetType: 'electric',
    effectClass: 'animate-lyric-shake',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Action',
    icon: '⚡',
    tag: 'High Voltage',
    accentColor: '#F59E0B',
  },

  // 12. TOWN, CITY, NEWS, HOOD
  {
    words: ['town', 'city', 'news', 'block', 'street', 'streets', 'hood', 'crib', 'home', 'avenue'],
    colorClass: 'text-sky-400 font-black drop-shadow-[0_0_14px_rgba(56,189,248,0.75)]',
    emoji: '📰',
    assetType: 'news',
    effectClass: 'animate-lyric-beat',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Metro',
    icon: '🏙️',
    tag: 'Block',
    accentColor: '#0EA5E9',
  },
];

// Stylistic word classes (exact typography as seen in reference screenshots)
const STYLISTIC_WORDS: Record<string, { extraClass: string; display?: string; effectClass?: string }> = {
  way: { extraClass: 'font-serif italic font-normal text-zinc-300' },
  old: { extraClass: 'italic font-serif text-zinc-300' },
  coupes: { extraClass: 'italic font-serif text-slate-200' },
  coupe: { extraClass: 'italic font-serif text-slate-200' },
  duck: { extraClass: 'italic font-semibold text-sky-300' },
  too: { extraClass: 'font-semibold tracking-wider text-white/90' },
  yeah: { extraClass: 'italic font-black text-amber-200 tracking-wide' },
  schyeah: { extraClass: 'italic font-black text-purple-300 tracking-wide' },
  whoa: { extraClass: 'font-black text-purple-300 tracking-wide' },
  shit: { extraClass: 'font-black text-white' },
  truth: { extraClass: 'font-bold text-amber-200' },
  lie: { extraClass: 'italic font-bold text-rose-300' },
  stuck: { extraClass: 'font-bold text-violet-300' },
};

export function parseLyricWords(
  lineText: string,
  pace: SongPace = 'dynamic',
  lineWords?: LyricsWord[],
  lineStartTime: number = 0,
  lineEndTime?: number
): StyledWord[] {
  if (!lineText) return [];

  // Split line by whitespace so punctuation stays attached to its word naturally (e.g. "is," not "is" + ",")
  const rawWords = lineText.trim().split(/\s+/).filter(Boolean);
  if (rawWords.length === 0) return [];

  const totalActual = rawWords.length;
  let wordSyncIdx = 0;
  let wordCounter = 0;

  const result: StyledWord[] = [];

  for (const token of rawWords) {
    const clean = token.toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
    const styleOverride = clean ? STYLISTIC_WORDS[clean] : undefined;

    // Determine millisecond-exact vocal timestamp
    let wordTime: number | undefined = undefined;
    let wordEndTime: number | undefined = undefined;

    if (clean.length > 0) {
      if (lineWords && lineWords.length > 0 && wordSyncIdx < lineWords.length) {
        // True millisecond-accurate word-sync from lyricsfile
        wordTime = lineWords[wordSyncIdx].time;
        wordEndTime = lineWords[wordSyncIdx].endTime;
        wordSyncIdx++;
      } else {
        // Fallback: allocate timestamp from line start time
        const durationCap =
          lineEndTime && lineEndTime > lineStartTime
            ? Math.min(lineEndTime - lineStartTime, totalActual * 0.45)
            : Math.max(1.5, totalActual * 0.38);
        const progressFrac = totalActual > 1 ? wordCounter / (totalActual - 0.2) : 0;
        wordTime = lineStartTime + progressFrac * durationCap;
      }
      wordCounter++;
    }

    let matchedRule: KeywordRule | null = null;
    if (clean.length > 0) {
      for (const rule of KEYWORD_RULES) {
        if (rule.words.includes(clean)) {
          matchedRule = rule;
          break;
        }
      }
    }

    if (matchedRule) {
      const display = matchedRule.transformUpper ? token.toUpperCase() : token;
      const effectClass =
        pace === 'chill'
          ? matchedRule.chillEffectClass || 'animate-lyric-chill'
          : matchedRule.effectClass;

      result.push({
        raw: token,
        display,
        clean,
        isKeyword: true,
        time: wordTime,
        endTime: wordEndTime,
        colorClass: matchedRule.colorClass,
        extraClass: `${matchedRule.extraClass || ''} ${styleOverride?.extraClass || ''}`.trim(),
        emoji: matchedRule.emoji,
        assetType: matchedRule.assetType,
        effectClass,
      });
    } else if (styleOverride) {
      result.push({
        raw: token,
        display: styleOverride.display || token,
        clean,
        isKeyword: true,
        time: wordTime,
        endTime: wordEndTime,
        colorClass: 'text-white font-bold',
        extraClass: styleOverride.extraClass,
        effectClass: styleOverride.effectClass,
      });
    } else {
      result.push({
        raw: token,
        display: token,
        clean,
        isKeyword: false,
        time: wordTime,
        endTime: wordEndTime,
      });
    }
  }

  return result;
}

export function extractLinePunchline(
  lineText: string,
  songTitle: string = 'CyTune',
  artist: string = 'Artist'
): LyricPunchline {
  if (!lineText || lineText.trim().length === 0) {
    return {
      category: 'Now Playing',
      icon: '✨',
      tag: 'Live Stream',
      headline: songTitle,
      subline: `By ${artist}`,
      accentColor: '#FFFFFF',
    };
  }

  const cleanLower = lineText.toLowerCase();

  for (const rule of KEYWORD_RULES) {
    for (const w of rule.words) {
      if (cleanLower.includes(w)) {
        const parts = lineText.split(/[,.;!?]/).map((p) => p.trim()).filter(Boolean);
        const headline = parts[0] || lineText;
        const subline = parts[1] || `Feat. ${rule.category}`;

        return {
          category: rule.category,
          icon: rule.icon,
          tag: rule.tag,
          headline: headline.slice(0, 36),
          subline: subline.slice(0, 48),
          accentColor: rule.accentColor,
          assetType: rule.assetType,
        };
      }
    }
  }

  const parts = lineText.split(/[,.;!?]/).map((p) => p.trim()).filter(Boolean);
  return {
    category: 'Vibe',
    icon: '⚡',
    tag: 'Lyrics',
    headline: parts[0]?.slice(0, 36) || lineText.slice(0, 36),
    subline: parts[1]?.slice(0, 48) || `From "${songTitle}"`,
    accentColor: '#FFFFFF',
  };
}
