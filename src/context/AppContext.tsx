import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Task, WaterLog, UserProfile, AppScreen } from '../types';
import { api, tokenStorage } from '../services/api';

interface AppContextType {
  isAuthenticated: boolean;
  loginSession: (email: string, password: string) => Promise<void>;
  registerSession: (name: string, email: string, password: string) => Promise<void>;
  logoutSession: () => void;
  loginDemoSession: (userOverride?: Partial<UserProfile>) => void;
  logoutDemoSession: () => void;
  currentScreen: AppScreen;
  setCurrentScreen: (screen: AppScreen) => void;
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskCompleted: (id: string) => Promise<void>;
  waterLogs: WaterLog[];
  todayWaterTotal: number;
  addWaterLog: (amount: number, containerType?: WaterLog['containerType']) => Promise<void>;
  deleteWaterLog: (id: string) => Promise<void>;
  resetTodayWater: () => Promise<void>;
  weeklyWaterData: { day: string; amount: number; goal: number }[];
  notifications: string[];
  clearNotifications: () => void;
  showToast: (message: string) => void;
  toastMessage: string | null;
  refreshData: () => Promise<void>;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Alex Morgan',
  email: 'alex@dayflow.io',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&h=160&q=80',
  dailyWaterGoal: 2500,
  notificationsEnabled: true,
  waterReminderFrequency: 60,
  theme: 'light',
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return !!tokenStorage.get();
  });

  const [currentScreen, setCurrentScreen] = useState<AppScreen>(() => {
    const hasToken = !!tokenStorage.get();
    if (!hasToken) return 'login';
    const saved = localStorage.getItem('dayflow_screen') as AppScreen;
    const valid: AppScreen[] = ['dashboard', 'tasks', 'water', 'settings'];
    return valid.includes(saved) ? saved : 'dashboard';
  });

  const [user, setUser] = useState<UserProfile>(DEFAULT_PROFILE);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([]);
  const [todayWaterTotal, setTodayWaterTotal] = useState<number>(0);
  const [weeklyWaterData, setWeeklyWaterData] = useState<{ day: string; amount: number; goal: number }[]>([]);
  const [notifications, setNotifications] = useState<string[]>([
    'Welcome to DayFlow! Connect your hydration and focus goals.',
  ]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev) => (prev === message ? null : prev));
    }, 3500);

    if (user.notificationsEnabled && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('DayFlow', { body: message, icon: '/vite.svg' });
      }
    }
  }, [user.notificationsEnabled]);

  const refreshData = useCallback(async () => {
    if (!tokenStorage.get()) return;
    try {
      const [profileData, tasksData, logsData, summaryData] = await Promise.all([
        api.getProfile(),
        api.getTasks(),
        api.getWaterLogs(),
        api.getWaterSummary(),
      ]);

      setUser(profileData);
      setTasks(tasksData);
      setWaterLogs(logsData);
      setTodayWaterTotal(summaryData.todayTotal);
      setWeeklyWaterData(summaryData.weeklyHistory);
    } catch {
      // In case session expired or backend down
    }
  }, []);

  // Fetch initial data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    }
  }, [isAuthenticated, refreshData]);

  // Sync screen to storage
  useEffect(() => {
    localStorage.setItem('dayflow_screen', currentScreen);
  }, [currentScreen]);

  // Hydration interval reminder timer (runs while app is active in browser)
  useEffect(() => {
    if (!isAuthenticated || !user.notificationsEnabled || !user.waterReminderFrequency) return;

    const intervalMs = Math.max(15, user.waterReminderFrequency) * 60 * 1000;
    const timer = setInterval(() => {
      showToast('Hydration check: Time for a refreshing glass of water! 💧');
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isAuthenticated, user.notificationsEnabled, user.waterReminderFrequency, showToast]);

  const loginSession = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    tokenStorage.set(res.token);
    setUser(res.user);
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
    showToast(`Welcome back, ${res.user.name || 'friend'}!`);
    await refreshData();
  };

  const registerSession = async (name: string, email: string, password: string) => {
    const res = await api.register({ name, email, password });
    tokenStorage.set(res.token);
    setUser(res.user);
    setIsAuthenticated(true);
    setCurrentScreen('dashboard');
    showToast(`Account created! Welcome to DayFlow, ${res.user.name}! 🎉`);
    await refreshData();
  };

  const logoutSession = () => {
    tokenStorage.clear();
    localStorage.removeItem('dayflow_token');
    setIsAuthenticated(false);
    setUser(DEFAULT_PROFILE);
    setTasks([]);
    setWaterLogs([]);
    setTodayWaterTotal(0);
    setCurrentScreen('login');
    showToast('Logged out safely.');
  };

  const loginDemoSession = (userOverride?: Partial<UserProfile>) => {
    setIsAuthenticated(true);
    if (userOverride) {
      setUser((prev) => ({ ...prev, ...userOverride }));
    }
    setCurrentScreen('dashboard');
    refreshData();
  };

  const logoutDemoSession = () => {
    logoutSession();
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    try {
      const updated = await api.updateSettings(updates);
      setUser(updated);
      showToast('Preferences updated successfully');
      await refreshData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update preferences');
      throw err;
    }
  };

  const addTask = async (newTaskData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      const created = await api.createTask(newTaskData);
      setTasks((prev) => [created, ...prev]);
      showToast(`Task "${created.title}" created!`);
      await refreshData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to create task');
      throw err;
    }
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    try {
      const updated = await api.updateTask(id, updates);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
      showToast('Task updated');
      await refreshData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  };

  const toggleTaskCompleted = async (id: string) => {
    try {
      const toggled = await api.toggleTask(id);
      setTasks((prev) => prev.map((t) => (t.id === id ? toggled : t)));
      showToast(toggled.completed ? `Completed "${toggled.title}" 🎉` : `Reopened "${toggled.title}"`);
      await refreshData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to toggle task');
      throw err;
    }
  };

  const deleteTask = async (id: string) => {
    try {
      await api.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
      showToast('Task deleted');
      await refreshData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete task');
      throw err;
    }
  };

  const addWaterLog = async (amount: number, containerType: WaterLog['containerType'] = 'glass') => {
    try {
      const created = await api.addWaterLog({ amount, containerType });
      setWaterLogs((prev) => [created, ...prev]);
      showToast(`Logged +${amount} ml of water 💧`);
      await refreshData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to log water');
      throw err;
    }
  };

  const deleteWaterLog = async (id: string) => {
    try {
      await api.deleteWaterLog(id);
      setWaterLogs((prev) => prev.filter((log) => log.id !== id));
      showToast('Water log removed');
      await refreshData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to delete water log');
      throw err;
    }
  };

  const resetTodayWater = async () => {
    try {
      await api.resetTodayWater();
      showToast("Today's water intake reset");
      await refreshData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to reset water');
      throw err;
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        loginSession,
        registerSession,
        logoutSession,
        loginDemoSession,
        logoutDemoSession,
        currentScreen,
        setCurrentScreen,
        user,
        updateUser,
        tasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskCompleted,
        waterLogs,
        todayWaterTotal,
        addWaterLog,
        deleteWaterLog,
        resetTodayWater,
        weeklyWaterData,
        notifications,
        clearNotifications,
        showToast,
        toastMessage,
        refreshData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
