import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

// Fallback in-memory store for guest/local demonstration when Supabase is awaiting remote credentials
// Starts completely empty (0 comments) across all songs until real users submit comments
const localCommentsStore: Record<string, Array<{
  id: string;
  song_id: string;
  user_id: string;
  user_name: string;
  avatar_url?: string;
  content: string;
  parent_comment_id?: string | null;
  likes: number;
  created_at: string;
  liked_by?: string[];
}>> = {};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const songId = searchParams.get('songId');

  if (!songId) {
    return NextResponse.json({ error: 'Song ID is required' }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          song_id,
          user_id,
          content,
          parent_comment_id,
          created_at,
          profiles (
            username,
            display_name,
            avatar_url
          ),
          comment_likes (
            user_id
          )
        `)
        .eq('song_id', songId)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (!error && data) {
        const comments = data.map((c: any) => ({
          id: c.id,
          song_id: c.song_id,
          user_id: c.user_id,
          user_name: c.profiles?.display_name || c.profiles?.username || 'Listener',
          avatar_url: c.profiles?.avatar_url || '',
          content: c.content,
          parent_comment_id: c.parent_comment_id,
          likes: c.comment_likes?.length || 0,
          created_at: c.created_at,
        }));
        return NextResponse.json({ comments });
      }
    } catch {
      // fallback to local below
    }
  }

  // Local memory store fallback (empty list by default until real users comment)
  const list = localCommentsStore[songId] || [];
  return NextResponse.json({ comments: list });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { songId, content, parentCommentId, user } = body;

    if (!songId || !content?.trim()) {
      return NextResponse.json({ error: 'Invalid comment payload' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { data: authData } = await supabase.auth.getUser();
      if (authData?.user) {
        const { data, error } = await supabase
          .from('comments')
          .insert({
            song_id: songId,
            user_id: authData.user.id,
            content: content.trim(),
            parent_comment_id: parentCommentId || null,
            status: 'published',
          })
          .select()
          .single();

        if (!error && data) {
          return NextResponse.json({ comment: data });
        }
      }
    }

    // Local fallback creation
    const newComment = {
      id: 'local_' + Date.now(),
      song_id: songId,
      user_id: user?.id || 'guest_' + Date.now(),
      user_name: user?.display_name || 'Listener',
      avatar_url: user?.avatar_url || '',
      content: content.trim(),
      parent_comment_id: parentCommentId || null,
      likes: 0,
      created_at: new Date().toISOString(),
    };

    if (!localCommentsStore[songId]) {
      localCommentsStore[songId] = [];
    }
    localCommentsStore[songId].unshift(newComment);

    return NextResponse.json({ comment: newComment });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to post comment' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const commentId = searchParams.get('id');
    const songId = searchParams.get('songId');

    if (!commentId || !songId) {
      return NextResponse.json({ error: 'Missing commentId or songId' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const { error } = await supabase.from('comments').delete().eq('id', commentId);
      if (!error) return NextResponse.json({ success: true });
    }

    // Local fallback deletion
    if (localCommentsStore[songId]) {
      localCommentsStore[songId] = localCommentsStore[songId].filter((c) => c.id !== commentId);
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to delete comment' }, { status: 500 });
  }
}
