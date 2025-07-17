import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Plus, Star, MapPin, Clock, User } from 'lucide-react';
import { CreateTaskDialog } from './CreateTaskDialog';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { TaskReviewDialog } from "./TaskReviewDialog";
import { TaskList } from "./TaskList";
import type { TaskWithRelations } from '@/types/task';

interface UserProfile {
  fullName: string;
  email: string;
  memberSince: string;
  location: string;
  phone: string;
  avatar_url?: string;
}

interface ClientDashboardProps {
  tasks: TaskWithRelations[];
  userProfile: UserProfile;
  expandedTaskId?: string | null;
  onTaskExpand?: (taskId: string | null) => void;
  onPaymentRequest?: (task: TaskWithRelations) => void;
  onAcceptBid?: (taskId: string, applicationId: string) => void;
  onRejectBid?: (taskId: string, applicationId: string) => void;
  userId: string;
  onTaskCreated?: () => void;
  onReviewComplete?: () => void;
}

export const ClientDashboard = ({
  tasks,
  userProfile,
  expandedTaskId,
  onTaskExpand = () => {},
  onPaymentRequest = () => {},
  onAcceptBid = () => {},
  onRejectBid = () => {},
  userId,
  onTaskCreated,
  onReviewComplete
}: ClientDashboardProps) => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const selectedTask = expandedTaskId ? tasks.find(t => t.id === expandedTaskId) : null;

  const activeTasks = tasks.filter(task => ['open', 'assigned', 'in_progress'].includes(task.status));
  const completedTasks = tasks.filter(task => task.status === 'completed');

  const stats = {
    active: activeTasks.length,
    inProgress: activeTasks.filter(t => t.status === 'in_progress').length,
    completed: completedTasks.length,
  };

  const handleTaskCreated = () => {
    setShowNewTaskDialog(false);
    if (typeof onTaskCreated === 'function') {
      onTaskCreated();
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <p className="text-gray-500 mt-1">Manage your tasks and applications</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="border rounded-2xl bg-white p-6">
            <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'active' | 'completed')}>
              <TabsList className="w-full bg-gray-100 p-1 rounded-lg flex mb-4">
                <TabsTrigger value="active" className="flex-1 text-lg py-2 rounded-md transition data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-700">
                  Active Tasks
                </TabsTrigger>
                <TabsTrigger value="completed" className="flex-1 text-lg py-2 rounded-md transition data-[state=active]:bg-orange-500 data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-700">
                  Completed Tasks
                </TabsTrigger>
              </TabsList>
              <TabsContent value="active">
                {activeTasks.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">No active tasks</div>
                ) : (
                  <TaskList
                    tasks={activeTasks}
                    expandedTaskId={expandedTaskId}
                    onTaskExpand={onTaskExpand}
                    onAcceptBid={onAcceptBid}
                    onRejectBid={onRejectBid}
                    onPaymentRequest={onPaymentRequest}
                  />
                )}
              </TabsContent>
              <TabsContent value="completed">
                {completedTasks.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">No completed tasks</div>
                ) : (
                  <TaskList
                    tasks={completedTasks}
                    expandedTaskId={expandedTaskId}
                    onTaskExpand={onTaskExpand}
                    onAcceptBid={onAcceptBid}
                    onRejectBid={onRejectBid}
                    onPaymentRequest={onPaymentRequest}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <div className="space-y-6">
          <Button className="bg-orange-600 hover:bg-orange-700 text-white w-full mb-2" size="lg" onClick={() => setShowNewTaskDialog(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Post New Task
          </Button>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Task Statistics</h3>
              <div className="space-y-1">
                <div className="flex justify-between"><span>Active Tasks</span><span>{stats.active}</span></div>
                <div className="flex justify-between"><span>In Progress</span><span>{stats.inProgress}</span></div>
                <div className="flex justify-between"><span>Completed</span><span>{stats.completed}</span></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Quick Actions</h3>
              <div className="flex flex-col gap-2">
                <Button className="bg-orange-600 hover:bg-orange-700 text-white w-full" onClick={() => setShowNewTaskDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Post New Task
                </Button>
                <Button variant="outline" className="w-full" onClick={() => setShowReviewDialog(true)}>
                  <Star className="h-4 w-4 mr-2" />
                  Leave a Review
                </Button>
              </div>
            </CardContent>
          </Card>
          <CreateTaskDialog
            isOpen={showNewTaskDialog}
            onClose={() => setShowNewTaskDialog(false)}
            onTaskCreated={handleTaskCreated}
          />
          <TaskReviewDialog
            isOpen={showReviewDialog}
            onClose={() => setShowReviewDialog(false)}
            completedTasks={completedTasks as TaskWithRelations[]}
            task={null}
            onReviewComplete={() => {
              setShowReviewDialog(false);
              if (typeof onReviewComplete === 'function') {
                onReviewComplete();
              }
            }}
          />
        </div>
      </div>
      {/* Task Bids Dialog */}
      <Dialog open={!!expandedTaskId} onOpenChange={open => { if (!open) onTaskExpand(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Task Bids</DialogTitle>
            <DialogDescription>
              {selectedTask ? selectedTask.title : ''}
            </DialogDescription>
          </DialogHeader>
          {selectedTask && selectedTask.bids && selectedTask.bids.length > 0 ? (
            <div className="space-y-4">
              {selectedTask.bids.map((bid: any) => (
                <div key={bid.id} className="border rounded-lg p-4 flex items-center gap-4 bg-gray-50">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={bid.helper?.avatar_url} alt={bid.helper?.full_name || 'Helper'} />
                    <AvatarFallback>{(bid.helper?.full_name || 'H').slice(0,2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-semibold">{bid.helper?.full_name || 'Helper'}</div>
                    <div className="text-sm text-gray-600">Price: {bid.proposed_price} RWF</div>
                    <div className="text-sm text-gray-600">Message: {bid.message}</div>
                    <div className="text-xs text-gray-400">Status: {bid.status}</div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => { onAcceptBid(selectedTask.id, bid.id); onTaskExpand(null); }}>
                      Accept
                    </Button>
                    <Button size="sm" variant="outline" className="border-red-500 text-red-500 hover:bg-red-50" onClick={() => onRejectBid(selectedTask.id, bid.id)}>
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500">No bids for this task yet.</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClientDashboard;