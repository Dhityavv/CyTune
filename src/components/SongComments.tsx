'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Heart, CornerDownRight, Trash2, Flag, Send, User, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useAuthModalStore } from '@/store/useAuthModalStore';

interface CommentItem {
  id: string;
  song_id: string;
  user_id: string;
  user_name: string;
  avatar_url?: string;
  content: string;
  parent_comment_id?: string | null;
  likes: number;
  created_at: string;
  isLiked?: boolean;
}

interface SongCommentsProps {
  songId: string;
  songTitle?: string;
}

function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SongComments({ songId, songTitle }: SongCommentsProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyToId, setReplyToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const { user } = useAuthStore();

  const fetchComments = useCallback(async () => {
    if (!songId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/comments?songId=${encodeURIComponent(songId)}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [songId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePostComment = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    const text = parentId ? replyContent.trim() : content.trim();
    if (!text) return;

    if (!user) {
      useAuthModalStore.getState().open('Silakan masuk untuk menulis komentar pada lagu ini.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          songId,
          content: text,
          parentCommentId: parentId,
          user,
        }),
      });

      if (res.ok) {
        if (parentId) {
          setReplyContent('');
          setReplyToId(null);
        } else {
          setContent('');
        }
        await fetchComments();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLike = (commentId: string) => {
    if (!user) {
      useAuthModalStore.getState().open('Silakan masuk untuk menyukai komentar ini.');
      return;
    }
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const nextLiked = !c.isLiked;
          return {
            ...c,
            isLiked: nextLiked,
            likes: nextLiked ? c.likes + 1 : Math.max(0, c.likes - 1),
          };
        }
        return c;
      })
    );
  };

  // Group top-level and replies
  const topLevel = comments.filter((c) => !c.parent_comment_id);
  const replies = comments.filter((c) => !!c.parent_comment_id);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-text-primary">
            Comments <span className="font-mono text-xs text-text-muted">({comments.length})</span>
          </h3>
        </div>
        <span className="text-[11px] text-text-muted truncate max-w-[160px]">
          {songTitle || 'This track'}
        </span>
      </div>

      {/* Main Comment Input Box */}
      <form onSubmit={(e) => handlePostComment(e, null)} className="space-y-2">
        <div className="relative">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={user ? "What do you think of this track?" : "Sign in to leave a comment..."}
            rows={2}
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface border border-border-subtle text-text-primary text-xs placeholder:text-text-muted focus:outline-none focus:border-accent resize-none transition-colors"
          />
        </div>
        <div className="flex items-center justify-between pt-0.5">
          <p className="text-[10px] text-text-muted">
            Be respectful and adhere to community guidelines.
          </p>
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-accent text-[#101114] hover:bg-accent-hover font-bold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-95 shadow-sm"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            <span>Comment</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center text-text-muted gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-accent" />
            <p className="text-xs">Loading community comments...</p>
          </div>
        ) : topLevel.length > 0 ? (
          topLevel.map((comment) => {
            const childReplies = replies.filter((r) => r.parent_comment_id === comment.id);
            return (
              <div key={comment.id} className="p-3 rounded-xl bg-surface/70 border border-border-subtle space-y-2">
                {/* Author Info */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-xs overflow-hidden shrink-0">
                      {comment.avatar_url ? (
                        <img src={comment.avatar_url} alt={comment.user_name} className="w-full h-full object-cover" />
                      ) : (
                        comment.user_name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div>
                      <p className="text-[12px] font-bold text-text-primary leading-tight">{comment.user_name}</p>
                      <p className="text-[10px] text-text-muted">{timeAgo(comment.created_at)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleLike(comment.id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                        comment.isLiked ? 'text-accent fill-accent bg-accent/15' : 'text-text-muted hover:text-text-primary'
                      }`}
                      aria-label="Like comment"
                    >
                      <Heart className={`w-3.5 h-3.5 ${comment.isLiked ? 'fill-current' : ''}`} />
                      <span>{comment.likes}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setReplyToId(replyToId === comment.id ? null : comment.id)}
                      className="p-1 rounded-lg text-text-muted hover:text-text-primary transition-colors text-[11px]"
                      aria-label="Reply to comment"
                    >
                      <CornerDownRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Comment Text */}
                <p className="text-xs text-text-primary whitespace-pre-wrap leading-relaxed pl-9">
                  {comment.content}
                </p>

                {/* Reply Form if open */}
                {replyToId === comment.id && (
                  <form onSubmit={(e) => handlePostComment(e, comment.id)} className="pl-9 pt-2 space-y-1.5">
                    <input
                      type="text"
                      autoFocus
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`Reply to ${comment.user_name}...`}
                      className="w-full px-3 py-1.5 rounded-lg bg-sidebar border border-border-subtle text-text-primary text-xs focus:outline-none focus:border-accent"
                    />
                    <div className="flex justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyToId(null);
                          setReplyContent('');
                        }}
                        className="px-2.5 py-1 text-[11px] text-text-secondary hover:text-text-primary"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={!replyContent.trim()}
                        className="px-3 py-1 rounded-lg bg-accent text-[#101114] text-[11px] font-bold hover:bg-accent-hover disabled:opacity-40"
                      >
                        Reply
                      </button>
                    </div>
                  </form>
                )}

                {/* Replies nested list */}
                {childReplies.length > 0 && (
                  <div className="pl-9 pt-1.5 space-y-2 border-l border-border-subtle/70 ml-3.5">
                    {childReplies.map((reply) => (
                      <div key={reply.id} className="p-2 rounded-lg bg-sidebar/50 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-[11px] text-text-primary">{reply.user_name}</span>
                          <span className="text-[9px] text-text-muted">{timeAgo(reply.created_at)}</span>
                        </div>
                        <p className="text-text-secondary leading-normal">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="py-14 text-center space-y-2.5">
            <div className="w-10 h-10 rounded-full bg-surface border border-border-subtle flex items-center justify-center text-text-muted mx-auto">
              <MessageSquare className="w-4 h-4" />
            </div>
            <p className="text-xs font-semibold text-text-primary">No comments yet</p>
            <p className="text-[11px] text-text-secondary max-w-xs mx-auto">
              Be the first to share your thoughts on this song with the community.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
