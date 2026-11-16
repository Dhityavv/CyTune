export interface CosmeticItem {
  id: string;
  name: string;
  category: 'frame' | 'border' | 'background';
  description: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  isPremiumOnly: boolean;
  accentColor: string;
  previewGradient?: string;
  tag?: string;
}

export const AVATAR_FRAMES: CosmeticItem[] = [
  {
    id: 'frame-solar-halo',
    name: 'Solar Halo',
    category: 'frame',
    description: 'Radiant champagne gold corona ring with an ethereal solar flare pulse.',
    rarity: 'Legendary',
    isPremiumOnly: false,
    accentColor: '#C9A94D',
    previewGradient: 'radial-gradient(circle, #C9A94D 0%, #8A6F27 100%)',
    tag: 'Popular',
  },
  {
    id: 'frame-celestial-orbit',
    name: 'Celestial Orbit',
    category: 'frame',
    description: 'Slowly revolving lunar crescent with stardust particle trail.',
    rarity: 'Epic',
    isPremiumOnly: false,
    accentColor: '#E6D59A',
    previewGradient: 'linear-gradient(135deg, #E6D59A 0%, #685721 100%)',
    tag: 'Celestial',
  },
  {
    id: 'frame-aurora-ring',
    name: 'Aurora Ring',
    category: 'frame',
    description: 'Bioluminescent deep teal and indigo atmospheric flow.',
    rarity: 'Rare',
    isPremiumOnly: false,
    accentColor: '#2DD4BF',
    previewGradient: 'linear-gradient(135deg, #2DD4BF 0%, #3B82F6 100%)',
  },
  {
    id: 'frame-liquid-chrome',
    name: 'Liquid Chrome',
    category: 'frame',
    description: 'Ultra-reflective fluid mercury ring with metallic surface sheen.',
    rarity: 'Epic',
    isPremiumOnly: false,
    accentColor: '#94A3B8',
    previewGradient: 'linear-gradient(135deg, #E2E8F0 0%, #475569 100%)',
  },
  {
    id: 'frame-golden-relic',
    name: 'Golden Relic',
    category: 'frame',
    description: 'Intricately sculpted baroque filigree ring with antique gold patina.',
    rarity: 'Legendary',
    isPremiumOnly: false,
    accentColor: '#D4AF37',
    previewGradient: 'linear-gradient(135deg, #F59E0B 0%, #78350F 100%)',
    tag: 'Exclusive',
  },
  {
    id: 'frame-prism-circuit',
    name: 'Prism Circuit',
    category: 'frame',
    description: 'High-tech cyber vector circuitry glowing with volt-lime power traces.',
    rarity: 'Rare',
    isPremiumOnly: false,
    accentColor: '#BBF41D',
    previewGradient: 'linear-gradient(135deg, #BBF41D 0%, #15803D 100%)',
    tag: 'Hi-Tech',
  },
];

export const PROFILE_BORDERS: CosmeticItem[] = [
  {
    id: 'border-animated-gold',
    name: 'Animated Gold Edge',
    category: 'border',
    description: 'Continuous linear champagne gold sweep gliding across perimeter corners.',
    rarity: 'Legendary',
    isPremiumOnly: false,
    accentColor: '#C9A94D',
    previewGradient: 'linear-gradient(90deg, #C9A94D 0%, #FBF3D5 50%, #8A6F27 100%)',
    tag: 'Signature',
  },
  {
    id: 'border-subtle-neon',
    name: 'Subtle Neon Edge',
    category: 'border',
    description: 'Precision 1px hairline volt glow with illuminated corner nodes.',
    rarity: 'Rare',
    isPremiumOnly: false,
    accentColor: '#BBF41D',
    previewGradient: 'linear-gradient(135deg, #BBF41D 0%, #1E293B 100%)',
  },
  {
    id: 'border-aurora',
    name: 'Aurora Border',
    category: 'border',
    description: 'Slow-shifting twilight gradient transitioning between polar teal and deep violet.',
    rarity: 'Epic',
    isPremiumOnly: false,
    accentColor: '#38BDF8',
    previewGradient: 'linear-gradient(135deg, #38BDF8 0%, #6366F1 100%)',
  },
  {
    id: 'border-metallic',
    name: 'Metallic Frame',
    category: 'border',
    description: 'Brushed dark titanium border with beveled champagne corner bolts.',
    rarity: 'Common',
    isPremiumOnly: false,
    accentColor: '#64748B',
    previewGradient: 'linear-gradient(135deg, #334155 0%, #0F172A 100%)',
  },
  {
    id: 'border-dark-crystal',
    name: 'Dark Crystal',
    category: 'border',
    description: 'Faceted obsidian silhouette adorned with sharp geometric prism refraction.',
    rarity: 'Epic',
    isPremiumOnly: false,
    accentColor: '#A855F7',
    previewGradient: 'linear-gradient(135deg, #7E22CE 0%, #1E1B4B 100%)',
    tag: 'Refractive',
  },
];

