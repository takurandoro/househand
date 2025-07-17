import { supabase } from "@/integrations/supabase/client";

export interface RawHelperEarnings {
  amount: number;
  tasksDone: number;
  paidTasks: number;
  healthInsurance: number;
  availableForWithdrawal: number;
}

export interface WithdrawalResult {
  withdrawnAmount: number;
  healthInsuranceAmount: number;
}

export const loadHelperEarnings = async (helperId: string): Promise<RawHelperEarnings> => {
  // Get total earnings and task counts
  const { data: tasks, error: tasksError } = await supabase
    .from('tasks')
    .select('payment_amount, payment_status')
    .eq('selected_helper_id', helperId)
    .eq('status', 'completed');

  if (tasksError) {
    const errorMsg = tasksError instanceof Error ? tasksError.message : JSON.stringify(tasksError);
    console.error('Error loading tasks:', errorMsg);
    throw tasksError;
  }

  const totalEarnings = tasks.reduce((sum, task) => sum + (task.payment_amount || 0), 0);
  const paidTasks = tasks.filter(task => task.payment_status).length;

  // Get health insurance contribution
  const totalHealthInsurance = 0;

  // Get available balance
  const { data: availableBalance, error: balanceError } = await supabase
    .rpc('get_helper_available_balance', { p_helper_id: helperId });

  if (balanceError) {
    if (balanceError instanceof Error) {
      console.error('Error getting balance:', balanceError.message, balanceError);
    } else {
      console.error('Error getting balance:', JSON.stringify(balanceError), balanceError);
    }
    throw balanceError;
  }

  return {
    amount: totalEarnings,
    tasksDone: tasks.length,
    paidTasks,
    healthInsurance: totalHealthInsurance,
    availableForWithdrawal: availableBalance || 0
  };
};

export const withdrawHelperEarnings = async (helperId: string): Promise<WithdrawalResult> => {
  // Get available balance
  const { data: balance, error: balanceError } = await supabase
    .rpc('get_helper_available_balance', { p_helper_id: helperId });

  if (balanceError) {
    console.error('Error getting balance:', balanceError);
    throw balanceError;
  }

  if (!balance || balance <= 0) {
    throw new Error('No funds available for withdrawal');
  }

  // Withdraw the full available balance
  const withdrawnAmount = balance;

  // Create withdrawal record
  const { error: withdrawalError } = await supabase
    .from('helper_withdrawals')
    .insert({
      helper_id: helperId,
      amount: withdrawnAmount,
      status: 'pending'
    });

  if (withdrawalError) {
    console.error('Error creating withdrawal:', withdrawalError);
    throw withdrawalError;
  }

  return {
    withdrawnAmount,
    healthInsuranceAmount: 0
  };
}; 