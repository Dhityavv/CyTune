'use client';

import { useState, useEffect } from 'react';
import AppLink from '@/components/AppLink';
import {
  User,
  Edit3,
  ShoppingBag,
  Share2,
  Crown,
  Headphones,
  Music,
  Heart,
  ListMusic,
  Trophy,
  Flame,
  Check,
  Play,
  Calendar,
  Gamepad2
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { db, LikedTrack, PlaylistRecord } from '@/lib/db';
import { getCosmeticById } from '@/lib/cosmetics';
import AvatarFrame from '@/components/cosmetics/AvatarFrame';
import ProfileBorder from '@/components/cosmetics/ProfileBorder';
import ProfileBackground from '@/components/cosmetics/ProfileBackground';
import TrackRow from '@/components/TrackRow';
import AuthModal from '@/components/AuthModal';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [likedTracks, setLikedTracks] = useState<LikedTrack[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistRecord[]>([]);
  const [guessBest, setGuessBest] = useState<number>(0);
  const [triviaBest, setTriviaBest] = useState<number>(0);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    // Load local db data
    async function loadData() {
      try {
        const activeUserId = user?.id || 'guest';
        const likes = await db.likedTracks.toArray();
        setLikedTracks(likes.filter((track) => (track.userId || 'guest') === activeUserId));
        const lists = await db.playlists.toArray();
        setPlaylists(lists.filter((playlist) => (playlist.userId || 'guest') === activeUserId));

        const savedGuess = localStorage.getItem('cytune-guess-song-best') || localStorage.getItem('orbittune-guess-song-best');
        if (savedGuess) setGuessBest(parseInt(savedGuess, 10));

        const savedTrivia = localStorage.getItem('cytune-trivia-best') || localStorage.getItem('orbittune-trivia-best');
        if (savedTrivia) setTriviaBest(parseInt(savedTrivia, 10));
      } catch {
        // ignore
      }
    }
    loadData();
  }, [user?.id]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/profile/${user?.username || 'listener'}`;
      navigator.clipboard?.writeText(shareUrl);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const equippedFrameObj = getCosmeticById(user?.equippedFrame);
  const equippedBorderObj = getCosmeticById(user?.equippedBorder);
  const equippedBgObj = getCosmeticById(user?.equippedBackground);

  if (!user) {
    return (
      <div className="py-20 max-w-md mx-auto text-center space-y-5 select-none">
        <div className="w-16 h-16 rounded-3xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mx-auto shadow-xl shadow-[#C9A94D]/20">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text-primary">Profil Pengguna</h1>
          <p className="text-xs text-text-secondary leading-relaxed">
            Masuk dengan akun Email atau Google untuk melihat profil, koin, riwayat, dan kosmetik yang kamu miliki.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsAuthOpen(true)}
          className="px-6 py-3 rounded-full bg-accent text-[#101114] hover:bg-accent-hover font-bold text-xs shadow-lg shadow-[#C9A94D]/25 transition-all active:scale-95 cursor-pointer"
        >
          Masuk / Daftar Akun
        </button>
        <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-28 max-w-5xl mx-auto select-none">
      {/* Hero Canvas Banner with Equipped Background */}
      <div className="relative rounded-3xl overflow-hidden border border-border-subtle shadow-2xl min-h-[380px] flex flex-col justify-end p-6 sm:p-10">
        <ProfileBackground backgroundId={user?.equippedBackground} overlayOpacity={0.78} />

        {/* Ambient Top Glow */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A94D 0%, transparent 70%)' }}
        />

        {/* Main Profile Card with Equipped Border */}
        <div className="relative z-10 w-full">
          <ProfileBorder borderId={user?.equippedBorder} className="w-full">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
              {/* Avatar + Frame + Info */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
                <AvatarFrame frameId={user?.equippedFrame} size={110}>
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-text-muted" />
                  )}
                </AvatarFrame>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
                      {user?.display_name || 'Orbit Listener'}
                    </h1>

                    {user?.isPremium ? (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent text-[#101114] flex items-center gap-1 shadow-sm font-mono">
                        <Crown className="w-3 h-3" />
                        Hi-Fi Premium
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface border border-border-subtle text-text-muted flex items-center gap-1 font-mono">
                        Free Listener
                      </span>
                    )}

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/30 flex items-center gap-1 font-mono">
                      <span>🪙</span>
                      <span>{(user.coins ?? 500).toLocaleString()} Coins</span>
                    </span>


                  </div>

                  <p className="text-xs text-text-muted font-mono">
                    @{user?.username || 'orbit_listener'}
                  </p>

                  <p className="text-xs sm:text-sm text-text-secondary max-w-lg leading-relaxed">
                    {user?.bio || 'Streaming high-resolution audio and curating atmospheric nocturnal playlists.'}
                  </p>

                  <div className="flex items-center justify-center sm:justify-start gap-4 text-[11px] text-text-muted pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-text-muted" />
                      {user?.joinedDate || 'Joined Nov 2026'}
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-accent" />
                      {likedTracks.length} Favorites
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <ListMusic className="w-3.5 h-3.5 text-[#BBF41D]" />
                      {playlists.length} Playlists
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center md:justify-end gap-2.5 shrink-0 pt-2 md:pt-0">
                <AppLink
                  href="/profile/edit"
                  className="px-4 py-2.5 rounded-2xl bg-accent hover:bg-accent-hover text-[#101114] font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#C9A94D]/25 transition-all active:scale-95"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </AppLink>

                <AppLink
                  href="/store"
                  className="px-4 py-2.5 rounded-2xl bg-surface hover:bg-surface-hover border border-border-subtle hover:border-accent/40 text-text-primary font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-accent" />
                  <span>Cosmetic Store</span>
                </AppLink>

                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2.5 rounded-2xl bg-surface hover:bg-surface-hover border border-border-subtle text-text-secondary hover:text-text-primary transition-all active:scale-95"
                  aria-label="Share Profile Link"
                >
                  {copiedShare ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Share2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </ProfileBorder>
        </div>
      </div>

      {/* Equipped Loadout Showcase */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-surface/70 border border-border-subtle flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono block">
              Equipped Frame
            </span>
            <span className="text-xs font-bold text-text-primary block">
              {equippedFrameObj ? equippedFrameObj.name : 'Default Ring'}
            </span>
          </div>
          <AppLink
            href="/store"
            className="text-[11px] font-semibold text-accent hover:underline"
          >
            Change
          </AppLink>
        </div>

        <div className="p-4 rounded-2xl bg-surface/70 border border-border-subtle flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono block">
              Equipped Border
            </span>
            <span className="text-xs font-bold text-text-primary block">
              {equippedBorderObj ? equippedBorderObj.name : 'Standard Border'}
            </span>
          </div>
          <AppLink
            href="/store"
            className="text-[11px] font-semibold text-accent hover:underline"
          >
            Change
          </AppLink>
        </div>

        <div className="p-4 rounded-2xl bg-surface/70 border border-border-subtle flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono block">
              Equipped Atmosphere
            </span>
            <span className="text-xs font-bold text-text-primary block">
              {equippedBgObj ? equippedBgObj.name : 'Nocturne Ambient'}
            </span>
          </div>
          <AppLink
            href="/store"
            className="text-[11px] font-semibold text-accent hover:underline"
          >
            Change
          </AppLink>
        </div>
      </div>

      {/* Listening Stats & Gaming Achievements */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface/70 border border-border-subtle space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono block">
            Minutes Streamed
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-accent font-mono block">
            2,840 m
          </span>
          <span className="text-[10px] text-text-secondary block">Top 5% Hi-Fi listener</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface/70 border border-border-subtle space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono block">
            Top Genre
          </span>
          <span className="text-base sm:text-lg font-bold text-text-primary block truncate">
            Synthwave & R&B
          </span>
          <span className="text-[10px] text-text-secondary block">52 tracks logged</span>
        </div>

        <div className="p-5 rounded-2xl bg-surface/70 border border-border-subtle space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono block flex items-center gap-1">
            <Headphones className="w-3 h-3 text-accent" />
            Guess Song Best
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-accent font-mono block">
            {guessBest > 0 ? `${guessBest} pts` : 'Play now'}
          </span>
          <AppLink href="/games/guess-the-song" className="text-[10px] text-accent hover:underline block">
            Challenge game →
          </AppLink>
        </div>

        <div className="p-5 rounded-2xl bg-surface/70 border border-border-subtle space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted font-mono block flex items-center gap-1">
            <Trophy className="w-3 h-3 text-[#BBF41D]" />
            Trivia Record
          </span>
          <span className="text-xl sm:text-2xl font-extrabold text-[#BBF41D] font-mono block">
            {triviaBest > 0 ? `${triviaBest} pts` : 'Play now'}
          </span>
          <AppLink href="/games/trivia" className="text-[10px] text-[#BBF41D] hover:underline block">
            Test knowledge →
          </AppLink>
        </div>
      </div>

      {/* Pinned Favorite Songs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-accent" />
            <h2 className="text-base sm:text-lg font-bold text-text-primary">Favorite Songs</h2>
          </div>
          <AppLink href="/library" className="text-xs text-accent hover:underline">
            View All in Library →
          </AppLink>
        </div>

        {likedTracks.length > 0 ? (
          <div className="space-y-1 rounded-2xl bg-surface/40 border border-border-subtle p-2">
            {likedTracks.slice(0, 5).map((track, idx) => (
              <TrackRow
                key={track.id}
                track={track}
                index={idx + 1}
                queueContext={likedTracks}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-surface/50 border border-border-subtle text-center space-y-3">
            <Music className="w-8 h-8 text-text-muted mx-auto" />
            <p className="text-xs text-text-secondary">
              No favorite songs pinned yet. Like songs while listening to showcase them here!
            </p>
            <AppLink
              href="/search"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface border border-border-subtle text-xs font-semibold hover:border-accent/40"
            >
              <span>Explore Songs</span>
            </AppLink>
          </div>
        )}
      </div>

      {/* Public Playlists */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListMusic className="w-4 h-4 text-[#BBF41D]" />
            <h2 className="text-base sm:text-lg font-bold text-text-primary">Playlists Created</h2>
          </div>
          <AppLink href="/library" className="text-xs text-accent hover:underline">
            Manage Playlists →
          </AppLink>
        </div>

        {playlists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {playlists.map((playlist) => (
              <AppLink
                key={playlist.id}
                href={`/playlist?id=${playlist.id}`}
                className="group p-4 rounded-2xl bg-surface/70 border border-border-subtle hover:border-accent/40 transition-all flex items-center gap-4"
              >
                <div className="w-14 h-14 rounded-xl bg-sidebar border border-border-subtle overflow-hidden flex items-center justify-center shrink-0">
                  {playlist.coverUrl ? (
                    <img
                      src={playlist.coverUrl}
                      alt={playlist.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <Music className="w-6 h-6 text-accent" />
                  )}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <h3 className="text-xs sm:text-sm font-bold text-text-primary truncate group-hover:text-accent transition-colors">
                    {playlist.name}
                  </h3>
                  <p className="text-[11px] text-text-muted font-mono">
                    {playlist.tracks?.length || 0} tracks
                  </p>
                </div>
              </AppLink>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-surface/50 border border-border-subtle text-center space-y-2">
            <ListMusic className="w-8 h-8 text-text-muted mx-auto" />
            <p className="text-xs text-text-secondary">
              No playlists created yet. Organize your favorite songs into custom collections.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
