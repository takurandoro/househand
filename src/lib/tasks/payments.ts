
import { supabase } from "@/integrations/supabase/client";
import { createNotification } from '@/api/notifications';
import { loadHelperEarnings } from '@/lib/tasks/earnings';

export const processTaskPayment = async (options: {
  taskId: string;
  clientId: string;
  amount: number;
}) => {
  const { taskId, clientId, amount } = options;

  // Fetch task and bids
  const { data: task, error: taskError } = await supabase
    .from('tasks')
    .select(`*, bids:bids (id, helper_id, proposed_price, status)`)
    .eq('id', taskId)
    .single();

  if (taskError) throw taskError;
  if (!task) throw new Error('Task not found');

  // Verify client ownership
  if (task.client_id !== clientId) {
    throw new Error('Not authorized to process payment for this task');
  }

  // Verify task is completed
  if (task.status !== 'completed') {
    throw new Error('Can only process payment for completed tasks');
  }

  // Verify task is not already paid
  if (task.payment_status) {
    throw new Error('Task has already been paid');
  }

  // Get the accepted bid
  const acceptedBid = task.bids?.find(b => b.status === 'accepted');
  if (!acceptedBid) {
    throw new Error('No accepted bid found for this task');
  }

  // Verify payment amount matches the accepted bid
  if (amount !== acceptedBid.proposed_price) {
    throw new Error('Payment amount must match the accepted bid amount');
  }

  // Process payment using Supabase RPC function
  const { error: transactionError } = await supabase.rpc('process_task_payment', {
    p_task_id: taskId,
    p_helper_id: acceptedBid.helper_id,
    p_amount: amount
  });

  if (transactionError) throw transactionError;

  // Create notification for helper (with client phone number)
  // Fetch client profile to get phone number
  const { data: clientProfile, error: clientError } = await supabase
    .from('profiles')
    .select('phone')
    .eq('id', clientId)
    .single();
  let clientPhone = '';
  if (!clientError && clientProfile && clientProfile.phone) {
    clientPhone = clientProfile.phone;
  }

  await createNotification({
    userId: acceptedBid.helper_id,
    type: 'payment_received',
    title: 'Payment Received',
    message: `Payment for task has been processed successfully.`,
    related_id: taskId,
    metadata: clientPhone ? { clientPhone } : undefined
  });

  // Create notification for client (Payment Sent)
  await createNotification({
    userId: clientId,
    type: 'payment_sent',
    title: 'Payment Sent',
    message: `Your payment has been processed successfully.`,
    related_id: taskId
  });

  // Create notification for client (Payment Received, for consistency)
  await createNotification({
    userId: clientId,
    type: 'payment_received',
    title: 'Payment Received',
    message: `Payment for your task has been processed successfully.`,
    related_id: taskId,
    metadata: clientPhone ? { clientPhone } : undefined
  });

  return { success: true };
};

export const withdrawHelperEarnings = async (helperId: string) => {
  // Get current earnings
  const earnings = await loadHelperEarnings(helperId);
  
  if (earnings.availableForWithdrawal <= 0) {
    throw new Error('No earnings available for withdrawal');
  }

  // Calculate 5% for health insurance
  const healthInsuranceAmount = Math.round(earnings.availableForWithdrawal * 0.05);
  const withdrawnAmount = earnings.availableForWithdrawal - healthInsuranceAmount;

  // Create withdrawal record with health insurance contribution
  const { data: withdrawal, error } = await supabase
    .from('helper_withdrawals')
    .insert({
      helper_id: helperId,
      amount: withdrawnAmount,
      status: 'completed'
    })
    .select()
    .single();

  if (error) throw error;

  // Update helper earnings status to withdrawn
  const { error: updateError } = await supabase
    .from('helper_earnings')
    .update({ status: 'withdrawn' })
    .eq('helper_id', helperId)
    .eq('status', 'paid');

  if (updateError) throw updateError;

  // Create notification
  await supabase.from('notifications').insert({
    user_id: helperId,
    type: 'withdrawal_completed',
    title: 'Withdrawal Processed',
    message: `Your withdrawal of ${withdrawnAmount} RWF has been processed.`,
    withdrawal_id: withdrawal.id
  });

  return {
    withdrawnAmount,
    healthInsuranceAmount: 0
  };
};
