
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { TaskWithRelations } from '@/lib/tasks';

interface AnalyticsData {
  totalTasks: number;
  completionRate: number;
  totalSpent: number;
  averageBudget: number;
  tasksByStatus: { status: string; count: number; color: string }[];
  tasksByCategory: { category: string; averageSpent: number; count: number }[];
  monthlyTrends: { month: string; created: number; completed: number }[];
}

export const useClientAnalytics = (userId: string) => {
  return useQuery({
    queryKey: ['client-analytics', userId],
    queryFn: async (): Promise<AnalyticsData> => {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select(`
          *,
          bids!inner(*)
        `)
        .eq('client_id', userId);

      if (error) throw error;

      const tasksData = tasks as TaskWithRelations[];

      // Calculate basic metrics
      const totalTasks = tasksData.length;
      const completedTasks = tasksData.filter(t => t.status === 'completed').length;
      const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
      
      // Handle payment_amount which can be number or null
      const paidTasks = tasksData.filter(t => t.payment_status && t.payment_amount);
      const totalSpent = paidTasks.reduce((sum, t) => {
        const amount = typeof t.payment_amount === 'number' ? t.payment_amount : 0;
        return sum + amount;
      }, 0);
      
      // Use budget_min and budget_max instead of min_price/max_price
      const averageBudget = totalTasks > 0 ? tasksData.reduce((sum, t) => {
        const minBudget = t.budget_min || 0;
        const maxBudget = t.budget_max || 0;
        return sum + ((minBudget + maxBudget) / 2);
      }, 0) / totalTasks : 0;

      // Task status distribution
      const statusCounts = tasksData.reduce((acc, task) => {
        acc[task.status] = (acc[task.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const tasksByStatus = [
        { status: 'Open', count: statusCounts['open'] || 0, color: 'hsl(var(--chart-1))' },
        { status: 'Assigned', count: statusCounts['assigned'] || 0, color: 'hsl(var(--chart-2))' },
        { status: 'In Progress', count: statusCounts['in_progress'] || 0, color: 'hsl(var(--chart-3))' },
        { status: 'Completed', count: statusCounts['completed'] || 0, color: 'hsl(var(--chart-4))' },
      ];

      // Category analysis
      const categoryData = tasksData.reduce((acc, task) => {
        if (!acc[task.category]) {
          acc[task.category] = { totalSpent: 0, count: 0 };
        }
        acc[task.category].count += 1;
        if (task.payment_status && task.payment_amount) {
          const amount = typeof task.payment_amount === 'number' ? task.payment_amount : 0;
          acc[task.category].totalSpent += amount;
        }
        return acc;
      }, {} as Record<string, { totalSpent: number; count: number }>);

      const tasksByCategory = Object.entries(categoryData).map(([category, data]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '),
        averageSpent: data.count > 0 ? data.totalSpent / data.count : 0,
        count: data.count
      }));

      // Monthly trends (last 6 months)
      const monthlyData = tasksData.reduce((acc, task) => {
        const monthKey = new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!acc[monthKey]) {
          acc[monthKey] = { created: 0, completed: 0 };
        }
        acc[monthKey].created += 1;
        if (task.status === 'completed') {
          acc[monthKey].completed += 1;
        }
        return acc;
      }, {} as Record<string, { created: number; completed: number }>);

      const monthlyTrends = Object.entries(monthlyData)
        .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
        .slice(-6)
        .map(([month, data]) => ({ month, ...data }));

      return {
        totalTasks,
        completionRate,
        totalSpent,
        averageBudget,
        tasksByStatus,
        tasksByCategory,
        monthlyTrends
      };
    },
    enabled: !!userId
  });
};
