'use client';

import { useState, useRef } from 'react';
import AppLink from '@/components/AppLink';
import { useRouter } from 'next/navigation';
import {
  User,
  Save,
  ChevronLeft,
  Crown,
  Sparkles,
  Camera,
  Check,
  AlertCircle,
  Eye,
  ShoppingBag,
  Layers,
  FolderOpen,
  Crop,
} from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import {
  AVATAR_FRAMES,
  PROFILE_BORDERS,
  PROFILE_BACKGROUNDS,
  CosmeticItem,
} from '@/lib/cosmetics';
import AvatarFrame from '@/components/cosmetics/AvatarFrame';
import ProfileBorder from '@/components/cosmetics/ProfileBorder';
import ProfileBackground from '@/components/cosmetics/ProfileBackground';
import AvatarCropModal from '@/components/AvatarCropModal';
import AuthModal from '@/components/AuthModal';

const DEFAULT_AVATAR =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, updateProfile } = useAuthStore();

  const [displayName, setDisplayName] = useState(user?.display_name || 'Orbit Listener');
  const [username, setUsername] = useState(user?.username || 'orbit_listener');
  const [bio, setBio] = useState(
    user?.bio || 'Exploring synthwave horizons, nocturnal beats, and hi-res acoustic frequencies.'
  );
  const [avatarUrl, setAvatarUrl] = useState(
    user?.avatar_url || DEFAULT_AVATAR
  );
  const [selectedFrame, setSelectedFrame] = useState<string | null>(
    user?.equippedFrame || 'frame-solar-halo'
  );
  const [selectedBorder, setSelectedBorder] = useState<string | null>(
    user?.equippedBorder || 'border-animated-gold'
  );
  const [selectedBackground, setSelectedBackground] = useState<string | null>(
    user?.equippedBackground || null
  );

  const [cosmeticTab, setCosmeticTab] = useState<'frame' | 'border' | 'background'>('frame');
  const [toastMessage, setToastMessage] = useState<{ title: string; type: 'success' | 'error' } | null>(null);

  // Avatar Device Selection & Cropper State
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (title: string, type: 'success' | 'error') => {
    setToastMessage({ title, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleProcessFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WEBP)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImageToCrop(reader.result);
        setCropperOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
    e.target.value = '';
  };

  const handleOpenExistingCrop = () => {
    if (!avatarUrl) return;
    setImageToCrop(avatarUrl);
    setCropperOpen(true);
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    setAvatarUrl(croppedDataUrl);
    showToast('Avatar cropped & updated! Click Save Profile Changes to apply.', 'success');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    // Clean username slug
    const cleanUsername = username
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .slice(0, 30);

    updateProfile({
      display_name: displayName.trim() || 'Orbit Listener',
      username: cleanUsername || 'orbit_listener',
      bio: bio.trim().slice(0, 200),
      avatar_url: avatarUrl,
      equippedFrame: selectedFrame,
      equippedBorder: selectedBorder,
      equippedBackground: selectedBackground,
    });

    showToast('Profile and cosmetic appearance saved!', 'success');
    setTimeout(() => {
      router.push('/profile');
    }, 1200);
  };

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  if (!user) {
    return (
      <div className="py-20 max-w-md mx-auto text-center space-y-5 select-none">
        <div className="w-16 h-16 rounded-3xl bg-accent/15 border border-accent/30 text-accent flex items-center justify-center mx-auto shadow-xl shadow-[#C9A94D]/20">
          <User className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-text-primary">Edit Profil</h1>
          <p className="text-xs text-text-secondary leading-relaxed">
            Masuk dengan akun Email atau Google untuk mengubah nama, avatar, bio, dan kustomisasi kosmetik profil.
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
    <div className="space-y-8 pb-28 max-w-5xl mx-auto select-none">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed bottom-24 right-6 z-[9999] px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200 ${
            toastMessage.type === 'success'
              ? 'bg-[#101114]/90 border-accent/60 text-accent'
              : 'bg-red-950/90 border-red-500/60 text-red-300'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <Check className="w-4 h-4 text-accent shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span className="text-xs font-semibold">{toastMessage.title}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex items-center justify-between">
        <AppLink
          href="/profile"
          className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors py-1 px-2.5 rounded-lg hover:bg-surface/60"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Profile</span>
        </AppLink>

        <AppLink
          href="/store"
          className="inline-flex items-center gap-1.5 text-xs text-accent hover:underline font-semibold"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Browse Cosmetic Store</span>
        </AppLink>
      </div>

      <div className="relative rounded-3xl overflow-hidden bg-surface/70 border border-border-subtle p-6 sm:p-8 shadow-xl backdrop-blur-md">
        <div className="space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-accent font-mono">
            Profile Customization
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary">
            Edit Profile & Visual Identity
          </h1>
          <p className="text-xs text-text-secondary">
            Tune your public bio and customize equipped frames, borders, and atmospheric backgrounds in real time.
          </p>
        </div>
      </div>

      {/* 2-Column Studio Grid: Live Preview & Form Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Live Interactive Preview Stage (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-text-primary flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-accent" />
              Live Profile Preview
            </span>
            <span className="text-[10px] font-mono text-accent">Real-time sync</span>
          </div>

          <div className="relative rounded-3xl overflow-hidden border border-border-subtle shadow-2xl p-6 min-h-[300px] flex items-center justify-center bg-[#0C0D10]">
            <ProfileBackground backgroundId={selectedBackground} overlayOpacity={0.7} />

            <div className="relative z-10 w-full">
              <ProfileBorder borderId={selectedBorder} className="p-4 sm:p-5">
                <div className="flex items-center gap-4">
                  <AvatarFrame frameId={selectedFrame} size={74}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-text-muted" />
                    )}
                  </AvatarFrame>

                  <div className="space-y-1 overflow-hidden">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-text-primary truncate">
                        {displayName || 'Orbit Listener'}
                      </span>
                      {user?.isPremium && <Crown className="w-3.5 h-3.5 text-accent shrink-0" />}
                    </div>
                    <span className="text-[11px] text-text-muted font-mono block">
                      @{username || 'orbit_listener'}
                    </span>
                    <p className="text-[11px] text-text-secondary line-clamp-2 leading-tight">
                      {bio || 'Curating audio frequencies.'}
                    </p>
                  </div>
                </div>
              </ProfileBorder>
            </div>
          </div>
        </div>

        {/* Right Column: Edit Controls & Cosmetic Studio (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Profile Information Inputs */}
            <div className="p-6 rounded-3xl bg-surface/70 border border-border-subtle shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-text-primary">Personal Details</h2>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    maxLength={40}
                    className="w-full px-4 py-2.5 rounded-xl bg-sidebar border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent transition-all"
                    placeholder="Enter display name"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider block mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted text-xs font-mono">
                      @
                    </span>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                      maxLength={30}
                      className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-sidebar border border-border-subtle text-text-primary text-xs font-mono focus:outline-none focus:border-accent transition-all"
                      placeholder="username"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-text-muted uppercase tracking-wider">
                      Bio
                    </label>
                    <span className="text-[10px] text-text-muted font-mono">{bio.length}/200</span>
                  </div>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    maxLength={200}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl bg-sidebar border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent transition-all resize-none leading-relaxed"
                    placeholder="Tell listeners about your music tastes..."
                  />
                </div>
              </div>
            </div>

            {/* Avatar Photo Selection & Cropper */}
            <div className="p-6 rounded-3xl bg-surface/70 border border-border-subtle shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-text-primary">Avatar Photo</h2>
                  <p className="text-[11px] text-text-secondary">
                    Choose a photo from your device. You can zoom and crop non-square images to 1:1.
                  </p>
                </div>
                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-accent/10 border border-accent/25 text-accent font-semibold">
                  1:1 Square & Circle
                </span>
              </div>

              {/* Upload & Dropzone Area */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={() => setIsDraggingFile(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingFile(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleProcessFile(file);
                }}
                className={`relative rounded-2xl border-2 border-dashed p-5 transition-all flex flex-col sm:flex-row items-center gap-5 ${
                  isDraggingFile
                    ? 'border-accent bg-accent/10'
                    : 'border-border-subtle hover:border-text-secondary/40 bg-sidebar/50'
                }`}
              >
                {/* Current Avatar Circle */}
                <div className="relative group shrink-0">
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-accent/60 shadow-lg bg-surface flex items-center justify-center">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Current Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-text-muted" />
                    )}
                  </div>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleOpenExistingCrop}
                      className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] font-bold transition-opacity cursor-pointer"
                      aria-label="Adjust crop"
                    >
                      <Crop className="w-4 h-4 text-accent mb-0.5" />
                      <span>Crop</span>
                    </button>
                  )}
                </div>

                {/* Info & Action Buttons */}
                <div className="flex-1 space-y-2.5 text-center sm:text-left">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-text-primary">
                      Select photo from your device
                    </p>
                    <p className="text-[11px] text-text-muted leading-relaxed">
                      Upload any portrait or landscape image (JPG, PNG, WEBP). An interactive cropper will open immediately so you can reposition and zoom to 1:1.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-0.5">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent text-[#101114] hover:bg-accent-hover font-bold text-xs shadow-md shadow-[#C9A94D]/20 transition-all active:scale-95 cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Choose from Device</span>
                    </button>

                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={handleOpenExistingCrop}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface hover:bg-surface-hover border border-border-subtle text-xs font-semibold text-text-secondary hover:text-text-primary transition-all active:scale-95 cursor-pointer"
                      >
                        <Crop className="w-3.5 h-3.5 text-accent" />
                        <span>Adjust Crop</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Cosmetic Customizer Tabs */}
            <div className="p-6 rounded-3xl bg-surface/70 border border-border-subtle shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-text-primary">Cosmetics Loadout</h2>
                <div className="flex items-center gap-1 bg-sidebar p-1 rounded-xl border border-border-subtle text-xs">
                  <button
                    type="button"
                    onClick={() => setCosmeticTab('frame')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      cosmeticTab === 'frame'
                        ? 'bg-accent text-[#101114]'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    Frames
                  </button>
                  <button
                    type="button"
                    onClick={() => setCosmeticTab('border')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      cosmeticTab === 'border'
                        ? 'bg-accent text-[#101114]'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    Borders
                  </button>
                  <button
                    type="button"
                    onClick={() => setCosmeticTab('background')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      cosmeticTab === 'background'
                        ? 'bg-accent text-[#101114]'
                        : 'text-text-muted hover:text-text-primary'
                    }`}
                  >
                    Atmospheres
                  </button>
                </div>
              </div>

              {/* Frames Tab */}
              {cosmeticTab === 'frame' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedFrame(null)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      selectedFrame === null
                        ? 'bg-accent/15 border-accent text-accent font-bold'
                        : 'bg-sidebar border-border-subtle text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <span className="text-xs block">Default Ring</span>
                    <span className="text-[10px] text-text-muted font-mono">None</span>
                  </button>
                  {AVATAR_FRAMES.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setSelectedFrame(f.id)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        selectedFrame === f.id
                          ? 'bg-accent/15 border-accent text-accent font-bold'
                          : 'bg-sidebar border-border-subtle text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <span className="text-xs block truncate">{f.name}</span>
                      <span className="text-[10px] text-accent font-mono">{f.rarity}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Borders Tab */}
              {cosmeticTab === 'border' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedBorder(null)}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      selectedBorder === null
                        ? 'bg-accent/15 border-accent text-accent font-bold'
                        : 'bg-sidebar border-border-subtle text-text-muted hover:text-text-primary'
                    }`}
                  >
                    <span className="text-xs block">Standard Card</span>
                    <span className="text-[10px] text-text-muted font-mono">None</span>
                  </button>
                  {PROFILE_BORDERS.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setSelectedBorder(b.id)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        selectedBorder === b.id
                          ? 'bg-accent/15 border-accent text-accent font-bold'
                          : 'bg-sidebar border-border-subtle text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <span className="text-xs block truncate">{b.name}</span>
                      <span className="text-[10px] text-accent font-mono">{b.rarity}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Backgrounds Tab */}
              {cosmeticTab === 'background' && (
                <div className="space-y-3">
                  {!user?.isPremium && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs text-amber-300">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Crown className="w-3.5 h-3.5 shrink-0" />
                        Atmospheres require Hi-Fi Premium.
                      </span>
                      <AppLink href="/store" className="font-bold underline">
                        Store
                      </AppLink>
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setSelectedBackground(null)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        selectedBackground === null
                          ? 'bg-accent/15 border-accent text-accent font-bold'
                          : 'bg-sidebar border-border-subtle text-text-muted hover:text-text-primary'
                      }`}
                    >
                      <span className="text-xs block">Nocturne Classic</span>
                      <span className="text-[10px] text-text-muted font-mono">Default</span>
                    </button>
                    {PROFILE_BACKGROUNDS.map((bg) => (
                      <button
                        key={bg.id}
                        type="button"
                        disabled={!user?.isPremium}
                        onClick={() => setSelectedBackground(bg.id)}
                        className={`p-3 rounded-2xl border text-center transition-all ${
                          selectedBackground === bg.id
                            ? 'bg-accent/15 border-accent text-accent font-bold'
                            : !user?.isPremium
                            ? 'bg-sidebar/40 border-border-subtle text-text-muted opacity-50 cursor-not-allowed'
                            : 'bg-sidebar border-border-subtle text-text-secondary hover:text-text-primary'
                        }`}
                      >
                        <span className="text-xs block truncate">{bg.name}</span>
                        <span className="text-[10px] text-accent font-mono">{bg.rarity}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <AppLink
                href="/profile"
                className="px-6 py-3 rounded-2xl bg-surface hover:bg-surface-hover border border-border-subtle text-text-secondary hover:text-text-primary text-xs font-semibold transition-all"
              >
                Cancel
              </AppLink>

              <button
                type="submit"
                className="px-8 py-3 rounded-2xl bg-accent text-[#101114] hover:bg-accent-hover font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#C9A94D]/25 transition-all active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Interactive Avatar Cropper Modal */}
      <AvatarCropModal
        isOpen={cropperOpen}
        imageSrc={imageToCrop}
        onClose={() => setCropperOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
