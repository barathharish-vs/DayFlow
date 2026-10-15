import type { Task, WaterLog, UserProfile } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const TOKEN_KEY = 'dayflow_token';

export const tokenStorage = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY),
  set: (token: string): void => {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.setItem(TOKEN_KEY, token);
  },
  clear: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  },
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      } else if (errorData.errors) {
        errorMessage = Object.values(errorData.errors).join(', ');
      }
    } catch {
      // Non-JSON response
    }
    throw new Error(errorMessage);
  }

  // Handle empty responses (like 204 or void endpoints)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return {} as T;
}

export const api = {
  // Auth & Profile
  register: (data: { name: string; email: string; password: string }) =>
    request<{ token: string; user: UserProfile }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ token: string; user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getProfile: () => request<UserProfile>('/auth/me'),

  updateProfile: (data: { name?: string; avatarUrl?: string }) =>
    request<UserProfile>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  changeEmail: (data: { newEmail: string; password: string }) =>
    request<{ token: string; user: UserProfile }>('/auth/change-email', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    request<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteAccount: (password: string) =>
    request<{ message: string }>('/auth/delete-account', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  // Tasks
  getTasks: (params?: { completed?: boolean; category?: string; priority?: string; dueDate?: string }) => {
    const query = new URLSearchParams();
    if (params?.completed !== undefined) query.append('completed', String(params.completed));
    if (params?.category) query.append('category', params.category);
    if (params?.priority) query.append('priority', params.priority);
    if (params?.dueDate) query.append('dueDate', params.dueDate);
    const queryString = query.toString() ? `?${query.toString()}` : '';
    return request<Task[]>(`/tasks${queryString}`);
  },

  createTask: (task: Omit<Task, 'id' | 'createdAt'>) =>
    request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task),
    }),

  updateTask: (id: string, updates: Partial<Task>) =>
    request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }),

  toggleTask: (id: string) =>
    request<Task>(`/tasks/${id}/toggle`, {
      method: 'PATCH',
    }),

  deleteTask: (id: string) =>
    request<{ message: string }>(`/tasks/${id}`, {
      method: 'DELETE',
    }),

  // Water Logs
  getWaterLogs: () => request<WaterLog[]>('/water'),

  addWaterLog: (data: { amount: number; containerType?: WaterLog['containerType']; notes?: string }) =>
    request<WaterLog>('/water', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteWaterLog: (id: string) =>
    request<{ message: string }>(`/water/${id}`, {
      method: 'DELETE',
    }),

  resetTodayWater: () =>
    request<{ message: string }>('/water/reset-today', {
      method: 'POST',
    }),

  getWaterSummary: () =>
    request<{
      todayTotal: number;
      dailyGoal: number;
      progressPercentage: number;
      weeklyHistory: { day: string; amount: number; goal: number }[];
    }>('/water/summary'),

  // Settings
  getSettings: () => request<UserProfile>('/settings'),

  updateSettings: (data: Partial<UserProfile>) =>
    request<UserProfile>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
