import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { Bid, BidWithRelations, BidActionOptions, BidStatus } from '@/types';
import * as bidsApi from '@/api/bids';
import { useToast } from '@/hooks/use-toast';

const STALE_TIME = 5 * 60 * 1000; // 5 minutes
const CACHE_TIME = 30 * 60 * 1000; // 30 minutes

export const useBidsByTask = (
  taskId: string,
  queryOptions?: Omit<UseQueryOptions<BidWithRelations[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['bids', taskId],
    queryFn: () => bidsApi.getBidsByTaskId(taskId),
    enabled: !!taskId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: (failureCount, error) => {
      if (error instanceof Error && 
          (error.message.includes('not found') || error.message.includes('forbidden'))) {
        return false;
      }
      return failureCount < 3;
    },
    ...queryOptions,
  });
};

export const useBidsByHelper = (
  helperId: string,
  queryOptions?: Omit<UseQueryOptions<BidWithRelations[], Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery({
    queryKey: ['helper-bids', helperId],
    queryFn: () => bidsApi.getBidsByHelperId(helperId),
    enabled: !!helperId,
    staleTime: STALE_TIME,
    gcTime: CACHE_TIME,
    retry: (failureCount, error) => {
      if (error instanceof Error && 
          (error.message.includes('not found') || error.message.includes('forbidden'))) {
        return false;
      }
      return failureCount < 3;
    },
    ...queryOptions,
  });
};

export const useHandleBid = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: bidsApi.handleBid,
    onMutate: async (variables: BidActionOptions) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['bids', variables.taskId] });
      await queryClient.cancelQueries({ queryKey: ['helper-bids', variables.helperId] });

      // Snapshot the previous values
      const previousTaskBids = queryClient.getQueryData<BidWithRelations[]>(['bids', variables.taskId]);
      const previousHelperBids = queryClient.getQueryData<BidWithRelations[]>(['helper-bids', variables.helperId]);

      // Optimistically update the bid
      const updateBidInList = (bids: BidWithRelations[] | undefined): BidWithRelations[] | undefined => {
        if (!bids) return bids;
        
        const actionStatusMap: Record<BidActionOptions['action'], BidStatus> = {
          'submit': 'submitted',
          'withdraw': 'withdrawn',
          'accept': 'accepted',
          'reject': 'rejected',
        };

        return bids.map(bid => {
          if (bid.id === variables.applicationId) {
            return {
              ...bid,
              status: actionStatusMap[variables.action],
              updated_at: new Date().toISOString(),
            };
          }
          // If accepting this bid, reject all other bids for the task
          if (variables.action === 'accept' && bid.task_id === variables.taskId) {
            return {
              ...bid,
              status: 'rejected',
              updated_at: new Date().toISOString(),
            };
          }
          return bid;
        });
      };

      // Update both task and helper bid lists
      if (previousTaskBids) {
        queryClient.setQueryData(['bids', variables.taskId], updateBidInList(previousTaskBids));
      }
      if (previousHelperBids) {
        queryClient.setQueryData(['helper-bids', variables.helperId], updateBidInList(previousHelperBids));
      }

      return { previousTaskBids, previousHelperBids };
    },
    onSuccess: (_, variables) => {
      const actionMessages = {
        'submit': 'Bid submitted successfully',
        'withdraw': 'Bid withdrawn successfully',
        'accept': 'Bid accepted successfully',
        'reject': 'Bid rejected successfully',
      };

      toast({
        title: 'Success',
        description: actionMessages[variables.action],
      });

      // If bid was accepted, also invalidate task queries as the task status might have changed
      if (variables.action === 'accept') {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['task', variables.taskId] });
      }
    },
    onError: (error, variables, context) => {
      // Revert optimistic updates
      if (context?.previousTaskBids) {
        queryClient.setQueryData(['bids', variables.taskId], context.previousTaskBids);
      }
      if (context?.previousHelperBids) {
        queryClient.setQueryData(['helper-bids', variables.helperId], context.previousHelperBids);
      }

      toast({
        title: 'Error',
        description: error instanceof Error 
          ? error.message 
          : 'Failed to process bid. Please try again.',
        variant: 'destructive',
      });
    },
    onSettled: (_, __, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['bids', variables.taskId] });
      queryClient.invalidateQueries({ queryKey: ['helper-bids', variables.helperId] });
    },
  });
}; 