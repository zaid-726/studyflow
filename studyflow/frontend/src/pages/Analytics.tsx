import React from 'react';
import { useStore } from '../store/useStore';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { TrendingUp, Clock, Target, Award } from 'lucide-react';

export function Analytics() {
  const { sessions, tasks, goals } = useStore();

  // Generate last 7 days data
  const last7Days = eachDayOfInterval({
    start: subDays(new Date(), 6),
    end: new Date()
  }).map(date => format(date, 'yyyy-MM-dd'));

  const studyData = last7Days.map(date => {
    const daySessions = sessions.filter(s => s.date === date);
    const totalDuration = daySessions.reduce((acc, curr) => acc + curr.duration, 0);
    return {
      date: format(new Date(date), 'EEE'), // Mon, Tue, etc.
      minutes: totalDuration
    };
  });

  const subjectData = sessions.reduce((acc, session) => {
    const existing = acc.find(item => item.subject === session.subject);
    if (existing) {
      existing.minutes += session.duration;
    } else {
      acc.push({ subject: session.subject, minutes: session.duration });
    }
    return acc;
  }, [] as { subject: string, minutes: number }[]);

  const totalStudyTime = sessions.reduce((acc, curr) => acc + curr.duration, 0);
  const totalTasksCompleted = tasks.filter(t => t.status === 'done').length;
  const averageDaily = Math.round(totalStudyTime / 7);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white">Analytics & Progress</h1>
        <p className="text-stone-500 dark:text-stone-400 mt-1">Track your study habits and goal completion.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12%
            </span>
          </div>
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Total Study Time</p>
          <h3 className="text-2xl font-bold text-stone-900 dark:text-white mt-1">{Math.floor(totalStudyTime / 60)}h {totalStudyTime % 60}m</h3>
        </div>

        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Tasks Completed</p>
          <h3 className="text-2xl font-bold text-stone-900 dark:text-white mt-1">{totalTasksCompleted}</h3>
        </div>

        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Daily Average</p>
          <h3 className="text-2xl font-bold text-stone-900 dark:text-white mt-1">{averageDaily} min</h3>
        </div>

        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Current Streak</p>
          <h3 className="text-2xl font-bold text-stone-900 dark:text-white mt-1">4 Days</h3>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-stone-900 dark:text-white">Study Time (Last 7 Days)</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e5e5" className="dark:stroke-stone-800" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(120, 113, 108, 0.1)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--color-stone-900)', color: 'white' }}
                />
                <Bar dataKey="minutes" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-stone-900 dark:text-white">Time by Subject</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectData} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e5e5" className="dark:stroke-stone-800" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 12 }} />
                <YAxis dataKey="subject" type="category" axisLine={false} tickLine={false} tick={{ fill: '#78716c', fontSize: 12, fontWeight: 500 }} />
                <Tooltip 
                  cursor={{ fill: 'rgba(120, 113, 108, 0.1)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'var(--color-stone-900)', color: 'white' }}
                />
                <Bar dataKey="minutes" fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
