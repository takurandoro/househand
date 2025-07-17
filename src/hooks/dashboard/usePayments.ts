
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { TaskWithRelations } from '@/lib/tasks';
import { processTaskPayment } from '@/lib/tasks/payments';

export const usePayments = () => {
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [taskToPayFor, setTaskToPayFor] = useState<TaskWithRelations | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const paymentMutation = useMutation({
    mutationFn: async ({ taskId, amount, clientId }: { taskId: string; amount: number; clientId: string }) => {
      return processTaskPayment({ taskId, clientId, amount });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['unpaid-tasks'] });
      toast({
        title: "Success",
        description: "Payment processed successfully",
      });
      setShowPaymentDialog(false);
      setTaskToPayFor(null);
    },
    onError: (error) => {
      console.error('Error processing payment:', error);
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive"
      });
    }
  });

  const handlePaymentRequest = (task: TaskWithRelations) => {
    setTaskToPayFor(task);
    setShowPaymentDialog(true);
  };

  const handlePaymentSubmit = (amount: number, clientId: string) => {
    if (!taskToPayFor) return;
    paymentMutation.mutate({ taskId: taskToPayFor.id, amount, clientId });
  };

  const handlePaymentDialogClose = () => {
    setShowPaymentDialog(false);
    setTaskToPayFor(null);
  };

  return {
    showPaymentDialog,
    taskToPayFor,
    isProcessingPayment: paymentMutation.isPending,
    handlePaymentRequest,
    handlePaymentSubmit,
    handlePaymentDialogClose
  };
}; 
