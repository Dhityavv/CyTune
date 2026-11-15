import type { Metadata } from 'next';
import Script from 'next/script';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Suspense } from 'react';
import Sidebar from '@/components/Sidebar';
import MobileNav from '@/components/MobileNav';
import BottomPlayer from '@/components/BottomPlayer';
import ExpandedPlayer from '@/components/ExpandedPlayer';
import CatMascot from '@/components/CatMascot';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationBell from '@/components/NotificationBell';
import QueueDrawer from '@/components/QueueDrawer';
import AudioController from '@/components/AudioController';
import AmbientBackground from '@/components/AmbientBackground';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'OrbitTune — High Resolution Music Streaming',
  description: 'An editorial, ad-free music streaming platform with synced lyrics and smart autoplay.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark h-full`}>
      <head>
        <Script
          id="orbittune-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('orbittune-theme');if(t==='light'){document.documentElement.classList.remove('dark');document.documentElement.classList.add('light');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="h-full flex flex-col antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-3 focus:py-2 focus:rounded-lg focus:bg-accent focus:text-[#101114] focus:text-xs focus:font-semibold">
          Skip to content
        </a>
        {/* Subtle Ambient Acoustic Backdrop */}
        <AmbientBackground />

        {/* Global Headless Audio Engine */}
        <AudioController />

        {/* Global Layout Shell */}
        <div className="relative z-10 flex flex-1 h-screen overflow-hidden">
          {/* Persistent Desktop Sidebar */}
          <Suspense fallback={null}>
            <Sidebar />
          </Suspense>

          {/* Main Scrollable Canvas */}
          <main id="main-content" className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-10 pt-4 md:pt-6 pb-36 md:pb-32 ">
            <div className="max-w-7xl mx-auto w-full">{children}</div>
          </main>
        </div>

        {/* Collapsible Slide-over Queue Drawer */}
        <QueueDrawer />

        {/* Mobile Fixed Bottom Navigation (Hidden on desktop) */}
        <Suspense fallback={null}>
          <MobileNav />
        </Suspense>

        {/* Docked Persistent Bottom Music Player */}
        <BottomPlayer />

        {/* Fullscreen Expanded Player & Karaoke Lyrics */}
        <ExpandedPlayer />

        {/* Floating cat mascot assistant */}
        <CatMascot />

        {/* Floating theme toggle */}
        <ThemeToggle />

        {/* Notifications / channel updates */}
        <NotificationBell />
      </body>
    </html>
  );
}
