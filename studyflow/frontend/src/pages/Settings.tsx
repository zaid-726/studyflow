import React from 'react';
import { useStore } from '../store/useStore';
import { Moon, Sun, Settings as SettingsIcon, User } from 'lucide-react';

export function Settings() {
  const { user, theme, setTheme } = useStore();

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-stone-900 dark:text-white flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          Settings
        </h1>
        <p className="text-stone-500 dark:text-stone-400 mt-2">Manage your account preferences and application settings.</p>
      </header>

      <div className="space-y-6">
        {/* Profile Settings */}
        <section className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Name</label>
              <div className="mt-1 p-3 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white">
                {user?.name}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">Email</label>
              <div className="mt-1 p-3 bg-stone-50 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-white">
                {user?.email}
              </div>
            </div>
          </div>
        </section>

        {/* Appearance Settings */}
        <section className="bg-white dark:bg-stone-900 p-6 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
            {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            Appearance
          </h2>
          
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-stone-900 dark:text-white">Dark Mode</h3>
              <p className="text-sm text-stone-500 dark:text-stone-400">Switch between light and dark themes.</p>
            </div>
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                theme === 'dark' ? 'bg-indigo-600' : 'bg-stone-200 dark:bg-stone-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
