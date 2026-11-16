'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  User,
  ShoppingBag,
  Share2,
  Crown,
  Sparkles,
  Music,
  Heart,
  Check,
  Calendar,
  ChevronLeft
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { db, LikedTrack, PlaylistRecord } from '@/lib/db';
import { getCosmeticById } from '@/lib/cosmetics';
import AvatarFrame from '@/components/cosmetics/AvatarFrame';
import ProfileBorder from '@/components/cosmetics/ProfileBorder';
import ProfileBackground from '@/components/cosmetics/ProfileBackground';
import TrackRow from '@/components/TrackRow';

function PublicProfileContent() {
  const params = useParams();
  const rawUsername = params?.username;
  const username = typeof rawUsername === 'string' ? decodeURIComponent(rawUsername) : 'listener';
  const { user } = useAuthStore();

  const isSelf = user?.username?.toLowerCase() === username.toLowerCase();

  const displayName = isSelf
    ? user?.display_name || 'Orbit Listener'
    : username.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const [likedTracks, setLikedTracks] = useState<LikedTrack[]>([]);
  const [playlists, setPlaylists] = useState<PlaylistRecord[]>([]);
  const [copiedShare, setCopiedShare] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const likes = await db.likedTracks.toArray();
        setLikedTracks(likes);
        const lists = await db.playlists.toArray();
        setPlaylists(lists);
      } catch {
        // ignore
      }
    }
    loadData();
  }, []);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    }
  };

  const equippedFrameId = isSelf ? user?.equippedFrame : 'frame-solar-halo';
  const equippedBorderId = isSelf ? user?.equippedBorder : 'border-animated-gold';
  const equippedBgId = isSelf ? user?.equippedBackground : 'bg-space-nebula';

  const equippedFrameObj = getCosmeticById(equippedFrameId);
  const equippedBorderObj = getCosmeticById(equippedBorderId);
  const equippedBgObj = getCosmeticById(equippedBgId);

  return (
    <div className="space-y-10 pb-28 max-w-5xl mx-auto select-none">
      <div className="flex items-center justify-between">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors py-1 px-2.5 rounded-lg hover:bg-surface/60"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>My Profile</span>
        </Link>
      </div>

      {/* Hero Canvas Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-border-subtle shadow-2xl min-h-[380px] flex flex-col justify-end p-6 sm:p-10">
        <ProfileBackground backgroundId={equippedBgId} overlayOpacity={0.78} />

        <div className="relative z-10 w-full">
          <ProfileBorder borderId={equippedBorderId} className="w-full">
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5">
                <AvatarFrame frameId={equippedFrameId} size={110}>
                  {isSelf && user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-text-muted" />
                  )}
                </AvatarFrame>

                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
                      {displayName}
                    </h1>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent text-[#101114] flex items-center gap-1 shadow-sm font-mono">
                      <Crown className="w-3 h-3" />
                      Hi-Fi Member
                    </span>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#BBF41D]/15 text-[#BBF41D] border border-[#BBF41D]/30 flex items-center gap-1 font-mono">
                      <Sparkles className="w-2.5 h-2.5" />
                      Verified
                    </span>
                  </div>

                  <p className="text-xs text-text-muted font-mono">@{username}</p>

                  <p className="text-xs sm:text-sm text-text-secondary max-w-lg leading-relaxed">
                    {isSelf && user?.bio
                      ? user.bio
                      : 'Hi-Fi music audiophile and playlist curator on OrbitTune.'}
                  </p>

                  <div className="flex items-center justify-center sm:justify-start gap-4 text-[11px] text-text-muted pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-text-muted" />
                      Joined 2026
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-accent" />
                      Public Profile
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 shrink-0 pt-2 md:pt-0">
                {isSelf ? (
                  <Link
                    href="/profile/edit"
                    className="px-4 py-2.5 rounded-2xl bg-accent hover:bg-accent-hover text-[#101114] font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#C9A94D]/25 transition-all active:scale-95"
                  >
                    <span>Edit Profile</span>
                  </Link>
                ) : (
                  <Link
                    href="/store"
                    className="px-4 py-2.5 rounded-2xl bg-surface hover:bg-surface-hover border border-border-subtle hover:border-accent/40 text-text-primary font-bold text-xs flex items-center gap-2 transition-all active:scale-95"
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-accent" />
                    <span>Get Cosmetics</span>
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleShare}
                  className="p-2.5 rounded-2xl bg-surface hover:bg-surface-hover border border-border-subtle text-text-secondary hover:text-text-primary transition-all active:scale-95"
                  title="Share Profile Link"
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

      {/* Public Favorite Songs */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-accent" />
          <h2 className="text-base sm:text-lg font-bold text-text-primary">Featured Tracks</h2>
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
          <div className="p-8 rounded-2xl bg-surface/50 border border-border-subtle text-center space-y-2">
            <Music className="w-8 h-8 text-text-muted mx-auto" />
            <p className="text-xs text-text-secondary">No public tracks to display.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PublicProfilePage() {
  return (
    <Suspense fallback={<p className="p-8 text-text-secondary text-xs">Loading profile...</p>}>
      <PublicProfileContent />
    </Suspense>
  );
}
