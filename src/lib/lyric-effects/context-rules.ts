// ============================================================
// CONTEXTUAL DISAMBIGUATION RULES FOR ORBITTUNE LYRICS
// Resolves homonyms and multi-meaning words using surrounding context window
// ============================================================

export interface ContextOverrideRule {
  targetWord: string;
  ifNearbyAny: string[];
  overrideCategoryId: string;
}

export const CONTEXT_RULES: ContextOverrideRule[] = [
  // 1. "ice" on wrist/neck/chain/rings -> Jewelry (not frost/temperature)
  {
    targetWord: 'ice',
    ifNearbyAny: [
      'wrist',
      'neck',
      'chain',
      'chains',
      'ring',
      'rings',
      'watch',
      'bezel',
      'carat',
      'karat',
      'vvs',
      'rocks',
      'bling',
      'shine',
      'shining',
      'baguette',
    ],
    overrideCategoryId: 'Jewelry',
  },

  // 2. "cold" with heart/love/eyes/soul -> Emotion (not temperature)
  {
    targetWord: 'cold',
    ifNearbyAny: ['heart', 'eyes', 'soul', 'feeling', 'world', 'love', 'inside', 'shoulder', 'alone'],
    overrideCategoryId: 'Emotion',
  },

  // 3. "whip" with drive/ride/coupe/keys/foreign -> Automotive (car/ride)
  {
    targetWord: 'whip',
    ifNearbyAny: ['drive', 'ride', 'coupe', 'car', 'foreign', 'keys', 'dash', 'steering', 'lot', 'parked', 'speed', 'engine'],
    overrideCategoryId: 'Automotive',
  },

  // 4. "fire" with heart/eyes/passion/love/desire -> Emotion
  {
    targetWord: 'fire',
    ifNearbyAny: ['heart', 'eyes', 'passion', 'desire', 'soul', 'love', 'tender'],
    overrideCategoryId: 'Emotion',
  },

  // 5. "fire" with enemies/war/bullets/kill/destroy -> Rage
  {
    targetWord: 'fire',
    ifNearbyAny: ['enemy', 'enemies', 'war', 'bullets', 'shoot', 'kill', 'destroy', 'burn', 'wrath'],
    overrideCategoryId: 'Rage',
  },

  // 6. "light" with stars/moon/sky/sun/shine/dawn -> Cosmic
  {
    targetWord: 'light',
    ifNearbyAny: ['stars', 'star', 'moon', 'sky', 'sun', 'shine', 'glow', 'dawn', 'beam', 'astral'],
    overrideCategoryId: 'Cosmic',
  },

  // 7. "crown" with king/queen/throne/goat/champion -> Royalty
  {
    targetWord: 'crown',
    ifNearbyAny: ['king', 'queen', 'throne', 'glory', 'reign', 'champion', 'legend', 'monarch'],
    overrideCategoryId: 'Royalty',
  },

  // 8. "wave" with ocean/sea/water/tide/tsunami -> Ocean
  {
    targetWord: 'wave',
    ifNearbyAny: ['ocean', 'sea', 'water', 'tide', 'tsunami', 'drown', 'shore', 'beach', 'surf'],
    overrideCategoryId: 'Ocean',
  },

  // 9. "tears" with heartbroken/goodbye/alone/cry -> Heartbreak
  {
    targetWord: 'tears',
    ifNearbyAny: ['heartbroken', 'goodbye', 'alone', 'broken', 'left', 'stranger', 'shattered', 'scars'],
    overrideCategoryId: 'Heartbreak',
  },
];

export function resolveContextualCategory(
  targetWord: string,
  surroundingTokens: string[]
): string | null {
  const target = targetWord.toLowerCase();
  const rules = CONTEXT_RULES.filter((r) => r.targetWord === target);
  if (rules.length === 0) return null;

  const nearbySet = new Set(surroundingTokens.map((t) => t.toLowerCase()));

  for (const rule of rules) {
    for (const signal of rule.ifNearbyAny) {
      if (nearbySet.has(signal)) {
        return rule.overrideCategoryId;
      }
    }
  }

  return null;
}
