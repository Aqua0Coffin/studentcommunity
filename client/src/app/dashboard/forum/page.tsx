'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function ForumPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Post State
  const [title, setTitle] = useState('');
  const [contentMd, setContentMd] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [submitting, setSubmitting] = useState(false);

  // Comments State
  const [commentContent, setCommentContent] = useState<{ [key: string]: string }>({});

  const loadPosts = () => {
    setLoading(true);
    api.get('/forum')
      .then(({data}) => setPosts(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/forum', { title, contentMd, category });
      toast.success('Post published!');
      setTitle(''); setContentMd(''); setCategory('GENERAL');
      loadPosts();
    } catch (error) {
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
      setCommentContent({ ...commentContent, [postId]: '' });
      loadPosts(); // Ideally just update local state, but keeping it simple
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Student Forum</h1>
          <p className="text-slate-500 mt-2 text-lg">Discuss, ask questions, and share with your peers.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* New Post Form */}
        <div className="lg:col-span-1">
          <Card className="rounded-2xl border-slate-200 shadow-sm sticky top-8">
            <CardHeader className="pb-4 bg-slate-50/50 border-b border-slate-100 rounded-t-2xl">
              <CardTitle className="text-xl font-bold">Create a Discussion</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Title</Label>
                  <Input required value={title} onChange={e => setTitle(e.target.value)} className="h-11 bg-slate-50 font-medium" placeholder="What's on your mind?" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Category</Label>
                  <select 
                    value={category} 
                    onChange={e => setCategory(e.target.value)} 
                    className="flex h-11 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2"
                  >
                    <option value="GENERAL">General</option>
                    <option value="ACADEMIC">Academic</option>
                    <option value="EVENTS">Events</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-slate-700">Details</Label>
                  <textarea 
                    required 
                    value={contentMd} 
                    onChange={e => setContentMd(e.target.value)} 
                    className="flex min-h-[120px] w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2" 
                    placeholder="Provide more context here..." 
                  />
                </div>
                <Button type="submit" disabled={submitting} className="w-full font-bold h-11 bg-blue-600 hover:bg-blue-700 text-white mt-4 shadow-sm">
                  {submitting ? 'Publishing...' : 'Publish Post'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Feed */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
             <div className="h-48 rounded-2xl bg-slate-100 animate-pulse border border-slate-200"></div>
          ) : posts.length === 0 ? (
             <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
                <p className="text-slate-500 font-bold text-lg">No discussions yet.</p>
                <p className="text-slate-400 mt-1">Be the first to start a conversation!</p>
             </div>
          ) : (
            posts.map(post => (
              <Card key={post.id} className="rounded-2xl border-slate-200 shadow-sm transition-all hover:shadow-md">
                <CardHeader className="pb-3 flex flex-row justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full uppercase tracking-wider mb-3 inline-block">
                      {post.category}
                    </span>
                    <CardTitle className="text-xl font-extrabold text-slate-900 leading-tight">
                      {post.title}
                    </CardTitle>
                    <div className="text-sm font-medium text-slate-500 mt-3 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs text-slate-700 font-bold uppercase ring-2 ring-white shadow-sm">
                        {post.author.firstName[0]}
                      </div>
                      <span className="text-slate-700 font-bold">{post.author.firstName} {post.author.lastName}</span>
                      <span className="text-slate-300">•</span> 
                      {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-2">
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap text-[15.5px]">{post.contentMd}</p>
                </CardContent>
                <CardFooter className="bg-slate-50/50 rounded-b-2xl border-t border-slate-100 p-5 block flex flex-col gap-4">
                  <div className="w-full">
                    <h4 className="text-sm font-bold text-slate-700 mb-4 ml-1 flex items-center gap-2">
                       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                       Discussion {post.comments?.length > 0 ? `(${post.comments.length})` : ''}
                    </h4>
                    {post.comments?.length > 0 ? (
                      <div className="space-y-3 mb-5">
                        {post.comments.map((comment: any) => (
                           <div key={comment.id} className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                             <div className="font-bold text-slate-900 text-[14px] flex justify-between items-center mb-1.5">
                               <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-bold uppercase">
                                    {comment.author.firstName[0]}
                                  </div>
                                  {comment.author.firstName} {comment.author.lastName}
                               </div>
                               <span className="text-xs text-slate-400 font-medium">{new Date(comment.createdAt).toLocaleDateString()}</span>
                             </div>
                             <p className="text-slate-700 text-[14px] leading-relaxed ml-7">{comment.content}</p>
                           </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 ml-1 mb-5 font-medium italic">No comments yet. Share your thoughts!</p>
                    )}
                    
                    <div className="flex gap-3">
                      <Input 
                        value={commentContent[post.id] || ''} 
                        onChange={(e) => setCommentContent({...commentContent, [post.id]: e.target.value})}
                        placeholder="Write a comment..." 
                        className="h-11 bg-white border-slate-200 shadow-sm"
                      />
                      <Button onClick={() => handleCreateComment(post.id)} className="h-11 px-6 font-bold shadow-sm bg-slate-900 hover:bg-slate-800 text-white">Reply</Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
