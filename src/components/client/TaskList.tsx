import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { TaskWithRelations } from '@/types/task';
import { TaskListSkeleton } from '@/components/ui/task-skeleton';
import React from 'react';

interface TaskListProps {
  tasks: TaskWithRelations[];
  isLoading?: boolean;
  expandedTaskId?: string | null;
  onTaskExpand?: (taskId: string | null) => void;
  onAcceptBid?: (taskId: string, applicationId: string) => void;
  onRejectBid?: (taskId: string, applicationId: string) => void;
  onPaymentRequest?: (task: TaskWithRelations) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoading = false,
  expandedTaskId,
  onTaskExpand = () => {},
  onAcceptBid = () => {},
  onRejectBid = () => {},
  onPaymentRequest = () => {},
}) => {
  const getCategoryLabel = (category: string) => {
    const categoryLabels: Record<string, string> = {
      'cleaning': 'Cleaning',
      'gardening': 'Gardening',
      'moving': 'Moving',
      'home_maintenance': 'Home Maintenance',
      'painting': 'Painting',
      'other': 'Other'
    };
    return categoryLabels[category] || category;
  };

  // Only show skeleton if loading and no tasks exist
  if (isLoading && tasks.length === 0) {
    console.log('🔄 Showing task skeleton - loading:', isLoading, 'tasks count:', tasks.length);
    return <TaskListSkeleton count={5} />;
  }

  return (
    <div className="space-y-4">
      {tasks.map(task => {
        const pendingBids = task.bids?.filter(b => b.status === 'submitted').length || 0;
        const isCompleted = task.status === 'completed';
        const isPaid = !!task.payment_status;
        return (
          <Card key={task.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{task.title}</h3>
                  <p className="text-gray-600 mt-1">{task.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  {/* Show only payment status badge for completed tasks, otherwise show generic status badge */}
                  {isCompleted ? (
                    isPaid ? (
                      <Badge className="bg-green-100 text-green-800 rounded-full px-3 py-1 text-xs font-medium mt-2" variant="secondary">
                        Completed & Paid
                      </Badge>
                    ) : (
                      <>
                        <Badge className="bg-yellow-50 text-yellow-700 rounded-full px-3 py-1 text-xs font-medium mt-2" variant="secondary">
                          Completed - Payment Pending
                        </Badge>
                        <Button
                          size="sm"
                          className="mt-2 bg-orange-500 hover:bg-orange-600 text-white"
                          onClick={() => onPaymentRequest(task)}
                        >
                          Pay Now
                        </Button>
                      </>
                    )
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800 rounded-full px-3 py-1 text-sm font-medium" variant="secondary">
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm">{task.location}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">{task.hours}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-lg mr-2" role="img" aria-label="money bag">💰</span>
                  <span className="text-sm">{task.min_price} - {task.max_price} RWF</span>
                </div>
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span className="text-sm">{getCategoryLabel(task.category)}</span>
                </div>
              </div>
              {/* View Bids button for active tasks */}
              {['open', 'assigned', 'in_progress'].includes(task.status) && pendingBids > 0 && (
                <Button
                  className="mt-4 bg-gradient-to-r from-orange-500 to-orange-700 text-white shadow-lg hover:from-orange-600 hover:to-orange-800 border-0"
                  onClick={() => onTaskExpand(task.id)}
                >
                  View {pendingBids} Bids
                </Button>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TaskList; 