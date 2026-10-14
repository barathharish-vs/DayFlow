export type Priority = 'low' | 'medium' | 'high';
export type TaskCategory = 'Work' | 'Personal' | 'Fitness' | 'Health' | 'Errands';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  completed: boolean;
  reminder: boolean;
  createdAt: string;
}

export interface WaterLog {
  id: string;
  amount: number; // in ml
  timestamp: string; // ISO string
  timeFormatted: string; // "10:30 AM"
  containerType: 'glass' | 'bottle' | 'cup' | 'custom';
}

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string;
  dailyWaterGoal: number; // in ml (e.g., 2500)
  notificationsEnabled: boolean;
  waterReminderFrequency: number; // in minutes (e.g. 60)
  theme: 'light' | 'dark' | 'system';
}

export type AppScreen =
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'dashboard'
  | 'tasks'
  | 'water'
  | 'settings';
