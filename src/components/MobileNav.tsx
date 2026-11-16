'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Compass, Search, Library, Sparkles, Radio } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';

export default function MobileNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const currentTrack = usePlayerStore((s) => s.currentTrack);

  const navItems = [
    { label: 'Explore', href: '/', icon: Compass },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Find Song', href: '/find-my-song', icon: Sparkles },
    { label: 'Room', href: '/room', icon: Radio },
    { label: 'Library', href: '/library', icon: Library },
  ];

  const isActiveItem = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/search') return pathname.startsWith('/search');
    if (href === '/find-my-song') return pathname.startsWith('/find-my-song');
    if (href === '/room') return pathname.startsWith('/room');
    if (href === '/library') return pathname === '/library';
    return pathname.startsWith(href.split('?')[0]);
  };

  return (
    <nav
      aria-label="Mobile Navigation"
      className={`md:hidden fixed left-0 right-0 z-40 transition-all duration-300 ${
        currentTrack ? 'bottom-[76px]' : 'bottom-0'
      }`}
    >
      <div className="mx-2.5 mb-2 rounded-2xl bg-sidebar/95 backdrop-blur-xl border border-border-subtle shadow-2xl shadow-black/40 px-1 py-1 flex items-center justify-around pb-[max(0.375rem,env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isActiveItem(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-[10px] font-medium transition-all duration-150 min-w-[48px] min-h-[44px] justify-center active:scale-95 ${
                isActive ? 'text-text-primary font-semibold' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <span
                className={`absolute top-0.5 w-1 h-1 rounded-full bg-accent transition-opacity ${
                  isActive ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <span
                className={`flex items-center justify-center w-7 h-5 rounded-lg transition-colors ${
                  isActive ? 'bg-accent/15' : ''
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-accent' : ''}`} />
              </span>
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
