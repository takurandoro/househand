import { useQuery } from '@tanstack/react-query';
import { loadHelperEarnings } from '@/lib/tasks';
import { supabase } from '@/integrations/supabase/client';

interface RawHelperEarnings {
  amount: number;
  tasksDone: number;
  paidTasks: number;
  healthInsurance: number;
  availableForWithdrawal: number;
}

interface TransformedHelperEarnings {
  totalEarnings: number;
  taskCount: number;
  healthInsurance: number;
  averageRating: number;
  reviewCount: number;
  availableForWithdrawal: number;
}

export const useHelperEarnings = (userId: string | undefined, userType: 'client' | 'helper' | null) => {
  const { data: rawEarnings, isLoading } = useQuery<RawHelperEarnings>({
    queryKey: ['helper-earnings', userId],
    queryFn: () => userId ? loadHelperEarnings(userId) : Promise.resolve({ 
      amount: 0,
      tasksDone: 0,
      paidTasks: 0,
      healthInsurance: 0,
      availableForWithdrawal: 0
    }),
    enabled: !!userId && userType === 'helper'
  });

  // Fetch reviews for the helper
  const { data: reviewData } = useQuery({
    queryKey: ['helper-reviews', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('helper_reviews')
        .select('rating')
        .eq('helper_id', userId);
      console.log('Supabase error:', error);
      if (error) return [];
      return data || [];
    },
    enabled: !!userId && userType === 'helper'
  });

  // Debug log for review data
  console.log('Review data for helper:', userId, reviewData);

  // Calculate average rating and review count
  const reviewCount = reviewData?.length || 0;
  const averageRating = reviewCount > 0
    ? (reviewData.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / reviewCount)
    : 0;

  const earnings: TransformedHelperEarnings = {
    totalEarnings: rawEarnings?.amount || 0,
    taskCount: rawEarnings?.tasksDone || 0,
    healthInsurance: rawEarnings?.healthInsurance || 0,
    averageRating,
    reviewCount,
    availableForWithdrawal: rawEarnings?.availableForWithdrawal || 0
  };

  return {
    earnings,
    isLoading
  };
}; 