export const PROFILE_BACKGROUNDS: CosmeticItem[] = [
  {
    id: 'bg-space-nebula',
    name: 'Deep Space Nebula',
    category: 'background',
    description: 'Volumetric cosmic stardust clouds centered around an amber hypergiant core.',
    rarity: 'Legendary',
    isPremiumOnly: true,
    accentColor: '#C9A94D',
    previewGradient: 'radial-gradient(ellipse at top, #2C1B4D 0%, #0A0A12 80%)',
    tag: 'Hi-Fi Premium',
  },
  {
    id: 'bg-soundwave',
    name: 'Luminous Soundwave',
    category: 'background',
    description: 'Flowing holographic audio frequency silk ribbons suspended in low gravity.',
    rarity: 'Epic',
    isPremiumOnly: true,
    accentColor: '#BBF41D',
    previewGradient: 'linear-gradient(160deg, #064E3B 0%, #022C22 50%, #030712 100%)',
    tag: 'Hi-Fi Premium',
  },
  {
    id: 'bg-midnight-city',
    name: 'Midnight Cityscape',
    category: 'background',
    description: 'Cinematic nocturne city skyline shrouded in rainy atmospheric bokeh and amber lights.',
    rarity: 'Rare',
    isPremiumOnly: true,
    accentColor: '#38BDF8',
    previewGradient: 'linear-gradient(180deg, #0F172A 0%, #020617 100%)',
    tag: 'Hi-Fi Premium',
  },
  {
    id: 'bg-cosmic-aurora',
    name: 'Cosmic Aurora',
    category: 'background',
    description: 'Slowly shifting green and indigo polar auroral drapery across the event horizon.',
    rarity: 'Epic',
    isPremiumOnly: true,
    accentColor: '#2DD4BF',
    previewGradient: 'linear-gradient(135deg, #0F766E 0%, #1E1B4B 60%, #030712 100%)',
    tag: 'Hi-Fi Premium',
  },
  {
    id: 'bg-liquid-silk',
    name: 'Dark Liquid Silk',
    category: 'background',
    description: 'Smooth ebony organic fluid contours with shimmering champagne gold specular sheen.',
    rarity: 'Legendary',
    isPremiumOnly: true,
    accentColor: '#C9A94D',
    previewGradient: 'radial-gradient(circle at center, #1E1A14 0%, #0A0A0A 100%)',
    tag: 'Hi-Fi Premium',
  },
  {
    id: 'bg-celestial-horizon',
    name: 'Celestial Horizon',
    category: 'background',
    description: 'Starlit event horizon blending faint twilight glow with obsidian orbital space.',
    rarity: 'Rare',
    isPremiumOnly: true,
    accentColor: '#6366F1',
    previewGradient: 'linear-gradient(180deg, #1E1B4B 0%, #0B0A1A 50%, #000000 100%)',
    tag: 'Hi-Fi Premium',
  },
];

export const ALL_COSMETICS: CosmeticItem[] = [
  ...AVATAR_FRAMES,
  ...PROFILE_BORDERS,
  ...PROFILE_BACKGROUNDS,
];

export function getCosmeticById(id?: string | null): CosmeticItem | undefined {
  if (!id) return undefined;
  return ALL_COSMETICS.find((c) => c.id === id);
}
