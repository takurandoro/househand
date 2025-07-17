import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from './useAuth';

export const useClientDetails = () => {
  const [showClientDetailsDialog, setShowClientDetailsDialog] = useState(false);
  const [selectedClient, setSelectedClient] = useState<UserProfile | null>(null);
  const [isLoadingClientDetails, setIsLoadingClientDetails] = useState(false);

  const { toast } = useToast();

  const handleViewClientDetails = async (clientId: string) => {
    setIsLoadingClientDetails(true);
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id, full_name, phone_number, user_type, email, location, bio, avatar_url, created_at, updated_at')
        .eq('id', clientId)
        .single();

      if (error) {
        throw error;
      }

      setSelectedClient(profile);
      setShowClientDetailsDialog(true);
    } catch (error) {
      console.error('Error loading client details:', error);
      toast({
        title: "Error",
        description: "Failed to load client details",
        variant: "destructive"
      });
    } finally {
      setIsLoadingClientDetails(false);
    }
  };

  const handleClientDetailsDialogClose = () => {
    setShowClientDetailsDialog(false);
    setSelectedClient(null);
  };

  return {
    showClientDetailsDialog,
    selectedClient,
    isLoadingClientDetails,
    handleViewClientDetails,
    handleClientDetailsDialogClose
  };
}; 