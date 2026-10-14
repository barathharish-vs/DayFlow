import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Task, WaterLog, UserProfile, AppScreen } from '../types';

interface AppContextType {
  isAuthenticated: boolean;
  loginDemoSession: (userOverride?: Partial<UserProfile>) => void;
  logoutDemoSession: () => void;
  currentScreen: AppScreen;
  setCurrentScreen: (screen: AppScreen) => void;
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompleted: (id: string) => void;
  waterLogs: WaterLog[];
  todayWaterTotal: number;
  addWaterLog: (amount: number, containerType?: WaterLog['containerType']) => void;
  deleteWaterLog: (id: string) => void;
  resetTodayWater: () => void;
  weeklyWaterData: { day: string; amount: number; goal: number }[];
  notifications: string[];
  clearNotifications: () => void;
  showToast: (message: string) => void;
  toastMessage: string | null;
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

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Review quarterly product design sync',
    description: 'Go over new design tokens and mobile viewport guidelines with the core UX team.',
    category: 'Work',
    priority: 'high',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '11:00',
    completed: true,
    reminder: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Hydration check & 10 min stretch',
    description: 'Drink 300ml of water and stretch back and shoulders.',
    category: 'Health',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '14:00',
    completed: true,
    reminder: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'Finalize DayFlow mobile responsiveness',
    description: 'Ensure bottom navigation bar and card grids scale smoothly on compact phones.',
    category: 'Work',
    priority: 'high',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '16:30',
    completed: false,
    reminder: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Evening 5km jog in the park',
    description: 'Track pace with smartwatch and stay well hydrated.',
    category: 'Fitness',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '18:30',
    completed: false,
    reminder: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    title: 'Read 2 chapters of "Designing Data-Intensive Apps"',
    description: 'Keep notes on distributed consensus and transaction isolation levels.',
    category: 'Personal',
    priority: 'low',
    dueDate: new Date().toISOString().split('T')[0],
    dueTime: '21:00',
    completed: false,
    reminder: false,
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_WATER_LOGS: WaterLog[] = [
  {
    id: 'wl-1',
    amount: 350,
    timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    timeFormatted: '08:30 AM',
    containerType: 'glass',
  },
  {
    id: 'wl-2',
    amount: 500,
    timestamp: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
    timeFormatted: '10:00 AM',
    containerType: 'bottle',
  },
  {
    id: 'wl-3',
    amount: 250,
    timestamp: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
    timeFormatted: '11:45 AM',
    containerType: 'cup',
  },
  {
    id: 'wl-4',
    amount: 400,
    timestamp: new Date().toISOString(),
    timeFormatted: '01:15 PM',
    containerType: 'glass',
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Demo session state persisted in localStorage
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('dayflow_auth') === 'true';
  });

  // Load screen safely: if not authenticated, initial screen is always 'login'
  const [currentScreen, setCurrentScreen] = useState<AppScreen>(() => {
    const isAuth = localStorage.getItem('dayflow_auth') === 'true';
    if (!isAuth) {
      return 'login';
    }
    const savedScreen = localStorage.getItem('dayflow_screen') as AppScreen;
    // If authenticated, valid screens are dashboard, tasks, water, settings
    const validAuthScreens: AppScreen[] = ['dashboard', 'tasks', 'water', 'settings'];
    return validAuthScreens.includes(savedScreen) ? savedScreen : 'dashboard';
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('dayflow_user');
    return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('dayflow_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [waterLogs, setWaterLogs] = useState<WaterLog[]>(() => {
    const saved = localStorage.getItem('dayflow_water_logs');
    return saved ? JSON.parse(saved) : INITIAL_WATER_LOGS;
  });

  const [notifications, setNotifications] = useState<string[]>([
    'Welcome to DayFlow! You completed 2 tasks this morning.',
    'Hydration reminder: Time for a refreshing glass of water 💧',
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync session and screen to LocalStorage
  useEffect(() => {
    localStorage.setItem('dayflow_auth', isAuthenticated ? 'true' : 'false');
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('dayflow_screen', currentScreen);
  }, [currentScreen]);

  const loginDemoSession = (userOverride?: Partial<UserProfile>) => {
    setIsAuthenticated(true);
    localStorage.setItem('dayflow_auth', 'true');
    if (userOverride) {
      setUser((prev) => ({ ...prev, ...userOverride }));
    }
    setCurrentScreen('dashboard');
  };

  const logoutDemoSession = () => {
    setIsAuthenticated(false);
    localStorage.setItem('dayflow_auth', 'false');
    localStorage.removeItem('dayflow_screen');
    setCurrentScreen('login');
  };

  useEffect(() => {
    localStorage.setItem('dayflow_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('dayflow_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('dayflow_water_logs', JSON.stringify(waterLogs));
  }, [waterLogs]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage((prev: string | null) => (prev === message ? null : prev));
    }, 3500);

    // Browser Notification API if enabled
    if (user.notificationsEnabled && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('DayFlow Alert', { body: message, icon: '/vite.svg' });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification('DayFlow Alert', { body: message, icon: '/vite.svg' });
          }
        });
      }
    }
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...updates }));
    showToast('Preferences updated successfully');
  };

  const addTask = (newTaskData: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...newTaskData,
      id: 'task-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
    showToast(`Task "${newTask.title}" created!`);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
    showToast('Task updated');
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('Task deleted');
  };

  const toggleTaskCompleted = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updatedStatus = !t.completed;
          showToast(updatedStatus ? `Completed "${t.title}" 🎉` : `Reopened "${t.title}"`);
          return { ...t, completed: updatedStatus };
        }
        return t;
      })
    );
  };

  const todayWaterTotal = waterLogs.reduce((acc, log) => acc + log.amount, 0);

  const addWaterLog = (amount: number, containerType: WaterLog['containerType'] = 'glass') => {
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newLog: WaterLog = {
      id: 'wl-' + Date.now(),
      amount,
      timestamp: now.toISOString(),
      timeFormatted,
      containerType,
    };
    setWaterLogs((prev) => [newLog, ...prev]);
    showToast(`Logged +${amount} ml of water 💧`);
  };

  const deleteWaterLog = (id: string) => {
    setWaterLogs((prev) => prev.filter((log) => log.id !== id));
    showToast('Water log removed');
  };

  const resetTodayWater = () => {
    setWaterLogs([]);
    showToast("Today's water intake reset");
  };

  // Weekly water history data mockup (combining historical days + today's actual)
  const weeklyWaterData = [
    { day: 'Mon', amount: 2200, goal: user.dailyWaterGoal },
    { day: 'Tue', amount: 2600, goal: user.dailyWaterGoal },
    { day: 'Wed', amount: 1950, goal: user.dailyWaterGoal },
    { day: 'Thu', amount: 2400, goal: user.dailyWaterGoal },
    { day: 'Fri', amount: 2100, goal: user.dailyWaterGoal },
    { day: 'Sat', amount: 2750, goal: user.dailyWaterGoal },
    { day: 'Sun (Today)', amount: todayWaterTotal, goal: user.dailyWaterGoal },
  ];

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
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
