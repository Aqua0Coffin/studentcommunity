'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AvatarInitials } from '@/components/ui/avatar-initials';
import { cn } from '@/lib/utils';
import { MessageSquare, Plus, X, Send } from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  GENERAL: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  ACADEMIC: 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
  EVENTS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
};

export default function ForumPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [title, setTitle] = useState('');
  const [contentMd, setContentMd] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [submitting, setSubmitting] = useState(false);

  const [commentContent, setCommentContent] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});

  const loadPosts = () => {
    setLoading(true);
    api.get('/forum')
      .then(({ data }) => setPosts(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPosts(); }, []);

  const handleCreatePost = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/forum', { title, contentMd, category });
      toast.success('Post published!');
      setTitle(''); setContentMd(''); setCategory('GENERAL');
      setShowCreateModal(false);
      loadPosts();
    } catch {
      toast.error('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateComment = async (postId: string) => {
    const content = commentContent[postId];
    if (!content) return;
    try {
      await api.post(`/forum/${postId}/comments`, { content });
      toast.success('Comment added');
      setCommentContent((prev) => ({ ...prev, [postId]: '' }));
      loadPosts();
    } catch {
      toast.error('Failed to add comment');
    }
  };

  const CreatePostForm = () => (
    <form onSubmit={handleCreatePost} className="space-y-4">
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Title</Label>
        <Input required value={title} onChange={(e) => setTitle(e.target.value)} className="h-10 bg-background" placeholder="What's on your mind?" />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</Label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="GENERAL">General</option>
          <option value="ACADEMIC">Academic</option>
          <option value="EVENTS">Events</option>
        </select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Details</Label>
        <textarea
          required
          value={contentMd}
          onChange={(e) => setContentMd(e.target.value)}
          className="flex min-h-[100px] w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-medium text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
          placeholder="Provide more context here…"
        />
      </div>
      <Button type="submit" disabled={submitting} className="w-full h-10 font-semibold">
        {submitting ? 'Publishing…' : 'Publish Post'}
      </Button>
    </form>
  );

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Student Forum</h1>
          <p className="text-muted-foreground mt-1 text-sm">Discuss, ask questions, share with your peers.</p>
        </div>
        {/* Desktop: no button here — form is in sticky sidebar */}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Desktop sticky create form */}
        <div className="hidden lg:block lg:col-span-1">
          <Card className="rounded-2xl shadow-sm sticky top-8">
            <CardHeader className="pb-4 border-b border-border">
              <CardTitle className="text-base font-semibold">New Discussion</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <CreatePostForm />
            </CardContent>
          </Card>
        </div>

        {/* Feed */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-40 rounded-2xl bg-muted animate-pulse" />)}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
              <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground font-semibold">No discussions yet.</p>
              <p className="text-muted-foreground/60 text-sm mt-1">Be the first to start a conversation!</p>
            </div>
          ) : (
            posts.map((post) => {
              const authorName = `${post.author.firstName} ${post.author.lastName}`;
              const commentsOpen = openComments[post.id];
              return (
                <Card key={post.id} className="rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <AvatarInitials name={authorName} size="md" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[12px] font-semibold text-foreground">{authorName}</span>
                          <span className="text-muted-foreground/40 text-xs">·</span>
                          <span className="text-[11px] text-muted-foreground">{new Date(post.createdAt).toLocaleDateString()}</span>
                          <span className={cn('ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide', CATEGORY_COLORS[post.category] ?? CATEGORY_COLORS.GENERAL)}>
                            {post.category}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-foreground leading-snug">{post.title}</h3>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{post.contentMd}</p>
                  </CardContent>
                  <CardFooter className="border-t border-border pt-3 pb-3 flex flex-col gap-3">
                    <button
                      onClick={() => setOpenComments((prev) => ({ ...prev, [post.id]: !commentsOpen }))}
                      className="flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      {post.comments?.length > 0 ? `${post.comments.length} Replies` : 'Reply'}
                    </button>

                    {commentsOpen && (
                      <div className="w-full space-y-3">
                        {post.comments?.length > 0 && (
                          <div className="space-y-2 pl-2 border-l-2 border-border">
                            {post.comments.map((comment: any) => (
                              <div key={comment.id} className="flex items-start gap-2.5">
                                <AvatarInitials name={`${comment.author.firstName} ${comment.author.lastName}`} size="sm" />
                                <div className="flex-1 min-w-0 bg-muted rounded-xl px-3 py-2">
                                  <div className="flex items-center justify-between gap-2 mb-1">
                                    <span className="text-[11px] font-bold text-foreground">{comment.author.firstName} {comment.author.lastName}</span>
                                    <span className="text-[10px] text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-xs text-foreground/80 leading-relaxed">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2 items-center">
                          <AvatarInitials name={user ? `${user.firstName} ${user.lastName}` : 'U'} size="sm" />
                          <div className="flex flex-1 gap-2">
                            <Input
                              value={commentContent[post.id] || ''}
                              onChange={(e) => setCommentContent((prev) => ({ ...prev, [post.id]: e.target.value }))}
                              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleCreateComment(post.id)}
                              placeholder="Write a reply…"
                              className="h-9 text-sm bg-background"
                            />
                            <Button onClick={() => handleCreateComment(post.id)} size="sm" className="h-9 px-3 shrink-0">
                              <Send className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Mobile floating action button */}
      <button
        onClick={() => setShowCreateModal(true)}
        className="lg:hidden fixed bottom-20 right-5 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors z-30"
        aria-label="New post"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Mobile create post modal */}
      {showCreateModal && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end">
          <div className="w-full bg-card rounded-t-3xl border-t border-border p-6 pb-8 animate-slide-up shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-foreground">New Discussion</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 rounded-xl hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <CreatePostForm />
          </div>
        </div>
      )}
    </div>
  );
}
