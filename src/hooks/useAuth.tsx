import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth } from '@/lib/api';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'client' | 'helper';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'client' | 'helper') => Promise<void>;
  signup: (email: string, password: string, name: string, role: 'client' | 'helper') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('househand_token');
    const savedUser = localStorage.getItem('househand_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: 'client' | 'helper') => {
    setIsLoading(true);
    try {
      const { token, data: { user } } = await auth.login(email, password, role);
      setUser(user);
      localStorage.setItem('househand_token', token);
      localStorage.setItem('househand_user', JSON.stringify(user));
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, role: 'client' | 'helper') => {
    setIsLoading(true);
    try {
      const { token, data: { user } } = await auth.signup(email, password, name, role);
      setUser(user);
      localStorage.setItem('househand_token', token);
      localStorage.setItem('househand_user', JSON.stringify(user));
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('househand_token');
    localStorage.removeItem('househand_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
