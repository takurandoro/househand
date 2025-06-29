import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { tasks as tasksApi } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Task {
  id: string;
  title: string;
  description: string;
  location: string;
  effort: string;
  budget: string;
  date: string;
  clientId: string;
  clientName: string;
  status: 'active' | 'in-progress' | 'completed' | 'cancelled';
  bids: Bid[];
  selectedBidId?: string;
  createdAt: Date;
}

export interface Bid {
  id: string;
  taskId: string;
  helperId: string;
  helperName: string;
  price: string;
  timeframe: string;
  message: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

export interface Message {
  id: string;
  taskId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: Date;
}

interface TaskContextType {
  tasks: Task[];
  messages: Message[];
  addTask: (taskData: Omit<Task, 'id' | 'bids' | 'createdAt' | 'status'>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  addBid: (bid: Omit<Bid, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  acceptBid: (taskId: string, bidId: string) => Promise<void>;
  markTaskCompleted: (taskId: string) => Promise<void>;
  addMessage: (message: Omit<Message, 'id' | 'createdAt'>) => void;
  getTasksByClient: (clientId: string) => Task[];
  getAvailableTasks: () => Task[];
  getTaskById: (taskId: string) => Task | undefined;
  getMessagesByTask: (taskId: string) => Message[];
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useAuth();

  // Fetch tasks on mount and when user changes
  useEffect(() => {
    if (user) {
      refreshTasks();
    }
  }, [user]);

  const refreshTasks = async () => {
    try {
      const { data: { tasks: fetchedTasks } } = await tasksApi.getAll();
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to fetch tasks');
    }
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'bids' | 'createdAt' | 'status'>) => {
    try {
      const { data: { task } } = await tasksApi.create(taskData);
      setTasks(prev => [task, ...prev]);
      toast.success('Task posted successfully! Helpers will be notified.');
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Failed to create task');
      throw error;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await tasksApi.delete(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Failed to delete task');
      throw error;
    }
  };

  const addBid = async (bidData: Omit<Bid, 'id' | 'createdAt' | 'status'>) => {
    try {
      const { data: { task } } = await tasksApi.submitBid(bidData.taskId, bidData);
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
      toast.success('Bid submitted successfully');
    } catch (error) {
      console.error('Failed to submit bid:', error);
      toast.error('Failed to submit bid');
      throw error;
    }
  };

  const acceptBid = async (taskId: string, bidId: string) => {
    try {
      const { data: { task } } = await tasksApi.acceptBid(taskId, bidId);
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
      toast.success('Bid accepted! The helper has been notified.');
    } catch (error) {
      console.error('Failed to accept bid:', error);
      toast.error('Failed to accept bid');
      throw error;
    }
  };

  const markTaskCompleted = async (taskId: string) => {
    try {
      const { data: { task } } = await tasksApi.complete(taskId);
      setTasks(prev => prev.map(t => t.id === task.id ? task : t));
      toast.success('Task marked as completed!');
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error('Failed to complete task');
      throw error;
    }
  };

  const addMessage = (messageData: Omit<Message, 'id' | 'createdAt'>) => {
    const newMessage: Message = {
      ...messageData,
      id: `msg_${Date.now()}`,
      createdAt: new Date()
    };
    setMessages(prev => [newMessage, ...prev]);
  };

  const getTasksByClient = (clientId: string) => {
    return tasks.filter(task => task.clientId === clientId);
  };

  const getAvailableTasks = () => {
    return tasks.filter(task => task.status === 'active');
  };

  const getTaskById = (taskId: string) => {
    return tasks.find(task => task.id === taskId);
  };

  const getMessagesByTask = (taskId: string) => {
    return messages.filter(message => message.taskId === taskId);
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      messages,
      addTask,
      deleteTask,
      addBid,
      acceptBid,
      markTaskCompleted,
      addMessage,
      getTasksByClient,
      getAvailableTasks,
      getTaskById,
      getMessagesByTask,
      refreshTasks
    }}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTask = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};
