'use client';

import { useEffect, useRef } from 'react';
import { useUser, useClerk } from '@clerk/nextjs';
import { useAuthStore, UserProfile } from '@/store/useAuthStore';
import { db, AuthUserRecord } from '@/lib/db';

export default function ClerkAuthSync() {
  const { isLoaded, isSignedIn, user } = useUser();
  const lastUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      if (lastUserIdRef.current === user.id) return;
      lastUserIdRef.current = user.id;

      const email = user.primaryEmailAddress?.emailAddress?.trim().toLowerCase() || `${user.id}@clerk.cytune.local`;
      const clerkName = user.fullName || user.firstName || email.split('@')[0] || 'Cy Listener';
      const clerkUsername = user.username || email.split('@')[0] || 'cy_listener';
      const clerkAvatar = user.imageUrl || '';

      (async () => {
        try {
          // Check if user already exists in Dexie DB by email or id
          let record: AuthUserRecord | undefined;
          if (email) {
            record = await db.authUsers.get(email);
          }
          if (!record) {
            record = await db.authUsers.where('id').equals(user.id).first();
          }

          if (record) {
            // Restore persistent customizations and coins from Dexie
            const profile: UserProfile = {
              id: user.id,
              email: email,
              username: record.username || clerkUsername,
              display_name: record.displayName || clerkName,
              avatar_url: record.avatarUrl || clerkAvatar,
              bio: record.bio || 'Exploring synthwave horizons and Hi-Fi acoustic frequencies on CyTune.',
              isGuest: false,
              isPremium: record.isPremium ?? false,
              isClerkUser: true,
              coins: typeof record.coins === 'number' ? record.coins : 1000,
              equippedFrame: record.equippedFrame ?? null,
              equippedBorder: record.equippedBorder ?? null,
              equippedBackground: record.equippedBackground ?? null,
              unlockedCosmetics: record.unlockedCosmetics || [],
              joinedDate: new Date(record.createdAt || Date.now()).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              }),
            };
            useAuthStore.getState().setUser(profile);
          } else {
            // Brand new Clerk user: grant 1,000 starter coins and store in Dexie
            const newRecord: AuthUserRecord = {
              id: user.id,
              email: email,
              username: clerkUsername,
              displayName: clerkName,
              avatarUrl: clerkAvatar,
              bio: 'Exploring synthwave horizons and Hi-Fi acoustic frequencies on CyTune.',
              coins: 1000,
              equippedFrame: null,
              equippedBorder: null,
              equippedBackground: null,
              unlockedCosmetics: [],
              isPremium: false,
              isClerkUser: true,
              createdAt: Date.now(),
            };
            await db.authUsers.put(newRecord);

            const profile: UserProfile = {
              id: user.id,
              email: email,
              username: clerkUsername,
              display_name: clerkName,
              avatar_url: clerkAvatar,
              bio: newRecord.bio,
              isGuest: false,
              isPremium: false,
              isClerkUser: true,
              coins: 1000,
              equippedFrame: null,
              equippedBorder: null,
              equippedBackground: null,
              unlockedCosmetics: [],
              joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            };
            useAuthStore.getState().setUser(profile);
          }
        } catch (e) {
          console.error('Error syncing Clerk user to CyTune DB:', e);
        }
      })();
    } else if (!isSignedIn) {
      if (lastUserIdRef.current) {
        lastUserIdRef.current = null;
        const curUser = useAuthStore.getState().user;
        if (curUser?.isClerkUser) {
          useAuthStore.getState().setUser(null);
        }
      }
    }
  }, [isLoaded, isSignedIn, user]);

  return null;
}
