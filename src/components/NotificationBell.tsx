'use client';

import { useState } from 'react';
import { Bell, X } from 'lucide-react';

const UPDATES = [
  { id: 1, title: 'v1.0 released', body: 'Theme toggle, Ko-fi support, and cat mascot improvements.' },
  { id: 2, title: 'CSV import/export', body: 'Export and import your playlists as CSV from the Library.' },
  { id: 3, title: 'Smart autoplay', body: 'Recommendations now avoid repeating tracks within 2.5 hours.' },
];

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="fixed top-4 right-16 z-40 w-10 h-10 rounded-full bg-surface border border-border-subtle shadow-lg flex items-center justify-center text-accent hover:scale-110 active:scale-95 transition-transform"
      >
        <Bell className="w-4 h-4" />
      </button>
      {open && (
        <div className="fixed top-16 right-4 sm:right-16 z-50 w-72 rounded-2xl bg-surface border border-border-subtle shadow-2xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold text-text-primary">Updates</span>
            <button onClick={() => setOpen(false)} className="p-1 rounded text-text-muted hover:text-text-primary">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {UPDATES.map((u) => (
              <div key={u.id} className="rounded-xl bg-surface-hover border border-border-subtle p-2.5">
                <p className="text-[12px] font-semibold text-text-primary">{u.title}</p>
                <p className="text-[11px] text-text-secondary mt-0.5">{u.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
