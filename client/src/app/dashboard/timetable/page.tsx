'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function TimetablePage() {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/timetable')
      .then(({data}) => setTimetable(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">Your Timetable</h1>
        <p className="text-slate-500 mt-2 text-lg">Schedule for your department and batch.</p>
      </div>

      <div className="grid gap-6">
        {loading ? (
          <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse border border-slate-200"></div>
        ) : timetable.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 border-dashed">
            <p className="text-slate-500 font-medium text-lg">No timetable available.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm pb-2">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="p-4 font-extrabold text-slate-700 tracking-wide">Day</th>
                  <th className="p-4 font-extrabold text-slate-700 tracking-wide">Period</th>
                  <th className="p-4 font-extrabold text-slate-700 tracking-wide">Subject</th>
                  <th className="p-4 font-extrabold text-slate-700 tracking-wide">Faculty</th>
                  <th className="p-4 font-extrabold text-slate-700 tracking-wide">Room</th>
                </tr>
              </thead>
              <tbody>
                {timetable.map((t, i) => {
                  const isNewDay = i === 0 || timetable[i - 1].dayOfWeek !== t.dayOfWeek;
                  return (
                    <tr key={t.id} className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/70 transition-colors ${isNewDay ? 'border-t-2 border-t-slate-200' : ''}`}>
                      <td className="p-5 font-bold text-slate-900 text-[16px]">
                        {isNewDay ? days[t.dayOfWeek - 1] : ''}
                      </td>
                      <td className="p-5 text-slate-600 font-semibold bg-slate-50/50">Period {t.periodNumber}</td>
                      <td className="p-5 font-bold text-blue-700 text-[15px]">{t.subjectName}</td>
                      <td className="p-5 text-slate-700 font-medium">{t.faculty.firstName} {t.faculty.lastName}</td>
                      <td className="p-5">
                        <span className="text-slate-600 font-bold bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg text-sm">{t.roomNumber}</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
