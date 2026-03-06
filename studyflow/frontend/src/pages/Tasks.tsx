import React, { useState } from 'react';
import { useStore, TaskStatus } from '../store/useStore';
import { Plus, MoreVertical, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

export function Tasks() {
  const { tasks, updateTaskStatus, addTask, deleteTask } = useStore();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskSubject, setNewTaskSubject] = useState('');
  const [newTaskDuration, setNewTaskDuration] = useState('30');
  const [isAdding, setIsAdding] = useState(false);

  const columns: { id: TaskStatus; title: string }[] = [
    { id: 'todo', title: 'To Do' },
    { id: 'in-progress', title: 'In Progress' },
    { id: 'done', title: 'Done' },
  ];

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskSubject.trim()) return;
    
    addTask({
      title: newTaskTitle,
      subject: newTaskSubject,
      duration: parseInt(newTaskDuration, 10),
      status: 'todo',
      date: format(new Date(), 'yyyy-MM-dd'),
    });
    
    setNewTaskTitle('');
    setNewTaskSubject('');
    setIsAdding(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 h-full flex flex-col">
      <header className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white">Task Board</h1>
          <p className="text-stone-500 dark:text-stone-400 mt-1">Manage your study sessions and assignments.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </header>

      {isAdding && (
        <div className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm shrink-0">
          <form onSubmit={handleAddTask} className="flex items-end gap-4">
            <div className="flex-1 space-y-1">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Task Title</label>
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                className="w-full rounded-lg border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., Read Chapter 5"
                required
              />
            </div>
            <div className="w-48 space-y-1">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Subject</label>
              <input
                type="text"
                value={newTaskSubject}
                onChange={(e) => setNewTaskSubject(e.target.value)}
                className="w-full rounded-lg border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="e.g., Biology"
                required
              />
            </div>
            <div className="w-32 space-y-1">
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Duration (min)</label>
              <input
                type="number"
                value={newTaskDuration}
                onChange={(e) => setNewTaskDuration(e.target.value)}
                className="w-full rounded-lg border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                min="5"
                step="5"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg font-medium transition-colors border border-stone-200 dark:border-stone-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
        {columns.map((column) => {
          const columnTasks = tasks.filter((t) => t.status === column.id);
          return (
            <div key={column.id} className="bg-stone-100/50 dark:bg-stone-900/50 rounded-2xl p-4 flex flex-col border border-stone-200/50 dark:border-stone-800/50">
              <div className="flex items-center justify-between mb-4 px-2">
                <h2 className="font-bold text-stone-900 dark:text-white">{column.title}</h2>
                <span className="bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 text-xs font-bold px-2.5 py-1 rounded-full">
                  {columnTasks.length}
                </span>
              </div>
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {columnTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white dark:bg-stone-900 p-4 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-shadow group relative"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400">
                        {task.subject}
                      </span>
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="text-stone-400 dark:text-stone-500 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-bold text-stone-900 dark:text-white mb-3">{task.title}</h3>
                    <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {task.duration}m
                        </span>
                        <span className="flex items-center gap-1">
                          <CalendarIcon className="w-3.5 h-3.5" /> {format(new Date(task.date), 'MMM d')}
                        </span>
                      </div>
                    </div>
                    
                    {/* Status Actions */}
                    <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-800 flex gap-2">
                      {column.id !== 'todo' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'todo')}
                          className="flex-1 text-xs font-medium text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 py-1.5 rounded transition-colors"
                        >
                          To Do
                        </button>
                      )}
                      {column.id !== 'in-progress' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'in-progress')}
                          className="flex-1 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 py-1.5 rounded transition-colors"
                        >
                          In Progress
                        </button>
                      )}
                      {column.id !== 'done' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'done')}
                          className="flex-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 py-1.5 rounded transition-colors"
                        >
                          Done
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
