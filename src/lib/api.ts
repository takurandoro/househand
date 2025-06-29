import axios from 'axios';
import type { Task, Bid } from '@/contexts/TaskContext';

interface ApiResponse<T> {
  status: string;
  data: T;
  token?: string;
}

interface UserResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: 'client' | 'helper';
  };
}

interface TaskResponse {
  task: Task;
}

interface TasksResponse {
  tasks: Task[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('househand_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const auth = {
  login: async (email: string, password: string, role: 'client' | 'helper') => {
    const response = await api.post<ApiResponse<UserResponse>>('/auth/login', { email, password, role });
    return response.data;
  },
  signup: async (email: string, password: string, name: string, role: 'client' | 'helper') => {
    const response = await api.post<ApiResponse<UserResponse>>('/auth/signup', { email, password, name, role });
    return response.data;
  }
};

// Tasks API
export const tasks = {
  create: async (taskData: Partial<Task>) => {
    const response = await api.post<ApiResponse<TaskResponse>>('/tasks', taskData);
    return response.data;
  },
  getAll: async (filters?: Record<string, unknown>) => {
    const response = await api.get<ApiResponse<TasksResponse>>('/tasks', { params: filters });
    return response.data;
  },
  getById: async (taskId: string) => {
    const response = await api.get<ApiResponse<TaskResponse>>(`/tasks/${taskId}`);
    return response.data;
  },
  delete: async (taskId: string) => {
    const response = await api.delete<ApiResponse<void>>(`/tasks/${taskId}`);
    return response.data;
  },
  submitBid: async (taskId: string, bidData: Partial<Bid>) => {
    const response = await api.post<ApiResponse<TaskResponse>>(`/tasks/${taskId}/bid`, bidData);
    return response.data;
  },
  acceptBid: async (taskId: string, bidId: string) => {
    const response = await api.patch<ApiResponse<TaskResponse>>(`/tasks/${taskId}/accept-bid/${bidId}`);
    return response.data;
  },
  complete: async (taskId: string) => {
    const response = await api.patch<ApiResponse<TaskResponse>>(`/tasks/${taskId}/complete`);
    return response.data;
  }
};

export default api; 