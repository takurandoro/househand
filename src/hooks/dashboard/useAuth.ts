import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { checkTaskData } from '@/lib/tasks';

type SupabaseUser = Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'];

export interface UserProfile {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  user_type: 'client' | 'helper' | null;
  location: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  email: string | null;
}

export const useAuth = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userType, setUserType] = useState<'client' | 'helper' | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/login');
          return;
        }

        setUser(user);

        // Load user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, phone_number, user_type, email, location, bio, avatar_url, created_at, updated_at')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error loading profile:', profileError);
          toast({
            title: "Error",
            description: "Failed to load profile",
            variant: "destructive"
          });
          return;
        }

        setUserProfile(profile);
        setUserType(profile.user_type);

        // Check task data if user is a helper
        if (profile.user_type === 'helper') {
          try {
            await checkTaskData(user.id);
          } catch (error) {
            console.error('Error checking task data:', error);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        toast({
          title: "Error",
          description: "Failed to initialize authentication",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive"
      });
    }
  };

  return {
    user,
    userProfile,
    userType,
    isLoading,
    handleLogout
  };
}; 