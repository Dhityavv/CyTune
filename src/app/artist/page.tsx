'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Music, Disc3, Play } from 'lucide-react';
import CoverImage from '@/components/CoverImage';
import TrackCard from '@/components/TrackCard';
import { usePlayerStore } from '@/store/usePlayerStore';

interface ArtistHeader {
  title: string;
  description: string;
  thumbnail: string;
  subscribers: string;
}

interface SectionItem {
  id: string;
  title: string;
  subtitle?: string;
  thumbnail: string;
  kind?: string;
  browseId?: string;
}

interface Section {
  title: string;
  type: string;
  items: any[];
}

function sectionLabel(section: Section): string {
  if (section.title && section.title.trim()) return section.title;
  const items = section.items || [];
  const kinds = new Set(items.map((i: any) => i.kind));
  if (kinds.has('artist')) return 'Fans also like';
  if (kinds.has('playlist')) return 'Playlists';
  if (kinds.has('album')) {
    const hasSingle = items.some((i: any) => /single/i.test(i.subtitle || ''));
    return hasSingle ? 'Singles & EPs' : 'Albums';
  }
  return 'Popular videos';
}
export default function ArtistPage() {
  return (
    <Suspense fallback={<div className="p-8 text-text-secondary">Loading…</div>}>
      <ArtistContent />
    </Suspense>
  );
}

function ArtistContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = searchParams.get('id') || '';
  const playTrack = usePlayerStore((s) => s.playTrack);

  const [header, setHeader] = useState<ArtistHeader | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setError('Artist id is required');
      setLoading(false);
      return;
    }
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/artist?id=${encodeURIComponent(id)}`);
        if (!res.ok) throw new Error('Failed to load artist');
        const data = await res.json();
        if (cancelled) return;
        setHeader(data.header);
        setSections(data.sections || []);
      } catch (e: any) {
        if (!cancelled) setError(e?.message || 'Failed to load artist');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id]);

  return (
    <div className="space-y-8 pb-24 max-w-7xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {loading && (
        <div className="space-y-6">
          <div className="h-40 bg-surface rounded-2xl animate-pulse" />
          <div className="h-6 w-48 bg-surface rounded animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[1,2,3,4,5].map((i) => (
              <div key={i} className="aspect-square bg-surface rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="text-red-400 text-sm">{error}</div>
      )}

      {!loading && header && (
        <>
          {/* Header */}
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative rounded-2xl overflow-hidden bg-surface/70 border border-border-subtle p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6 shadow-2xl backdrop-blur-sm"
          >
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden bg-sidebar border-2 border-border-subtle shadow-xl flex-shrink-0">
              <CoverImage src={header.thumbnail} alt={header.title} size="lg" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
              <span className="text-[11px] font-bold text-accent uppercase tracking-wider">Artist</span>
              <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                {header.title}
              </h1>
              {header.subscribers && (
                <p className="text-sm text-text-secondary flex items-center gap-1.5 justify-center sm:justify-start">
                  <Users className="w-4 h-4" />
                  {header.subscribers}
                </p>
              )}
              {header.description && (
                <p className="text-[13px] text-text-secondary line-clamp-4 max-w-2xl">
                  {header.description}
                </p>
              )}
            </div>
          </motion.section>

          {/* Sections */}
          {sections.map((section, sIdx) => {
            if (section.type === 'songs') {
              return (
                <motion.section
                  key={sIdx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  className="space-y-3.5"
                >
                  <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight flex items-center gap-2">
                    <Music className="w-5 h-5 text-accent" />
                    {section.title || 'Top songs'}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                    {section.items.map((track: any) => (
                      <TrackCard key={track.id} track={track} />
                    ))}
                  </div>
                </motion.section>
              );
            }

            // albums / playlists / related / generic carousel
            const isArtist = section.type === 'related' || section.items?.[0]?.kind === 'artist';
            return (
              <motion.section
                key={sIdx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                className="space-y-3.5"
              >
                <h3 className="text-base sm:text-lg font-bold text-text-primary tracking-tight flex items-center gap-2">
                  {isArtist ? <Users className="w-5 h-5 text-accent" /> : <Disc3 className="w-5 h-5 text-accent" />}
                  {sectionLabel(section)}
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
                  {section.items.map((item: SectionItem) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (item.kind === 'artist') {
                          router.push(`/artist?id=${encodeURIComponent(item.id)}`);
                        } else if (item.kind === 'album' || item.kind === 'playlist') {
                          router.push(`/search?q=${encodeURIComponent(item.title)}`);
                        } else {
                          // try play: search
                          router.push(`/search?q=${encodeURIComponent(item.title)}`);
                        }
                      }}
                      className="w-[150px] sm:w-[170px] shrink-0 snap-start text-left group"
                    >
                      <div className="relative aspect-square rounded-2xl overflow-hidden bg-sidebar border border-border-subtle shadow-md group-hover:shadow-xl transition-all">
                        <CoverImage src={item.thumbnail} alt={item.title} size="md" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        {item.kind === 'artist' && (
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                            <Play className="w-8 h-8 text-white fill-white" />
                          </div>
                        )}
                      </div>
                      <p className="mt-2 text-[13px] font-semibold text-text-primary truncate group-hover:text-accent transition-colors">
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="text-[11px] text-text-secondary truncate">{item.subtitle}</p>
                      )}
                    </button>
                  ))}
                </div>
              </motion.section>
            );
          })}
        </>
      )}
    </div>
  );
}
