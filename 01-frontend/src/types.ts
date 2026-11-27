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
  completedAt?: string;
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
  waterRemindersEnabled: boolean;
  taskRemindersEnabled: boolean;
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
  | 'water-report'
  | 'task-report'
  | 'settings';

export interface DailyDetail {
  dayOfWeek: string;
  date: string;
  amountMl: number;
  goalMl: number;
  percentageAchieved: number;
  goalMet: boolean;
  logCount: number;
}

export interface WeeklyWaterReportData {
  weekStartDate: string;
  weekEndDate: string;
  totalIntakeMl: number;
  averageDailyIntakeMl: number;
  dailyGoalMl: number;
  daysGoalMet: number;
  bestDayIntakeMl: number;
  bestDayName: string;
  lowestDayIntakeMl: number;
  lowestDayName: string;
  previousWeekTotalMl: number | null;
  weekOverWeekChangePercent: number | null;
  dailyDetails: DailyDetail[];
}

export interface DailyWorkload {
  dayOfWeek: string;
  date: string;
  tasksDue: number;
  tasksCompleted: number;
}

export interface PriorityBreakdown {
  low: number;
  medium: number;
  high: number;
}

export interface TaskItem {
  id: string;
  title: string;
  category: string;
  priority: string;
  dueDate: string;
  dueTime?: string;
  completed: boolean;
  completedAt?: string;
}

export interface WeeklyTaskReportData {
  weekStartDate: string;
  weekEndDate: string;
  totalTasksDue: number;
  tasksCompleted: number;
  tasksPending: number;
  tasksOverdue: number;
  completionRate: number;
  completedOnTime: number;
  completedLate: number;
  previousWeekCompleted: number | null;
  priorityBreakdown: PriorityBreakdown;
  dailyWorkload: DailyWorkload[];
  completedTasks: TaskItem[];
  pendingTasks: TaskItem[];
}
