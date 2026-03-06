import { create } from 'zustand';
import { addDays, format } from 'date-fns';
import { fetchApi } from '../lib/api';

export type TaskStatus = 'todo' | 'in-progress' | 'done';

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  subject: string;
  duration: number; // in minutes
  status: TaskStatus;
  date: string; // YYYY-MM-DD
  completedAt?: string;
}

export interface Goal {
  id: string;
  title: string;
  targetDate: string;
  progress: number;
}

export interface StudySession {
  id: string;
  date: string;
  duration: number; // minutes studied
  subject: string;
}

interface StoreState {
  user: User | null;
  token: string | null;
  theme: 'light' | 'dark';
  tasks: Task[];
  goals: Goal[];
  sessions: StudySession[];
  
  setUser: (user: User | null, token: string | null) => void;
  logout: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  fetchUser: () => Promise<void>;
  fetchData: () => Promise<void>;
  
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTaskStatus: (id: string, status: TaskStatus) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  addSession: (session: Omit<StudySession, 'id'>) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
}

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

export const useStore = create<StoreState>((set, get) => ({
  user: null,
  token: localStorage.getItem('token'),
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  tasks: [],
  goals: [],
  sessions: [],
  
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  setUser: (user, token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ user, token });
    if (user) {
      get().fetchData();
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, tasks: [], goals: [], sessions: [] });
  },

  fetchUser: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const res = await fetchApi('/api/auth/me', { headers: getHeaders() });
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user });
        get().fetchData();
      } else {
        get().logout();
      }
    } catch (error) {
      console.error('Failed to fetch user', error);
      get().logout();
    }
  },

  fetchData: async () => {
    try {
      const [tasksRes, goalsRes, sessionsRes] = await Promise.all([
        fetchApi('/api/tasks', { headers: getHeaders() }),
        fetchApi('/api/goals', { headers: getHeaders() }),
        fetchApi('/api/sessions', { headers: getHeaders() })
      ]);
      
      if (tasksRes.ok && goalsRes.ok && sessionsRes.ok) {
        const tasks = await tasksRes.json();
        const goals = await goalsRes.json();
        const sessions = await sessionsRes.json();
        set({ tasks, goals, sessions });
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
    }
  },

  addTask: async (task) => {
    try {
      const res = await fetchApi('/api/tasks', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(task)
      });
      if (res.ok) {
        const newTask = await res.json();
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      }
    } catch (error) {
      console.error('Failed to add task', error);
    }
  },

  updateTaskStatus: async (id, status) => {
    const completedAt = status === 'done' ? new Date().toISOString() : undefined;
    try {
      const res = await fetchApi(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status, completedAt })
      });
      if (res.ok) {
        set((state) => ({
          tasks: state.tasks.map((t) => t.id.toString() === id.toString() ? { ...t, status, completedAt } : t)
        }));
      }
    } catch (error) {
      console.error('Failed to update task', error);
    }
  },

  deleteTask: async (id) => {
    try {
      const res = await fetchApi(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.ok) {
        set((state) => ({ tasks: state.tasks.filter((t) => t.id.toString() !== id.toString()) }));
      }
    } catch (error) {
      console.error('Failed to delete task', error);
    }
  },

  addSession: async (session) => {
    try {
      const res = await fetchApi('/api/sessions', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(session)
      });
      if (res.ok) {
        const newSession = await res.json();
        set((state) => ({ sessions: [...state.sessions, newSession] }));
      }
    } catch (error) {
      console.error('Failed to add session', error);
    }
  },

  addGoal: async (goal) => {
    try {
      const res = await fetchApi('/api/goals', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(goal)
      });
      if (res.ok) {
        const newGoal = await res.json();
        set((state) => ({ goals: [...state.goals, newGoal] }));
      }
    } catch (error) {
      console.error('Failed to add goal', error);
    }
  },
}));
