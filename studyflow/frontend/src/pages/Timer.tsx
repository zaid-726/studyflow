import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { Play, Pause, RotateCcw, Coffee, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

export function Timer() {
  const { addSession, tasks, updateTaskStatus } = useStore();
  const [mode, setMode] = useState<'study' | 'break'>('study');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeTasks = tasks.filter(t => t.status !== 'done');

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleComplete();
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(mode === 'study' ? 25 * 60 : 5 * 60);
  };

  const switchMode = (newMode: 'study' | 'break') => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(newMode === 'study' ? 25 * 60 : 5 * 60);
  };

  const handleComplete = () => {
    setIsActive(false);
    
    if (mode === 'study') {
      // Log session
      const task = tasks.find(t => t.id === selectedTaskId);
      addSession({
        date: format(new Date(), 'yyyy-MM-dd'),
        duration: 25,
        subject: task ? task.subject : 'General Study',
      });
      
      // Prompt for break
      if (window.confirm('Study session complete! Take a 5-minute break?')) {
        switchMode('break');
      }
    } else {
      if (window.confirm('Break is over! Ready to study?')) {
        switchMode('study');
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = mode === 'study' 
    ? ((25 * 60 - timeLeft) / (25 * 60)) * 100 
    : ((5 * 60 - timeLeft) / (5 * 60)) * 100;

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white">Focus Timer</h1>
        <p className="text-stone-500 dark:text-stone-400">Stay productive with the Pomodoro technique.</p>
      </div>

      <div className="w-full max-w-md bg-white dark:bg-stone-900 p-8 rounded-[2rem] border border-stone-200 dark:border-stone-800 shadow-xl shadow-stone-200/50 dark:shadow-none space-y-8 transition-colors">
        
        {/* Mode Toggle */}
        <div className="flex p-1 bg-stone-100 dark:bg-stone-800 rounded-xl transition-colors">
          <button
            onClick={() => switchMode('study')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'study' ? 'bg-white dark:bg-stone-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Study (25m)
          </button>
          <button
            onClick={() => switchMode('break')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
              mode === 'break' ? 'bg-white dark:bg-stone-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Coffee className="w-4 h-4" />
            Break (5m)
          </button>
        </div>

        {/* Timer Display */}
        <div className="relative flex items-center justify-center py-8">
          <svg className="w-64 h-64 transform -rotate-90">
            <circle
              cx="128"
              cy="128"
              r="120"
              className="stroke-stone-100 dark:stroke-stone-800 transition-colors"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="128"
              cy="128"
              r="120"
              className={mode === 'study' ? 'stroke-indigo-600 dark:stroke-indigo-500' : 'stroke-emerald-500 dark:stroke-emerald-400'}
              strokeWidth="8"
              fill="none"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.2s ease' }}
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="font-mono text-6xl font-bold text-stone-900 dark:text-white tracking-tighter transition-colors">
              {formatTime(timeLeft)}
            </span>
            <span className="text-stone-500 dark:text-stone-400 font-medium mt-2 transition-colors">
              {mode === 'study' ? 'Focus Time' : 'Relax Time'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleTimer}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 active:scale-95 ${
              mode === 'study' ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200 dark:shadow-none' : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 dark:shadow-none'
            }`}
          >
            {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </button>
          <button
            onClick={resetTimer}
            className="w-12 h-12 rounded-full flex items-center justify-center bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Task Selection */}
        {mode === 'study' && (
          <div className="pt-6 border-t border-stone-100 dark:border-stone-800 transition-colors">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">Working on:</label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full rounded-xl border-stone-200 dark:border-stone-700 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-stone-50 dark:bg-stone-800 text-stone-900 dark:text-white py-3 transition-colors"
            >
              <option value="">General Study (No specific task)</option>
              {activeTasks.map(task => (
                <option key={task.id} value={task.id}>
                  {task.title} ({task.subject})
                </option>
              ))}
            </select>
            {selectedTaskId && (
              <button
                onClick={() => {
                  updateTaskStatus(selectedTaskId, 'done');
                  setSelectedTaskId('');
                }}
                className="w-full mt-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-colors"
              >
                Mark Task as Done
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
