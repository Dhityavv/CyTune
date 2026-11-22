'use client';

import { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Radio, Users, Play, Pause, Plus, Copy, Check, LogOut, Loader2, Sparkles, Volume2 } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useAuthStore } from '@/store/useAuthStore';
import CoverImage from '@/components/CoverImage';
import AuthModal from '@/components/AuthModal';
import { Track } from '@/types/music';

interface RoomMember {
  id: string;
  name: string;
  username?: string;
  avatar_url?: string;
  isHost?: boolean;
}

interface RoomData {
  id: string;
  name: string;
  hostName: string;
  hostId: string;
  hostAvatar?: string;
  members: RoomMember[];
  currentTrack: Track | null;
  isPlaying: boolean;
  seekTime: number;
}

function ListeningRoomContent() {
  const searchParams = useSearchParams();
  const initialCode = searchParams.get('code') || '';

  const [activeRoom, setActiveRoom] = useState<RoomData | null>(null);
  const [roomNameInput, setRoomNameInput] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState(initialCode);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roomError, setRoomError] = useState('');

  const { user } = useAuthStore();
  const currentTrack = usePlayerStore((s) => s.currentTrack);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const currentTime = usePlayerStore((s) => s.currentTime);
  const playTrack = usePlayerStore((s) => s.playTrack);
  const togglePlay = usePlayerStore((s) => s.togglePlay);

  const isHost = activeRoom ? activeRoom.hostId === (user?.id || 'host') : false;
  const activeRoomId = activeRoom?.id;
  const lastSyncedTrackId = useRef<string | null>(null);

  const handleJoin = useCallback(async (codeToJoin?: string) => {
    const targetCode = (codeToJoin || joinCodeInput).trim().replace(/^room=/, '').replace(/^.*code=/, '');
    if (!targetCode) return;

    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    setLoading(true);
    setRoomError('');
    try {
      const res = await fetch('/api/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join',
          code: targetCode,
          user: {
            id: user.id,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
          },
          track: currentTrack,
        }),
      });

      if (!res.ok) throw new Error(`Unable to join room (${res.status})`);

      const room: RoomData = await res.json();
      setActiveRoom(room);
      setJoinCodeInput('');

      // Immediately sync track if host already has one playing!
      if (room.currentTrack) {
        lastSyncedTrackId.current = room.currentTrack.id;
        playTrack(room.currentTrack);
      }
    } catch (error) {
      console.error('Unable to join room:', error);
      setRoomError('Room tidak dapat dibuka. Periksa kode atau koneksi lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [currentTrack, joinCodeInput, playTrack, user]);

  // Auto-join if code is in URL
  useEffect(() => {
    if (initialCode && !activeRoomId) {
      handleJoin(initialCode);
    }
  }, [activeRoomId, handleJoin, initialCode]);

  // Host: Send live playback sync updates to server
  useEffect(() => {
    if (!activeRoomId || !isHost) return;

    const syncPlayback = async () => {
      try {
        await fetch('/api/room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'sync',
            code: activeRoomId,
            track: currentTrack,
            isPlaying,
            seekTime: Math.floor(currentTime),
          }),
        });
      } catch {
        // ignore
      }
    };

    const handler = setTimeout(syncPlayback, 400);
    return () => clearTimeout(handler);
  }, [activeRoomId, isHost, currentTrack, isPlaying, currentTime]);

  // Listener: Poll room state to sync track from Host in real time
  useEffect(() => {
    if (!activeRoomId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/room?code=${encodeURIComponent(activeRoomId)}`);
        if (res.ok) {
          const remoteRoom: RoomData = await res.json();
          setActiveRoom((prev) => (prev ? { ...prev, ...remoteRoom } : remoteRoom));

          // If listener is following host: automatically sync the track!
          if (!isHost && remoteRoom.currentTrack) {
            if (remoteRoom.currentTrack.id !== lastSyncedTrackId.current) {
              lastSyncedTrackId.current = remoteRoom.currentTrack.id;
              playTrack(remoteRoom.currentTrack);
            }
          }
        }
      } catch {
        // ignore
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [activeRoomId, isHost, playTrack]);

  const handleCreate = async () => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }

    setLoading(true);
    setRoomError('');
    try {
      const res = await fetch('/api/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          roomName: roomNameInput.trim(),
          user: {
            id: user.id,
            username: user.username,
            display_name: user.display_name,
            avatar_url: user.avatar_url,
          },
          track: currentTrack,
          isPlaying,
        }),
      });

      if (!res.ok) throw new Error(`Unable to create room (${res.status})`);

      const room = await res.json();
      setActiveRoom(room);
      setRoomNameInput('');
    } catch (error) {
      console.error('Unable to create room:', error);
      setRoomError('Room tidak dapat dibuat. Periksa koneksi lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const copyRoomLink = () => {
    if (!activeRoom) return;
    const url = `${window.location.origin}/room?code=${activeRoom.id}`;
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-8 pb-24 max-w-5xl mx-auto select-none">
      {/* Header */}
      <div className="relative rounded-3xl overflow-hidden bg-surface/70 border border-border-subtle p-6 sm:p-8 shadow-2xl backdrop-blur-md">
        <div
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
        />

        <div className="space-y-2 z-10 relative">
          <span className="text-[10px] font-bold text-accent uppercase tracking-[0.16em] flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            Social Experience • Live Sync
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
            Listening Room
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary max-w-xl leading-relaxed">
            Dengarkan musik bersama teman secara *real-time*. Host mengontrol pemutaran lagu, dan semua member di dalam room otomatis tersinkronisasi.
          </p>
        </div>
      </div>

      {!user && !activeRoom && (
        <div className="p-4 rounded-2xl bg-accent/10 border border-accent/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-accent shrink-0" />
            <p className="text-xs text-text-primary">
              Masuk dengan akunmu agar avatar dan nama profil aslimu muncul saat mendengarkan musik bersama teman.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsAuthOpen(true)}
            className="px-4 py-1.5 rounded-xl bg-accent text-[#101114] font-bold text-xs hover:bg-accent-hover shrink-0 transition-all shadow-sm cursor-pointer"
          >
            Masuk Akun
          </button>
        </div>
      )}

      {roomError && !activeRoom && (
        <div role="alert" className="rounded-2xl border border-red-500/30 bg-red-950/40 px-4 py-3 text-xs text-red-300">
          {roomError}
        </div>
      )}

      {!activeRoom ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Room Card */}
          <div className="p-6 rounded-3xl bg-surface/60 border border-border-subtle shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-accent/15 text-accent flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Buat Listening Room Baru</h2>
              <p className="text-xs text-text-secondary mt-1">
                Jadilah Host. Kontrol lagu yang diputar dan bagikan link room ke teman-temanmu.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <input
                type="text"
                value={roomNameInput}
                onChange={(e) => {
                  setRoomNameInput(e.target.value);
                  setRoomError('');
                }}
                placeholder="Nama Room (misal: Chill Malam, Lofi Focus)..."
                className="w-full px-4 py-3 rounded-xl bg-sidebar border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent"
              />
              <button
                type="button"
                onClick={handleCreate}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-accent text-[#101114] hover:bg-accent-hover font-bold text-xs shadow-md shadow-[#C9A94D]/25 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
                <span>Buat Room Sekarang</span>
              </button>
            </div>
          </div>

          {/* Join Room Card */}
          <div className="p-6 rounded-3xl bg-surface/60 border border-border-subtle shadow-xl space-y-4">
            <div className="w-10 h-10 rounded-2xl bg-surface text-text-muted flex items-center justify-center border border-border-subtle">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-text-primary">Gabung ke Room Teman</h2>
              <p className="text-xs text-text-secondary mt-1">
                Masukkan kode room atau tempel link undangan untuk mendengarkan lagu bersama host.
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <input
                type="text"
                value={joinCodeInput}
                onChange={(e) => {
                  setJoinCodeInput(e.target.value);
                  setRoomError('');
                }}
                placeholder="Tempel kode room atau link undangan..."
                className="w-full px-4 py-3 rounded-xl bg-sidebar border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent font-mono"
              />
              <button
                type="button"
                onClick={() => handleJoin()}
                disabled={loading || !joinCodeInput.trim()}
                className="w-full py-3 rounded-xl bg-surface hover:bg-surface-hover text-text-primary border border-border-subtle font-bold text-xs disabled:opacity-40 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-accent" /> : <Users className="w-4 h-4 text-accent" />}
                <span>Gabung ke Sesi</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Active Room View */
        <div className="space-y-6">
          {/* Room Banner */}
          <div className="p-6 rounded-3xl bg-surface/80 border border-border-subtle shadow-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-accent">Live Sync Room</span>
              </div>
              <h2 className="text-xl font-bold text-text-primary mt-1">{activeRoom.name}</h2>
              <p className="text-xs text-text-secondary mt-0.5">
                Host: <span className="text-text-primary font-semibold">{activeRoom.hostName}</span> · Kode:{' '}
                <code className="font-mono text-accent font-bold px-1.5 py-0.5 rounded bg-accent/10">{activeRoom.id}</code>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyRoomLink}
                className="px-4 py-2.5 rounded-xl bg-accent hover:bg-accent-hover text-[#101114] font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Tersalin!' : 'Undang Teman (Salin Link)'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveRoom(null)}
                className="px-4 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Playback Card */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-surface/50 border border-border-subtle shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider block">
                  Synchronized Track (Tersinkronisasi Otomatis)
                </span>
                <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5" />
                  Live Stream
                </span>
              </div>

              {activeRoom.currentTrack || currentTrack ? (
                <div className="flex items-center gap-5">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-sidebar border border-border-subtle shadow-md">
                    <CoverImage
                      src={(activeRoom.currentTrack || currentTrack)?.thumbnail}
                      alt={(activeRoom.currentTrack || currentTrack)?.title || 'Track'}
                      size="md"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <h3 className="text-lg font-bold text-text-primary truncate">
                      {(activeRoom.currentTrack || currentTrack)?.title}
                    </h3>
                    <p className="text-xs text-text-secondary truncate">
                      {(activeRoom.currentTrack || currentTrack)?.artist}
                    </p>
                    <div className="pt-2 flex items-center gap-3">
                      {isHost ? (
                        <button
                          type="button"
                          onClick={togglePlay}
                          className="px-4 py-1.5 rounded-full bg-accent text-[#101114] font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                        >
                          {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />}
                          <span>{isPlaying ? 'Pause' : 'Resume'}</span>
                        </button>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-accent/15 text-accent font-bold text-[11px]">
                          Tersinkron dengan Host
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-text-muted">
                        Semua anggota mendengar lagu yang sama secara real-time.
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-text-secondary py-6">
                  Belum ada lagu yang diputar di room ini. Putar lagu apa saja untuk memulai siaran bersama!
                </p>
              )}
            </div>

            {/* Room Members */}
            <div className="p-6 rounded-3xl bg-surface/50 border border-border-subtle shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
                <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-accent" />
                  <span>Members ({activeRoom.members?.length || 2})</span>
                </span>
                <span className="text-[10px] text-accent font-semibold uppercase">Online</span>
              </div>

              <div className="space-y-2">
                {(activeRoom.members || []).map((member, idx) => {
                  const isMemberHost = member.id === activeRoom.hostId || member.isHost || idx === 0;
                  return (
                    <div
                      key={member.id || idx}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-surface border border-border-subtle/50 text-xs font-semibold text-text-primary"
                    >
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-accent/20 text-accent flex items-center justify-center font-bold text-[10px] shrink-0 border border-accent/20">
                        {member.avatar_url ? (
                          <img
                            src={member.avatar_url}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          member.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-bold leading-tight">
                          {member.name}
                        </span>
                        {member.username && (
                          <span className="block text-[10px] text-text-muted font-mono leading-tight">
                            @{member.username}
                          </span>
                        )}
                      </div>
                      {isMemberHost && (
                        <span className="shrink-0 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/25">
                          Host
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} defaultMode="login" />
    </div>
  );
}

export default function ListeningRoomPage() {
  return (
    <Suspense fallback={<div className="p-8 text-text-secondary text-xs">Loading Room...</div>}>
      <ListeningRoomContent />
    </Suspense>
  );
}
