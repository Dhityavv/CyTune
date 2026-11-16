import { NextRequest, NextResponse } from 'next/server';

interface RoomState {
  id: string;
  name: string;
  hostName: string;
  hostId: string;
  members: Array<{ id: string; name: string }>;
  currentTrack: any | null;
  isPlaying: boolean;
  seekTime: number;
  updatedAt: number;
}

// In-memory global rooms store (accessible by all tabs / users on same instance)
const rooms = new Map<string, RoomState>();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.json({ error: 'Room code required' }, { status: 400 });
  }

  const room = rooms.get(code);
  if (!room) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  return NextResponse.json(room);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, code, roomName, user, track, isPlaying, seekTime } = body;

    // Action 1: Create room
    if (action === 'create') {
      const roomId = 'room_' + Math.random().toString(36).substring(2, 8);
      const newRoom: RoomState = {
        id: roomId,
        name: roomName || `${user?.display_name || 'Host'}’s Lounge`,
        hostName: user?.display_name || 'Host Listener',
        hostId: user?.id || 'host',
        members: [{ id: user?.id || 'host', name: user?.display_name || 'Host Listener' }],
        currentTrack: track || null,
        isPlaying: Boolean(isPlaying),
        seekTime: seekTime || 0,
        updatedAt: Date.now(),
      };
      rooms.set(roomId, newRoom);
      return NextResponse.json(newRoom);
    }

    // Action 2: Join room
    if (action === 'join') {
      const room = rooms.get(code);
      if (!room) {
        // Automatically create session with this code so friends joining immediately enter!
        const autoRoom: RoomState = {
          id: code,
          name: `Room #${code}`,
          hostName: 'Host Listener',
          hostId: 'host',
          members: [
            { id: 'host', name: 'Host Listener' },
            { id: user?.id || `user_${Date.now()}`, name: user?.display_name || 'Orbit Listener' },
          ],
          currentTrack: track || null,
          isPlaying: true,
          seekTime: 0,
          updatedAt: Date.now(),
        };
        rooms.set(code, autoRoom);
        return NextResponse.json(autoRoom);
      }

      // Add user to room members if not already present
      const userId = user?.id || `user_${Date.now()}`;
      const userName = user?.display_name || 'Guest Listener';
      if (!room.members.some((m) => m.id === userId || m.name === userName)) {
        room.members.push({ id: userId, name: userName });
      }
      room.updatedAt = Date.now();
      return NextResponse.json(room);
    }

    // Action 3: Sync playback from Host
    if (action === 'sync') {
      const room = rooms.get(code);
      if (!room) {
        return NextResponse.json({ error: 'Room not found' }, { status: 404 });
      }

      if (track !== undefined) room.currentTrack = track;
      if (isPlaying !== undefined) room.isPlaying = isPlaying;
      if (seekTime !== undefined) room.seekTime = seekTime;
      room.updatedAt = Date.now();

      return NextResponse.json(room);
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
