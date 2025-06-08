
import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  status: 'active' | 'completed' | 'in-progress' | 'cancelled';
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
  addTask: (taskData: Omit<Task, 'id' | 'bids' | 'createdAt' | 'status'>) => void;
  deleteTask: (taskId: string) => void;
  addBid: (bid: Omit<Bid, 'id' | 'createdAt' | 'status'>) => void;
  acceptBid: (taskId: string, bidId: string) => void;
  markTaskCompleted: (taskId: string) => void;
  addMessage: (message: Omit<Message, 'id' | 'createdAt'>) => void;
  getTasksByClient: (clientId: string) => Task[];
  getAvailableTasks: () => Task[];
  getTaskById: (taskId: string) => Task | undefined;
  getMessagesByTask: (taskId: string) => Message[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task_1',
      title: 'House Cleaning',
      description: 'Deep clean 3-bedroom house, including kitchen and bathrooms',
      location: 'Kigali, Gasabo',
      effort: 'high',
      budget: '8,000 - 12,000',
      date: '2025-06-07',
      clientId: 'client_123',
      clientName: 'John Doe',
      status: 'active',
      bids: [],
      createdAt: new Date()
    },
    {
      id: 'task_2',
      title: 'Dish Washing',
      description: 'Clean dishes after family dinner, approximately 20 items',
      location: 'Kigali, Kicukiro',
      effort: 'low',
      budget: '2,000 - 3,500',
      date: '2025-06-06',
      clientId: 'client_456',
      clientName: 'Jane Smith',
      status: 'active',
      bids: [],
      createdAt: new Date()
    }
  ]);

  const [messages, setMessages] = useState<Message[]>([]);

  const addTask = (taskData: Omit<Task, 'id' | 'bids' | 'createdAt' | 'status'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}`,
      status: 'active',
      bids: [],
      createdAt: new Date()
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const addBid = (bidData: Omit<Bid, 'id' | 'createdAt' | 'status'>) => {
    const newBid: Bid = {
      ...bidData,
      id: `bid_${Date.now()}`,
      status: 'pending',
      createdAt: new Date()
    };

    setTasks(prev => prev.map(task => 
      task.id === bidData.taskId 
        ? { ...task, bids: [...task.bids, newBid] }
        : task
    ));
  };

  const acceptBid = (taskId: string, bidId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            selectedBidId: bidId,
            status: 'in-progress',
            bids: task.bids.map(bid => 
              bid.id === bidId 
                ? { ...bid, status: 'accepted' as const }
                : { ...bid, status: 'rejected' as const }
            )
          }
        : task
    ));
  };

  const markTaskCompleted = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, status: 'completed' as const }
        : task
    ));
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
      getMessagesByTask
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
