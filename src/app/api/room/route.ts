import { NextRequest, NextResponse } from 'next/server';

export interface RoomMember {
  id: string;
  name: string;
  username?: string;
  avatar_url?: string;
  isHost?: boolean;
}

export interface RoomState {
  id: string;
  name: string;
  hostName: string;
  hostId: string;
  hostAvatar?: string;
  members: RoomMember[];
  currentTrack: any | null;
  isPlaying: boolean;
  seekTime: number;
  updatedAt: number;
}

// In-memory global rooms store
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

    const callerId = user?.id || `user_${Date.now()}`;
    const callerName = user?.display_name || user?.username || 'Orbit Listener';
    const callerUsername = user?.username || 'listener';
    const callerAvatar = user?.avatar_url || '';

    // Action 1: Create room
    if (action === 'create') {
      const roomId = 'room_' + Math.random().toString(36).substring(2, 8);
      const newRoom: RoomState = {
        id: roomId,
        name: roomName || `${callerName}’s Lounge`,
        hostName: callerName,
        hostId: callerId,
        hostAvatar: callerAvatar,
        members: [
          {
            id: callerId,
            name: callerName,
            username: callerUsername,
            avatar_url: callerAvatar,
            isHost: true,
          },
        ],
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
      if (!code) {
        return NextResponse.json({ error: 'Room code required' }, { status: 400 });
      }

      const existingRoom = rooms.get(code);
      if (!existingRoom) {
        // If room with this code does not exist yet, initialize it with this user as Host!
        const autoRoom: RoomState = {
          id: code,
          name: `Room #${code}`,
          hostName: callerName,
          hostId: callerId,
          hostAvatar: callerAvatar,
          members: [
            {
              id: callerId,
              name: callerName,
              username: callerUsername,
              avatar_url: callerAvatar,
              isHost: true,
            },
          ],
          currentTrack: track || null,
          isPlaying: true,
          seekTime: 0,
          updatedAt: Date.now(),
        };
        rooms.set(code, autoRoom);
        return NextResponse.json(autoRoom);
      }

      // Add or update joining user in room members
      const existingIdx = existingRoom.members.findIndex((m) => m.id === callerId);
      if (existingIdx >= 0) {
        existingRoom.members[existingIdx].name = callerName;
        existingRoom.members[existingIdx].avatar_url = callerAvatar;
        existingRoom.members[existingIdx].username = callerUsername;
      } else {
        existingRoom.members.push({
          id: callerId,
          name: callerName,
          username: callerUsername,
          avatar_url: callerAvatar,
          isHost: callerId === existingRoom.hostId,
        });
      }

      existingRoom.updatedAt = Date.now();
      return NextResponse.json(existingRoom);
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

    // Action 4: Leave room
    if (action === 'leave') {
      const room = rooms.get(code);
      if (room) {
        room.members = room.members.filter((m) => m.id !== callerId);
        room.updatedAt = Date.now();
      }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
