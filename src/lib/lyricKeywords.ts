// Lyric Keywords, Kinetic Themed System & Mood Classifier for CyTune Dynamic Karaoke

import { LyricsWord } from '@/types/music';
import { resolveContextualCategory } from './lyric-effects/context-rules';

export type SongPace = 'chill' | 'hype' | 'dynamic';

export interface StyledWord {
  raw: string;
  display: string;
  clean: string;
  isKeyword: boolean;
  category?: string;
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
    | 'clock'
    | 'ring'
    | 'jewelry'
    | 'phone';
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
    | 'clock'
    | 'ring'
    | 'jewelry'
    | 'phone';
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
    | 'clock'
    | 'ring'
    | 'jewelry'
    | 'phone';
  effectClass?: string;
  chillEffectClass?: string;
  category: string;
  icon: string;
  tag: string;
  accentColor: string;
  transformUpper?: boolean;
}

const KEYWORD_RULES: KeywordRule[] = [
  // 1. JEWELRY & DIAMONDS (Bling, chains, rings, wrist, diamond luster)
  {
    words: [
      'chain',
      'chains',
      'wrist',
      'ring',
      'rings',
      'necklace',
      'necklaces',
      'diamond',
      'diamonds',
      'baguette',
      'pendant',
      'locket',
      'bling',
      'jewel',
      'jewels',
      'jewelry',
      'bezel',
      'pinky',
      'rocks',
      'stones',
      'karat',
      'carat',
      'vvs',
      'solitaire',
    ],
    colorClass: 'text-cyan-200 font-black drop-shadow-[0_0_20px_rgba(103,232,249,0.95)]',
    emoji: '💎',
    assetType: 'ring',
    effectClass: 'animate-lyric-crystal',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Jewelry',
    icon: '💎',
    tag: 'Bling',
    accentColor: '#67E8F9',
  },

  // 2. LUXURY & FASHION (Designer houses, haute couture, tailored status)
  {
    words: [
      'gucci',
      'prada',
      'versace',
      'dior',
      'chanel',
      'fendi',
      'balenciaga',
      'louis',
      'vuitton',
      'designer',
      'couture',
      'birkin',
      'hermes',
      'goyard',
      'cartier',
      'rolex',
      'tailored',
      'silk',
      'velvet',
    ],
    colorClass: 'text-amber-200 font-black drop-shadow-[0_0_20px_rgba(253,230,138,0.95)]',
    emoji: '✨',
    assetType: 'crown',
    effectClass: 'animate-lyric-luxury',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Luxury',
    icon: '✨',
    tag: 'Designer',
    accentColor: '#FDE68A',
  },

  // 3. CELEBRATION & VIBES (Party, toast, bottles, champagne energy)
  {
    words: [
      'party',
      'celebrate',
      'celebration',
      'toast',
      'champagne',
      'bottles',
      'bottle',
      'cheers',
      'confetti',
      'drink',
      'drinks',
      'sipping',
      'liquor',
      'tequila',
      'henny',
      'shots',
      'cocktail',
      'turnup',
      'vibe',
      'vibes',
      'bless',
      'blessed',
      'poppin',
      'popping',
      'shining',
    ],
    colorClass: 'text-yellow-300 font-black drop-shadow-[0_0_20px_rgba(253,224,71,0.9)]',
    emoji: '🎉',
    assetType: 'spark',
    effectClass: 'animate-lyric-party',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Celebration',
    icon: '🥂',
    tag: 'Turn Up',
    accentColor: '#FACC15',
  },

  // 4. BIG, GIANT, HUGE, BOSS, COLOSSAL (Golden scale expansion)
  {
    words: ['big', 'huge', 'giant', 'massive', 'boss', 'grand', 'colossal', 'colossus', 'mammoth', 'titan', 'monstrous'],
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

  // 5. PULL, ACTION, SPEED, DRIFT (Kinetic neon lime dash)
  {
    words: [
      'pull',
      'slide',
      'dash',
      'speed',
      'rush',
      'drift',
      'glide',
      'drive',
      'jump',
      'zoom',
      'cruise',
      'accelerate',
      'sprint',
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

  // 6. LOOT, MONEY, WEALTH, RACKS (Emerald mint cash bounce)
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
      'million',
      'billion',
      'bag',
      'revenue',
      'coins',
      'hundreder',
      'currency',
      'payroll',
      'stacks',
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

  // 7. FIRE, FLAME, HEAT, BURN (Fiery orange/red blaze flicker)
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
      'ignite',
      'inferno',
      'flare',
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

  // 8. ICE, COLD, FREEZE (Frostbite cyan crystalline shine)
  {
    words: [
      'ice',
      'iced',
      'cold',
      'freeze',
      'freezing',
      'frost',
      'chilly',
      'glacier',
      'snow',
      'frozen',
      'winter',
      'zero',
      'blizzard',
      'arctic',
      'polar',
      'subzero',
    ],
    colorClass: 'text-cyan-300 font-black drop-shadow-[0_0_20px_rgba(103,232,249,0.95)]',
    emoji: '🧊',
    assetType: 'ice',
    effectClass: 'animate-lyric-ice',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Frost',
    icon: '❄️',
    tag: 'Ice',
    accentColor: '#06B6D4',
  },

  // 9. LOVE, HEART, EMOTIONS (Amethyst purple pulse - Nocturne compliant)
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
      'forever',
      'sweet',
      'honey',
      'beautiful',
      'angel',
      'protect',
      'romance',
      'embrace',
    ],
    colorClass: 'text-purple-400 font-black drop-shadow-[0_0_18px_rgba(192,132,252,0.85)]',
    emoji: '💜',
    assetType: 'heart',
    effectClass: 'animate-lyric-beat',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Emotion',
    icon: '💜',
    tag: 'Feelings',
    accentColor: '#C084FC',
  },

  // 10. STARS, DREAMS, MOON, COSMOS (Starlight purple twinkle)
  {
    words: [
      'stars',
      'star',
      'moon',
      'sky',
      'clouds',
      'cloud',
      'fly',
      'flying',
      'wings',
      'soar',
      'heaven',
      'horizon',
      'dream',
      'dreams',
      'orbit',
      'universe',
      'shine',
      'glow',
      'sun',
      'sunrise',
      'sunset',
      'dawn',
      'glimmer',
      'galaxy',
      'astral',
      'constellation',
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

  // 11. CROWN, KING, QUEEN, ROYAL, CHAMPION
  {
    words: [
      'king',
      'queen',
      'royal',
      'crown',
      'champion',
      'throne',
      'glory',
      'legend',
      'goat',
      'monarch',
      'majesty',
      'dynasty',
      'emperor',
      'empress',
    ],
    colorClass: 'text-yellow-400 font-black drop-shadow-[0_0_20px_rgba(250,204,21,0.9)]',
    emoji: '👑',
    assetType: 'crown',
    effectClass: 'animate-lyric-crown',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Royalty',
    icon: '👑',
    tag: 'Reign',
    accentColor: '#EAB308',
    transformUpper: true,
  },

  // 12. LOCKDOWN, 24/7, SECURITY
  {
    words: [
      'lockdown',
      'locked',
      'lock',
      'prison',
      'jail',
      'cell',
      '24/7',
      'clock',
      'midnight',
      '4:00',
      'alarm',
      'curfew',
      'vault',
      'siren',
    ],
    colorClass: 'text-slate-300 font-mono font-black drop-shadow-[0_0_16px_rgba(148,163,184,0.85)]',
    emoji: '🔒',
    assetType: 'lock',
    effectClass: 'animate-lyric-shake',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Security',
    icon: '🔒',
    tag: 'Lockdown',
    accentColor: '#94A3B8',
  },

  // 13. SNEAKER, DRIP, HOODIE, STREETWEAR
  {
    words: [
      'nike',
      'nikes',
      'jordans',
      'shoes',
      'kicks',
      'drip',
      'sneakers',
      'hoodie',
      'fit',
      'outfit',
      'denim',
      'tracksuit',
      'apparel',
      'supreme',
      'bape',
      'stussy',
      'streetwear',
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

  // 14. ELECTRIC, SHOCK, THUNDER, VOLTAGE
  {
    words: [
      'electric',
      'shock',
      'thunder',
      'lightning',
      'voltage',
      'power',
      'spark',
      'flash',
      'volt',
      'high-voltage',
      'watt',
      'surge',
    ],
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

  // 15. TOWN, CITY, METRO, HOOD
  {
    words: [
      'town',
      'city',
      'block',
      'street',
      'streets',
      'hood',
      'crib',
      'avenue',
      'boulevard',
      'downtown',
      'alley',
      'subway',
      'lights',
      'headlights',
      'streetlights',
      'neon-lights',
      'spotlight',
      'strobe',
      'flashing-lights',
      'beams',
    ],
    colorClass: 'text-sky-400 font-black drop-shadow-[0_0_14px_rgba(56,189,248,0.75)]',
    emoji: '🏙️',
    assetType: 'news',
    effectClass: 'animate-lyric-beat',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Metro',
    icon: '🏙️',
    tag: 'Block',
    accentColor: '#0EA5E9',
  },

  // 16. AUTOMOTIVE & CARS (Supercars, horsepower, engines, luxury rides)
  {
    words: [
      'lambo',
      'lamborghini',
      'ferrari',
      'porsche',
      'mclaren',
      'bentley',
      'maybach',
      'bugatti',
      'rolls-royce',
      'corvette',
      'escalade',
      'hellcat',
      'supercar',
      'horsepower',
      'coupe',
      'coupes',
      'whip',
      'benz',
      'truck',
      'ride',
      'engine',
      'transmission',
      'v8',
      'v12',
      'turbo',
      'supercharged',
      'speedometer',
    ],
    colorClass: 'text-red-400 font-black drop-shadow-[0_0_18px_rgba(248,113,113,0.9)]',
    emoji: '🏎️',
    assetType: 'shoe',
    effectClass: 'animate-lyric-pull',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Automotive',
    icon: '🏎️',
    tag: 'Horsepower',
    accentColor: '#EF4444',
  },

  // 17. HEARTBREAK & LOSS (Shattered feelings, separation, sorrow)
  {
    words: [
      'heartbroken',
      'heartbreak',
      'betrayed',
      'shattered',
      'alone',
      'empty',
      'stranger',
      'goodbye',
      'scars',
      'hurts',
      'hurting',
      'bleeding',
      'teardrops',
      'unloved',
      'abandoned',
      'sorrow',
      'grief',
    ],
    colorClass: 'text-indigo-400 font-black drop-shadow-[0_0_18px_rgba(129,140,248,0.85)]',
    emoji: '💔',
    assetType: 'heart',
    effectClass: 'animate-lyric-chill',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Heartbreak',
    icon: '💔',
    tag: 'Pain',
    accentColor: '#818CF8',
  },

  // 18. ANGER, RAGE & CONFLICT (Savage wrath, hostility, vengeance)
  {
    words: [
      'rage',
      'fury',
      'wrath',
      'revenge',
      'vengeance',
      'savage',
      'destroy',
      'destructive',
      'hostile',
      'enemy',
      'enemies',
      'slaughter',
      'rampage',
    ],
    colorClass: 'text-red-500 font-black drop-shadow-[0_0_22px_rgba(239,68,68,0.95)]',
    emoji: '⚔️',
    assetType: 'fire',
    effectClass: 'animate-lyric-flame',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Rage',
    icon: '⚔️',
    tag: 'Hostile',
    accentColor: '#DC2626',
    transformUpper: true,
  },

  // 19. WATER & OCEAN (Waves, deep sea, aquatic depths, tides)
  {
    words: [
      'ocean',
      'wave',
      'waves',
      'tsunami',
      'tides',
      'tide',
      'drown',
      'drowning',
      'sink',
      'sinking',
      'underwater',
      'waterfall',
      'currents',
      'submerged',
      'depths',
      'aquatic',
      'sea',
      'swim',
    ],
    colorClass: 'text-teal-300 font-black drop-shadow-[0_0_18px_rgba(94,234,212,0.9)]',
    emoji: '🌊',
    assetType: 'ice',
    effectClass: 'animate-lyric-beat',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Ocean',
    icon: '🌊',
    tag: 'Deep Blue',
    accentColor: '#14B8A6',
  },

  // 20. DARKNESS & SHADOWS (Abyss, nightfall, twilight, gloomy depth)
  {
    words: [
      'shadows',
      'shadow',
      'darkness',
      'abyss',
      'eclipse',
      'nightfall',
      'blackout',
      'underworld',
      'gloomy',
      'twilight',
      'nocturnal',
    ],
    colorClass: 'text-slate-400 font-black drop-shadow-[0_0_16px_rgba(148,163,184,0.7)]',
    emoji: '🌑',
    assetType: 'lock',
    effectClass: 'animate-lyric-shake',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Darkness',
    icon: '🌑',
    tag: 'Abyss',
    accentColor: '#64748B',
  },

  // 21. CONFIDENCE & EGO (Invincible, unmatched, elite greatness)
  {
    words: [
      'untouchable',
      'unmatched',
      'flawless',
      'alpha',
      'undefeated',
      'invincible',
      'superior',
      'elite',
      'legendary',
      'peerless',
      'masterpiece',
    ],
    colorClass: 'text-amber-400 font-black drop-shadow-[0_0_20px_rgba(251,191,36,0.95)]',
    emoji: '🦁',
    assetType: 'crown',
    effectClass: 'animate-lyric-crown',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Confidence',
    icon: '🦁',
    tag: 'Untouchable',
    accentColor: '#F59E0B',
    transformUpper: true,
  },

  // 22. SUCCESS & FAME (Spotlight, platinum, billboard, trophies)
  {
    words: [
      'famous',
      'spotlight',
      'grammy',
      'billboard',
      'platinum',
      'headlines',
      'celebrity',
      'superstar',
      'iconic',
      'triumph',
      'trophy',
      'hall-of-fame',
    ],
    colorClass: 'text-yellow-400 font-black drop-shadow-[0_0_20px_rgba(250,204,21,0.9)]',
    emoji: '🏆',
    assetType: 'big',
    effectClass: 'animate-lyric-big',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Fame',
    icon: '🏆',
    tag: 'Spotlight',
    accentColor: '#EAB308',
  },

  // 23. PEACE & SERENITY (Zen, healing, tranquility, calm solace)
  {
    words: [
      'serenity',
      'peaceful',
      'calm',
      'healing',
      'tranquil',
      'breathe',
      'harmony',
      'silence',
      'zen',
      'stillness',
      'meditate',
      'solace',
      'sleep',
      'sleeping',
      'asleep',
      'slumber',
      'pillow',
      'bed',
      'insomnia',
      'rest',
      'nap',
    ],
    colorClass: 'text-emerald-300 font-black drop-shadow-[0_0_18px_rgba(110,231,183,0.85)]',
    emoji: '🕊️',
    assetType: 'star',
    effectClass: 'animate-lyric-chill',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Serenity',
    icon: '🕊️',
    tag: 'Zen',
    accentColor: '#6EE7B7',
  },

  // 24. MUSIC, FREQUENCY & AUDIO (Subwoofers, synthesizers, 808 rhythms)
  {
    words: [
      'subwoofer',
      'treble',
      'melody',
      'rhythm',
      'synthesizer',
      'amplifier',
      'frequencies',
      'frequency',
      '808',
      'tempo',
      'acoustic',
      'stereo',
      'hi-fi',
      'soundwave',
    ],
    colorClass: 'text-cyan-400 font-black drop-shadow-[0_0_18px_rgba(34,211,238,0.9)]',
    emoji: '🔊',
    assetType: 'electric',
    effectClass: 'animate-lyric-beat',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Audio',
    icon: '🎧',
    tag: 'Frequency',
    accentColor: '#22D3EE',
  },

  // 25. ADLIBS & VOCAL FX (Signature rap adlibs and vocal kinetic pulses)
  {
    words: [
      'skrrt',
      'brr',
      'brrr',
      'ayy',
      'ayyy',
      'woah',
      'sheesh',
      'slatt',
      'holdup',
      'yuh',
      'brrat',
      'pew-pew',
    ],
    colorClass: 'text-lime-400 font-black italic drop-shadow-[0_0_18px_rgba(163,230,53,0.95)]',
    emoji: '⚡',
    assetType: 'spark',
    effectClass: 'animate-lyric-pull',
    chillEffectClass: 'animate-lyric-chill',
    category: 'VocalFX',
    icon: '🗣️',
    tag: 'Adlib',
    accentColor: '#A3E635',
  },

  // 26. CALLS, PHONE & CONNECTION (Late night hotline, ringing, cellular signals)
  {
    words: [
      'call',
      'calling',
      'calls',
      'phone',
      'hotline',
      'cellular',
      'dial',
      'dialing',
      'ring',
      'ringing',
      'ringtone',
      'facetime',
      'voicemail',
      'message',
      'texting',
    ],
    colorClass: 'text-sky-300 font-black drop-shadow-[0_0_18px_rgba(125,211,252,0.85)]',
    emoji: '📞',
    assetType: 'phone',
    effectClass: 'animate-lyric-beat',
    chillEffectClass: 'animate-lyric-chill',
    category: 'Connection',
    icon: '📞',
    tag: 'Hotline',
    accentColor: '#38BDF8',
  },
];

// Pre-computed Map for O(1) keyword lookup
const KEYWORD_MAP = new Map<string, KeywordRule>();
for (const rule of KEYWORD_RULES) {
  for (const word of rule.words) {
    const key = word.toLowerCase();
    if (!KEYWORD_MAP.has(key)) {
      KEYWORD_MAP.set(key, rule);
    }
  }
}

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

  for (let tokenIdx = 0; tokenIdx < rawWords.length; tokenIdx++) {
    const token = rawWords[tokenIdx];
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
      // Build sliding context window of +/- 3 surrounding tokens to disambiguate homonyms
      const surrounding: string[] = [];
      for (let j = Math.max(0, tokenIdx - 3); j <= Math.min(rawWords.length - 1, tokenIdx + 3); j++) {
        if (j !== tokenIdx) {
          const sClean = rawWords[j].toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
          if (sClean) surrounding.push(sClean);
        }
      }

      const overrideCategory = resolveContextualCategory(clean, surrounding);
      if (overrideCategory) {
        matchedRule =
          KEYWORD_RULES.find((r) => r.category.toLowerCase() === overrideCategory.toLowerCase()) ||
          KEYWORD_MAP.get(clean) ||
          null;
      } else {
        matchedRule = KEYWORD_MAP.get(clean) || null;
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
        category: matchedRule.category,
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
        category: 'Stylistic',
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
  const tokens = cleanLower.split(/[\s,.;:!?\-'"()\[\]]+/).filter(Boolean);
  const tokenSet = new Set(tokens);

  for (const rule of KEYWORD_RULES) {
    for (const w of rule.words) {
      const wLower = w.toLowerCase();
      const matched =
        wLower.includes(' ') || wLower.includes('/')
          ? new RegExp(`(^|\\b)${wLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(\\b|$)`, 'i').test(cleanLower)
          : tokenSet.has(wLower);

      if (matched) {
        const otherTokens = tokens.filter((t) => t !== wLower);
        const overrideCat = resolveContextualCategory(wLower, otherTokens);
        const activeRule = overrideCat
          ? KEYWORD_RULES.find((r) => r.category.toLowerCase() === overrideCat.toLowerCase()) || rule
          : rule;

        const parts = lineText.split(/[,.;!?]/).map((p) => p.trim()).filter(Boolean);
        const headline = parts[0] || lineText;
        const subline = parts[1] || `Feat. ${activeRule.category}`;

        return {
          category: activeRule.category,
          icon: activeRule.icon,
          tag: activeRule.tag,
          headline: headline.slice(0, 36),
          subline: subline.slice(0, 48),
          accentColor: activeRule.accentColor,
          assetType: activeRule.assetType,
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
