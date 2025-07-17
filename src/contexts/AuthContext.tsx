import React, { createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/api/client';
import { ClientProfile, HelperProfile } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  profile: ClientProfile | HelperProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userType: 'client' | 'helper') => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<ClientProfile | HelperProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Query for current user session
  const { data: session } = useQuery({
    queryKey: ['auth', 'session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Query for user profile
  const { data: profile, isLoading } = useQuery({
    queryKey: ['auth', 'profile', session?.user?.id],
    queryFn: async () => {
      if (!session?.user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone_number, user_type, email, location, bio, avatar_url, created_at, updated_at')
        .eq('id', session.user.id)
        .single();

      if (error) throw error;
      return data as ClientProfile | HelperProfile;
    },
    enabled: !!session?.user,
  });

  // Mutation for profile updates
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<ClientProfile | HelperProfile>) => {
      if (!session?.user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', session.user.id);

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'profile', session?.user?.id], (old: any) => ({
        ...old,
        ...data,
      }));
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Sign in mutation
  const signInMutation = useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast({
        title: 'Welcome back!',
        description: 'You have successfully signed in.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Sign In Failed',
        description: error instanceof Error ? error.message : 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    },
  });

  // Sign up mutation
  const signUpMutation = useMutation({
    mutationFn: async ({ email, password, userType }: { email: string; password: string; userType: 'client' | 'helper' }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userType,
          },
        },
      });
      if (error) throw error;

      // Create profile
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            user_type: userType,
            created_at: new Date().toISOString(),
          });
        if (profileError) throw profileError;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      toast({
        title: 'Welcome!',
        description: 'Your account has been created successfully.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Sign Up Failed',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Sign out mutation
  const signOutMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: 'Signed Out',
        description: 'You have been successfully signed out.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to sign out. Please try again.',
        variant: 'destructive',
      });
    },
  });

  // Setup auth subscription
  React.useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        queryClient.invalidateQueries({ queryKey: ['auth'] });
      } else if (event === 'SIGNED_OUT') {
        queryClient.clear();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const value: AuthContextType = {
    user: session?.user ?? null,
    profile: profile ?? null,
    isLoading,
    signIn: async (email, password) => {
      await signInMutation.mutateAsync({ email, password });
    },
    signUp: async (email, password, userType) => {
      await signUpMutation.mutateAsync({ email, password, userType });
    },
    signOut: () => signOutMutation.mutateAsync(),
    updateProfile: async (data) => {
      await updateProfileMutation.mutateAsync(data);
    },
  };

  return (
    <AuthContext.Provider value={value}>
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