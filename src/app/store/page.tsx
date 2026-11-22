'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Sparkles,
  Lock,
  Check,
  Eye,
  Crown,
  Layers,
  ShieldCheck,
  AlertCircle,
  X,
  ArrowRight,
  User,
  Zap
} from 'lucide-react';
import {
  CosmeticItem,
  AVATAR_FRAMES,
  PROFILE_BORDERS,
  PROFILE_BACKGROUNDS,
  ALL_COSMETICS,
} from '@/lib/cosmetics';
import { useAuthStore } from '@/store/useAuthStore';
import AvatarFrame from '@/components/cosmetics/AvatarFrame';
import ProfileBorder from '@/components/cosmetics/ProfileBorder';
import ProfileBackground from '@/components/cosmetics/ProfileBackground';
import AuthModal from '@/components/AuthModal';

export default function CosmeticStorePage() {
  const { user, equipCosmetic, unlockCosmetic, buyPremiumWithCoins } = useAuthStore();
  const [activeCategory, setActiveCategory] = useState<'all' | 'frame' | 'border' | 'background'>('all');
  const [previewItem, setPreviewItem] = useState<CosmeticItem | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string; type: 'success' | 'error' } | null>(null);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const userCoins = typeof user?.coins === 'number' ? user.coins : 500;
  const PREMIUM_PRICE = 5000;

  const isItemEquipped = (item: CosmeticItem) => {
    if (!user) return false;
    if (item.category === 'frame') return user.equippedFrame === item.id;
    if (item.category === 'border') return user.equippedBorder === item.id;
    if (item.category === 'background') return user.equippedBackground === item.id;
    return false;
  };

  const isItemUnlocked = (item: CosmeticItem) => {
    if (!user) return false;
    if (item.isPremiumOnly) return !!user.isPremium;
    return user.unlockedCosmetics?.includes(item.id) ?? true;
  };

  const showToast = (title: string, type: 'success' | 'error') => {
    setToastMessage({ title, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const handleBuyPremium = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    const res = buyPremiumWithCoins();
    if (!res.success) {
      showToast(res.error || 'Gagal membeli premium.', 'error');
      setIsPremiumModalOpen(true);
    } else {
      showToast('🎉 Selamat! Status Hi-Fi Premium aktif dengan 5.000 Orbit Coins!', 'success');
      setIsPremiumModalOpen(false);
    }
  };

  const handleEquip = (item: CosmeticItem) => {
    const currentlyEquipped = isItemEquipped(item);
    const targetId = currentlyEquipped ? null : item.id;

    const res = equipCosmetic(item.category, targetId);
    if (!res.success) {
      showToast(res.error || 'Failed to equip cosmetic.', 'error');
    } else {
      showToast(
        currentlyEquipped
          ? `Unequipped ${item.name}`
          : `Equipped ${item.name} successfully!`,
        'success'
      );
    }
  };

  const handleClaim = (item: CosmeticItem) => {
    if (item.isPremiumOnly && !user?.isPremium) {
      showToast('Exclusive to Hi-Fi Premium members. Upgrade to claim.', 'error');
      return;
    }
    unlockCosmetic(item.id);
    showToast(`Claimed ${item.name}! Added to your inventory.`, 'success');
  };

  const filteredItems = ALL_COSMETICS.filter((item) => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  return (
    <div className="space-y-10 pb-28 max-w-6xl mx-auto select-none">
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

      {/* Store Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-surface/70 border border-border-subtle p-6 sm:p-10 shadow-2xl backdrop-blur-md">
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A94D 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #BBF41D 0%, transparent 70%)' }}
        />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 z-10 relative">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em] bg-accent/15 text-accent border border-accent/25 flex items-center gap-1.5 font-mono">
                <ShoppingBag className="w-3.5 h-3.5" />
                Profile Marketplace
              </span>
              {user?.isPremium ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent text-[#101114] flex items-center gap-1 shadow-sm">
                  <Crown className="w-3 h-3" />
                  Hi-Fi Premium Active
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-sidebar border border-border-subtle text-text-muted flex items-center gap-1 font-mono">
                  Free Listener Tier
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary">
              Cosmetic Store
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Personalize your listening identity. Equip handcrafted avatar frames, dynamic profile card borders, and atmospheric premium canvas backgrounds.
            </p>
          </div>

          {/* Quick Profile & Orbit Coins Wallet Card */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3.5 rounded-2xl bg-sidebar/80 border border-border-subtle backdrop-blur-md">
            <div className="flex items-center gap-3 px-2">
              <AvatarFrame frameId={user?.equippedFrame} size={44}>
                {user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-5 h-5 text-text-muted" />
                )}
              </AvatarFrame>
              <div className="text-left">
                <span className="text-xs font-bold text-text-primary block leading-tight">
                  {user?.display_name || 'Guest Listener'}
                </span>
                <span className="text-[11px] text-accent font-mono font-bold flex items-center gap-1 mt-0.5">
                  <span>🪙</span>
                  <span>{userCoins.toLocaleString()} Coins</span>
                </span>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-border-subtle" />

            {user?.isPremium ? (
              <div className="px-3 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 bg-accent/20 border border-accent/40 text-accent">
                <Crown className="w-3.5 h-3.5" />
                <span>Hi-Fi Premium Active</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsPremiumModalOpen(true)}
                className="px-3.5 py-2 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 bg-accent text-[#101114] hover:bg-accent-hover shadow-lg shadow-[#C9A94D]/25 transition-all active:scale-95 cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5" />
                <span>Beli Premium (5.000 Coins)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-4 overflow-x-auto no-scrollbar gap-2">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Items', count: ALL_COSMETICS.length },
            { id: 'frame', label: 'Avatar Frames', count: AVATAR_FRAMES.length },
            { id: 'border', label: 'Profile Borders', count: PROFILE_BORDERS.length },
            { id: 'background', label: 'Backgrounds (Premium)', count: PROFILE_BACKGROUNDS.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                activeCategory === tab.id
                  ? 'bg-accent text-[#101114] shadow-md shadow-[#C9A94D]/25'
                  : 'bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border-subtle'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  activeCategory === tab.id ? 'bg-[#101114]/30 text-[#101114]' : 'bg-sidebar text-text-muted'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <Link
          href="/profile"
          className="text-xs font-semibold text-accent hover:underline flex items-center gap-1.5 shrink-0 px-2"
        >
          <span>View My Profile</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const equipped = isItemEquipped(item);
          const unlocked = isItemUnlocked(item);
          const lockedPremium = item.isPremiumOnly && !user?.isPremium;

          return (
            <div
              key={item.id}
              className={`group relative rounded-3xl bg-surface/70 border transition-all duration-300 p-6 flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-2xl ${
                equipped
                  ? 'border-accent shadow-accent/15'
                  : 'border-border-subtle hover:border-accent/40'
              }`}
            >
              {/* Top Graphic Visualizer Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-mono border ${
                        item.rarity === 'Legendary'
                          ? 'bg-accent/15 text-accent border-accent/30'
                          : item.rarity === 'Epic'
                          ? 'bg-[#BBF41D]/15 text-[#BBF41D] border-[#BBF41D]/30'
                          : 'bg-surface border-border-subtle text-text-muted'
                      }`}
                    >
                      {item.rarity}
                    </span>

                    {item.isPremiumOnly && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1 font-mono">
                        <Crown className="w-2.5 h-2.5" />
                        Premium
                      </span>
                    )}
                  </div>

                  {equipped && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-accent text-[#101114] flex items-center gap-1 shadow-sm font-mono">
                      <Check className="w-3 h-3" />
                      Equipped
                    </span>
                  )}
                </div>

                {/* Visual Stage */}
                <div className="relative h-44 rounded-2xl bg-sidebar/90 border border-border-subtle overflow-hidden flex items-center justify-center p-4">
                  {/* Category-Specific Visual Preview */}
                  {item.category === 'frame' && (
                    <AvatarFrame frameId={item.id} size={90}>
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-10 h-10 text-text-muted" />
                      )}
                    </AvatarFrame>
                  )}

                  {item.category === 'border' && (
                    <div className="w-full max-w-[210px]">
                      <ProfileBorder borderId={item.id} className="p-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center text-accent text-xs font-bold">
                            OT
                          </div>
                          <div className="space-y-0.5">
                            <div className="w-16 h-2 rounded bg-text-primary/70" />
                            <div className="w-10 h-1.5 rounded bg-text-muted/50" />
                          </div>
                        </div>
                      </ProfileBorder>
                    </div>
                  )}

                  {item.category === 'background' && (
                    <div className="relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center">
                      <ProfileBackground backgroundId={item.id} overlayOpacity={0.65} />
                      <div className="relative z-10 px-3 py-1.5 rounded-xl bg-surface/80 border border-border-subtle text-[11px] font-bold text-text-primary backdrop-blur-md flex items-center gap-1.5 shadow-lg">
                        <Sparkles className="w-3 h-3 text-accent" />
                        <span>Atmosphere Preview</span>
                      </div>
                    </div>
                  )}

                  {/* Locked Overlay if non-premium */}
                  {lockedPremium && (
                    <div className="absolute inset-0 bg-[#0A0B0D]/75 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 text-center p-4">
                      <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <span className="text-[11px] font-bold text-text-primary">
                        Hi-Fi Premium Required
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-text-primary group-hover:text-accent transition-colors">
                    {item.name}
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewItem(item)}
                  className="p-2.5 rounded-xl bg-surface hover:bg-surface-hover border border-border-subtle text-text-secondary hover:text-text-primary transition-all shrink-0"
                  title="Full Live Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {lockedPremium ? (
                  <button
                    type="button"
                    onClick={() => setIsPremiumModalOpen(true)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Crown className="w-3.5 h-3.5" />
                    <span>Unlock with Premium</span>
                  </button>
                ) : unlocked ? (
                  <button
                    type="button"
                    onClick={() => handleEquip(item)}
                    className={`flex-1 py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                      equipped
                        ? 'bg-surface hover:bg-surface-hover border border-accent/40 text-accent'
                        : 'bg-accent hover:bg-accent-hover text-[#101114] shadow-[#C9A94D]/25'
                    }`}
                  >
                    {equipped ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Equipped</span>
                      </>
                    ) : (
                      <span>Equip Item</span>
                    )}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleClaim(item)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-[#BBF41D] hover:bg-[#aee619] text-[#101114] font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#BBF41D]/25 active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Claim Free</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Preview Modal (Glass3D Inspection Studio) */}
      {previewItem && (
        <div className="fixed inset-0 z-[9999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-xl rounded-3xl bg-surface/90 border border-border-subtle p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6">
            <button
              type="button"
              onClick={() => setPreviewItem(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-sidebar hover:bg-surface text-text-muted hover:text-text-primary transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent font-mono">
                Live Cosmetic Inspection
              </span>
              <h2 className="text-xl font-bold text-text-primary">{previewItem.name}</h2>
              <p className="text-xs text-text-secondary">{previewItem.description}</p>
            </div>

            {/* Stage Preview Box */}
            <div className="relative h-64 rounded-2xl overflow-hidden border border-border-subtle flex items-center justify-center p-6 bg-[#0E0F12]">
              {/* Background layer */}
              <ProfileBackground
                backgroundId={
                  previewItem.category === 'background'
                    ? previewItem.id
                    : user?.equippedBackground
                }
              />

              {/* Profile card preview inside */}
              <div className="relative z-10 w-full max-w-sm">
                <ProfileBorder
                  borderId={
                    previewItem.category === 'border'
                      ? previewItem.id
                      : user?.equippedBorder
                  }
                  className="p-5"
                >
                  <div className="flex items-center gap-4">
                    <AvatarFrame
                      frameId={
                        previewItem.category === 'frame'
                          ? previewItem.id
                          : user?.equippedFrame
                      }
                      size={68}
                    >
                      {user?.avatar_url ? (
                        <img
                          src={user.avatar_url}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-text-muted" />
                      )}
                    </AvatarFrame>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-text-primary">
                          {user?.display_name || 'Cy Listener'}
                        </span>
                        {user?.isPremium && (
                          <Crown className="w-3.5 h-3.5 text-accent shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-text-muted font-mono block">
                        @{user?.username || 'cy_listener'}
                      </span>
                      <span className="text-[11px] text-text-secondary line-clamp-1">
                        {user?.bio || 'Music lover streaming on CyTune.'}
                      </span>
                    </div>
                  </div>
                </ProfileBorder>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-5 py-2.5 rounded-xl bg-surface hover:bg-surface-hover text-text-secondary text-xs font-semibold"
              >
                Close Preview
              </button>

              <button
                type="button"
                onClick={() => {
                  handleEquip(previewItem);
                  setPreviewItem(null);
                }}
                className="px-6 py-2.5 rounded-xl bg-accent text-[#101114] hover:bg-accent-hover font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-[#C9A94D]/25"
              >
                <Check className="w-4 h-4" />
                <span>
                  {isItemEquipped(previewItem) ? 'Unequip Cosmetic' : 'Equip to Profile'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hi-Fi Premium Purchase Modal */}
      {isPremiumModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-[#101114] border border-border-subtle p-6 shadow-2xl space-y-5">
            <button
              type="button"
              onClick={() => setIsPremiumModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-surface text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-2 pt-2">
              <div className="w-14 h-14 rounded-2xl bg-accent/20 border border-accent/40 text-accent flex items-center justify-center mx-auto shadow-lg shadow-[#C9A94D]/30">
                <Crown className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-extrabold text-text-primary tracking-tight">
                Unlock Hi-Fi Premium Pass
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                Akses semua atmospheric background eksklusif, mahkota profil emas, dan pengalaman streaming audio tanpa batas.
              </p>
            </div>

            {/* Price & Balance Box */}
            <div className="p-4 rounded-2xl bg-surface border border-border-subtle space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Biaya Premium:</span>
                <span className="font-mono font-bold text-accent flex items-center gap-1">
                  <span>🪙</span>
                  <span>{PREMIUM_PRICE.toLocaleString()} Orbit Coins</span>
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Koinmu Saat Ini:</span>
                <span className="font-mono font-bold text-text-primary flex items-center gap-1">
                  <span>🪙</span>
                  <span>{userCoins.toLocaleString()} Orbit Coins</span>
                </span>
              </div>
              <div className="h-px bg-border-subtle" />
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Status:</span>
                {userCoins >= PREMIUM_PRICE ? (
                  <span className="font-bold text-emerald-400">Koin Mencukupi</span>
                ) : (
                  <span className="font-bold text-red-400">
                    Kurang {(PREMIUM_PRICE - userCoins).toLocaleString()} Coins
                  </span>
                )}
              </div>
            </div>

            {/* If insufficient coins, guide to play minigames */}
            {userCoins < PREMIUM_PRICE ? (
              <div className="space-y-3">
                <p className="text-[11px] text-text-muted text-center leading-relaxed">
                  Kamu belum punya cukup koin. Kumpulkan Orbit Coins secara gratis dengan bermain mini games:
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <Link
                    href="/games/trivia"
                    onClick={() => setIsPremiumModalOpen(false)}
                    className="p-3 rounded-xl bg-surface hover:bg-surface-hover border border-border-subtle text-center space-y-1 transition-all"
                  >
                    <span className="text-xs font-bold text-text-primary block">Music Trivia</span>
                    <span className="text-[10px] text-accent block font-mono">+100 koin/soal</span>
                  </Link>
                  <Link
                    href="/games/guess-the-song"
                    onClick={() => setIsPremiumModalOpen(false)}
                    className="p-3 rounded-xl bg-surface hover:bg-surface-hover border border-border-subtle text-center space-y-1 transition-all"
                  >
                    <span className="text-xs font-bold text-text-primary block">Guess the Song</span>
                    <span className="text-[10px] text-accent block font-mono">+150 koin/lagu</span>
                  </Link>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleBuyPremium}
                className="w-full py-3 rounded-2xl bg-accent text-[#101114] hover:bg-accent-hover font-bold text-xs shadow-lg shadow-[#C9A94D]/30 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Crown className="w-4 h-4" />
                <span>Beli Hi-Fi Premium ({PREMIUM_PRICE.toLocaleString()} Coins)</span>
              </button>
            )}
          </div>
        </div>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
