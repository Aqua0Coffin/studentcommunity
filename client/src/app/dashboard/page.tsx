'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function DashboardPage() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/announcements')
      .then(({data}) => setAnnouncements(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Announcements</h1>
        <p className="text-slate-500 mt-2 text-lg">Latest updates from the college administration.</p>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200"></div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
            <p className="text-slate-500 font-medium text-lg">No new announcements at this time.</p>
          </div>
        ) : (
          announcements.map((ann) => (
            <Card key={ann.id} className={`rounded-2xl border-slate-200 shadow-sm transition-all hover:shadow-md ${ann.isPinned ? "border-blue-400 border-2 bg-blue-50/30" : "bg-white"}`}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-xl font-bold text-slate-900">{ann.title}</CardTitle>
                    <CardDescription className="mt-2 flex items-center gap-2 font-medium">
                       {ann.isPinned && <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">Pinned</span>}
                       {new Date(ann.createdAt).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                    </CardDescription>
                  </div>
                  <div className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full whitespace-nowrap">
                    {ann.author.firstName} {ann.author.lastName}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap text-[15px]">{ann.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
