'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Pin, Megaphone } from 'lucide-react';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/announcements')
      .then(({ data }) => setAnnouncements(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const pinned = announcements.filter((a) => a.isPinned);
  const regular = announcements.filter((a) => !a.isPinned);

  return (
    <div className="space-y-8 animate-fade-up">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Announcements</h1>
        <p className="text-muted-foreground mt-1 text-sm">Latest updates from the college administration.</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16 bg-card rounded-2xl border border-dashed border-border">
          <Megaphone className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">No announcements at this time.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {pinned.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                <Pin className="w-3.5 h-3.5" /> Pinned
              </h2>
              <div className="space-y-3">
                {pinned.map((ann, i) => (
                  <AnnouncementCard key={ann.id} ann={ann} pinned delay={i * 50} />
                ))}
              </div>
            </section>
          )}
          {regular.length > 0 && (
            <section>
              <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Recent</h2>
              <div className="space-y-3">
                {regular.map((ann, i) => (
                  <AnnouncementCard key={ann.id} ann={ann} pinned={false} delay={i * 40} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function AnnouncementCard({ ann, pinned, delay }: { ann: any; pinned: boolean; delay: number }) {
  return (
    <Card
      className={`rounded-2xl shadow-sm transition-shadow hover:shadow-md animate-fade-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              {pinned && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-primary text-primary-foreground px-2 py-0.5 rounded-full uppercase tracking-wide">
                  <Pin className="w-2.5 h-2.5" /> Pinned
                </span>
              )}
            </div>
            <CardTitle className="text-base font-semibold text-foreground leading-snug">{ann.title}</CardTitle>
            <CardDescription className="mt-1 text-xs flex items-center gap-2">
              <span className="font-medium text-foreground/70">{ann.author?.firstName} {ann.author?.lastName}</span>
              <span className="text-muted-foreground/50">·</span>
              <span>{new Date(ann.createdAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{ann.content}</p>
      </CardContent>
    </Card>
  );
}
