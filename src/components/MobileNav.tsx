'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Compass, Search, Library, Heart } from 'lucide-react';
import { usePlayerStore } from '@/store/usePlayerStore';

export default function MobileNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get('tab');
  const currentTrack = usePlayerStore((s) => s.currentTrack);

  const navItems = [
    { label: 'Explore', href: '/', icon: Compass },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Library', href: '/library', icon: Library },
    { label: 'Liked', href: '/library?tab=favorites', icon: Heart },
  ];

  const isActiveItem = (href: string) => {
    if (href === '/') return pathname === '/';
    if (href === '/search') return pathname.startsWith('/search');
    if (href === '/library') return pathname === '/library' && (!tab || tab === 'playlists' || tab === 'history');
    if (href === '/library?tab=favorites') return pathname === '/library' && tab === 'favorites';
    return pathname.startsWith(href.split('?')[0]);
  };

  return (
    <nav
      className={`md:hidden fixed left-0 right-0 z-40 bg-sidebar/95 backdrop-blur-xl border-t border-border-subtle px-4 py-2 flex items-center justify-around transition-all ${
        currentTrack ? 'bottom-[76px]' : 'bottom-0'
      }`}
    >
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = isActiveItem(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg text-[10px] font-medium transition-colors min-w-[44px] min-h-[44px] justify-center ${
              isActive ? 'text-accent font-semibold' : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
