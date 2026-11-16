import { create } from 'zustand';
import { Track } from '@/types/music';

interface PlaylistDialogStore {
  track: Track | null;
  open: (track: Track) => void;
  close: () => void;
}

export const usePlaylistDialogStore = create<PlaylistDialogStore>((set) => ({
  track: null,
  open: (track) => set({ track }),
  close: () => set({ track: null }),
}));
