import React from 'react';
import { useStore } from '../store/useStore';
import { CheckCircle2, Circle, Clock, Target, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

export function Dashboard() {
  const { tasks, goals, sessions, user } = useStore();
  const today = format(new Date(), 'yyyy-MM-dd');

  const todaysTasks = tasks.filter(t => t.date === today);
  const completedTasks = todaysTasks.filter(t => t.status === 'done').length;
  const totalTasks = todaysTasks.length;
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const todaysStudyTime = sessions
    .filter(s => s.date === today)
    .reduce((acc, curr) => acc + curr.duration, 0);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white">Good morning, {user?.name || 'Student'}!</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1">Here's your study overview for {format(new Date(), 'EEEE, MMMM d')}.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">Today's Focus</p>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{Math.floor(todaysStudyTime / 60)}h {todaysStudyTime % 60}m</p>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">Task Completion</p>
            <h3 className="text-3xl font-bold text-stone-900 dark:text-white">{progressPercentage}%</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">{completedTasks} of {totalTasks} tasks done</p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">Study Time Today</p>
            <h3 className="text-3xl font-bold text-stone-900 dark:text-white">{todaysStudyTime} <span className="text-lg font-medium text-stone-500 dark:text-stone-400">min</span></h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">+15% from yesterday</p>
          </div>
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-stone-500 dark:text-stone-400 mb-1">Active Goals</p>
            <h3 className="text-3xl font-bold text-stone-900 dark:text-white">{goals.length}</h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">On track for success</p>
          </div>
          <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Target className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-stone-900 dark:text-white">Today's Tasks</h2>
            <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300">View all</button>
          </div>
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden">
            {todaysTasks.length === 0 ? (
              <div className="p-8 text-center text-stone-500 dark:text-stone-400">No tasks for today. Enjoy your break!</div>
            ) : (
              <ul className="divide-y divide-stone-100 dark:divide-stone-800">
                {todaysTasks.map((task) => (
                  <li key={task.id} className="p-4 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      {task.status === 'done' ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />
                      ) : (
                        <Circle className="w-6 h-6 text-stone-300 dark:text-stone-600" />
                      )}
                      <div>
                        <p className={`font-medium ${task.status === 'done' ? 'text-stone-400 dark:text-stone-600 line-through' : 'text-stone-900 dark:text-white'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400">
                            {task.subject}
                          </span>
                          <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {task.duration}m
                          </span>
                        </div>
                      </div>
                    </div>
                    {task.status !== 'done' && (
                      <button className="px-3 py-1.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                        Start
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Goals Progress */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-stone-900 dark:text-white">Goals Progress</h2>
          <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm p-6 space-y-6">
            {goals.map((goal) => (
              <div key={goal.id}>
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-stone-900 dark:text-white">{goal.title}</p>
                  <span className="text-sm font-medium text-stone-500 dark:text-stone-400">{goal.progress}%</span>
                </div>
                <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-2.5">
                  <div 
                    className="bg-indigo-600 dark:bg-indigo-500 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 text-right">Target: {format(new Date(goal.targetDate), 'MMM d')}</p>
              </div>
            ))}
            <button className="w-full py-2.5 border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-xl text-sm font-medium text-stone-500 dark:text-stone-400 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Add New Goal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
