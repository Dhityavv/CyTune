// High-Performance Dynamic Color Extraction & Vibrancy Analyzer for CyTune Ambient Lighting

export interface ColorRGB {
  r: number;
  g: number;
  b: number;
  hex: string;
  rgba: (alpha: number) => string;
}

// In-memory cache to guarantee 0ms instant loading for repeat tracks
const colorCache = new Map<string, ColorRGB>();

// Aesthetic default fallback palette
const AESTHETIC_PALETTE: ColorRGB[] = [
  { r: 201, g: 169, b: 77, hex: '#C9A94D', rgba: (a) => `rgba(201, 169, 77, ${a})` }, // Nocturne Gold
  { r: 239, g: 68, b: 68, hex: '#EF4444', rgba: (a) => `rgba(239, 68, 68, ${a})` },   // Crimson Red
  { r: 168, g: 85, b: 247, hex: '#A855F7', rgba: (a) => `rgba(168, 85, 247, ${a})` }, // Electric Purple
  { r: 59, g: 130, b: 246, hex: '#3B82F6', rgba: (a) => `rgba(59, 130, 246, ${a})` }, // Royal Blue
  { r: 244, g: 63, b: 94, hex: '#F43F5E', rgba: (a) => `rgba(244, 63, 94, ${a})` },   // Vibrant Rose
  { r: 16, g: 185, b: 129, hex: '#10B981', rgba: (a) => `rgba(16, 185, 129, ${a})` }, // Emerald
  { r: 245, g: 158, b: 11, hex: '#F59E0B', rgba: (a) => `rgba(245, 158, 11, ${a})` }, // Warm Amber
  { r: 6, g: 182, b: 212, hex: '#06B6D4', rgba: (a) => `rgba(6, 182, 212, ${a})` },   // Neon Cyan
];

export function getFallbackColor(seed: string = 'CyTune'): ColorRGB {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AESTHETIC_PALETTE.length;
  return AESTHETIC_PALETTE[index];
}

// Convert RGB to HSL
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;
  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0);
        break;
      case gNorm:
        h = (bNorm - rNorm) / d + 2;
        break;
      case bNorm:
        h = (rNorm - gNorm) / d + 4;
        break;
    }
    h /= 6;
  }

  return [h * 360, s, l];
}

// Sample and analyze pixels with smart vibrancy scoring
function analyzePixels(ctx: CanvasRenderingContext2D, width: number, height: number): ColorRGB | null {
  const imageData = ctx.getImageData(0, 0, width, height).data;

  // 12 Hue buckets (30 degrees each)
  const buckets: Array<{
    rTotal: number;
    gTotal: number;
    bTotal: number;
    count: number;
    saturationSum: number;
    score: number;
  }> = Array.from({ length: 12 }, () => ({
    rTotal: 0,
    gTotal: 0,
    bTotal: 0,
    count: 0,
    saturationSum: 0,
    score: 0,
  }));

  let generalRTotal = 0;
  let generalGTotal = 0;
  let generalBTotal = 0;
  let generalCount = 0;

  for (let i = 0; i < imageData.length; i += 4) {
    const r = imageData[i];
    const g = imageData[i + 1];
    const b = imageData[i + 2];
    const a = imageData[i + 3];

    if (a < 128) continue; // Skip transparent pixels

    const [h, s, l] = rgbToHsl(r, g, b);

    // Track general average
    generalRTotal += r;
    generalGTotal += g;
    generalBTotal += b;
    generalCount++;

    // Filter out extreme darks, extreme lights, and dead grays for vibrant detection
    if (l > 0.12 && l < 0.88 && s > 0.16) {
      const bucketIdx = Math.floor(h / 30) % 12;
      const bucket = buckets[bucketIdx];
      bucket.rTotal += r;
      bucket.gTotal += g;
      bucket.bTotal += b;
      bucket.count++;
      bucket.saturationSum += s;
      // Vibrancy score: prioritize high saturation and balanced luminance
      const lumFactor = 1 - Math.abs(l - 0.5) * 1.3;
      bucket.score += Math.pow(s, 1.4) * Math.max(0.2, lumFactor);
    }
  }

  // Find the highest scoring vibrant bucket
  let bestBucket: (typeof buckets)[0] | null = null;
  let maxScore = 0;

  for (const b of buckets) {
    if (b.score > maxScore && b.count >= 4) {
      maxScore = b.score;
      bestBucket = b;
    }
  }

  // If a vibrant bucket was found with enough presence, use it
  if (bestBucket && bestBucket.count > 0) {
    const r = Math.round(bestBucket.rTotal / bestBucket.count);
    const g = Math.round(bestBucket.gTotal / bestBucket.count);
    const b = Math.round(bestBucket.bTotal / bestBucket.count);
    const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    return {
      r,
      g,
      b,
      hex,
      rgba: (alpha: number) => `rgba(${r}, ${g}, ${b}, ${alpha})`,
    };
  }

  // Fallback to overall image average if not pitch black or pure white
  if (generalCount > 0) {
    const r = Math.round(generalRTotal / generalCount);
    const g = Math.round(generalGTotal / generalCount);
    const b = Math.round(generalBTotal / generalCount);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    if (brightness > 25 && brightness < 235) {
      const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      return {
        r,
        g,
        b,
        hex,
        rgba: (alpha: number) => `rgba(${r}, ${g}, ${b}, ${alpha})`,
      };
    }
  }

  return null;
}

// Load image into canvas and extract color with proxy fallback
function extractFromImgElement(src: string): Promise<ColorRGB | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) return resolve(null);

        ctx.drawImage(img, 0, 0, 32, 32);
        const result = analyzePixels(ctx, 32, 32);
        resolve(result);
      } catch {
        resolve(null);
      }
    };

    img.onerror = () => {
      resolve(null);
    };

    img.src = src;
  });
}

export async function extractDominantColor(imageUrl?: string, fallbackSeed?: string): Promise<ColorRGB> {
  if (!imageUrl || typeof window === 'undefined') {
    return getFallbackColor(fallbackSeed);
  }

  // Check cache first
  if (colorCache.has(imageUrl)) {
    return colorCache.get(imageUrl)!;
  }

  try {
    // 1. Attempt direct load first
    let extracted = await extractFromImgElement(imageUrl);

    // 2. If direct canvas failed (CORS or network error), try via image proxy
    if (!extracted && !imageUrl.startsWith('/api/image-proxy')) {
      const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(imageUrl)}`;
      extracted = await extractFromImgElement(proxyUrl);
    }

    if (extracted) {
      colorCache.set(imageUrl, extracted);
      return extracted;
    }
  } catch {
    // fallback below
  }

  const fallback = getFallbackColor(fallbackSeed);
  colorCache.set(imageUrl, fallback);
  return fallback;
}
