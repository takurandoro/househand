import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CalendarDays, MapPin, DollarSign, User, Phone, CheckCircle, Clock } from 'lucide-react';
import { updateTaskStatus } from '@/lib/tasks';
import { handleBid, HandleBidOptions } from '@/lib/tasks/bidding';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Task, TaskWithRelations } from '@/types';

interface ClientProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  phone_number: string;
  location: string;
}

interface TaskWithClient extends Omit<TaskWithRelations, 'client'> {
  client: ClientProfile;
}

interface BidManagementProps {
  taskId?: string;
  taskTitle?: string;
  isClient?: boolean;
  onBidUpdate?: (taskId: string, status: string) => void;
  onCompleteTask?: (taskId: string) => void;
  onWithdrawBid?: (taskId: string) => void;
}

const BidManagement: React.FC<BidManagementProps> = ({ 
  taskId, 
  taskTitle, 
  isClient = false, 
  onBidUpdate, 
  onCompleteTask,
  onWithdrawBid
}) => {
  const [selectedTask, setSelectedTask] = useState<TaskWithClient | null>(null);
  const [showClientDetails, setShowClientDetails] = useState(false);
  const [newBid, setNewBid] = useState({ message: '', proposedPrice: '' });
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch user's bids
  const { data: bids, isLoading } = useQuery({
    queryKey: ['user-bids'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          tasks:task_id (
            *,
            client:profiles!tasks_client_id_fkey (
              id,
              full_name,
              avatar_url,
              phone_number,
              location
            )
          )
        `)
        .eq('helper_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Add mutation for starting a task
  const startTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      return updateTaskStatus({
        taskId,
        newStatus: 'in_progress',
        userId: user.id,
        userType: 'helper'
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task started successfully",
        variant: "success"
      });
      queryClient.invalidateQueries({ queryKey: ['user-bids'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  // Add mutation for completing a task
  const completeTask = useMutation({
    mutationFn: async (taskId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      return updateTaskStatus({
        taskId,
        newStatus: 'completed',
        userId: user.id,
        userType: 'helper'
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task marked as completed",
        variant: "success"
      });
      queryClient.invalidateQueries({ queryKey: ['user-bids'] });
      if (onCompleteTask && taskId) {
        onCompleteTask(taskId);
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  // Add mutation for submitting a bid
  const submitBid = useMutation({
    mutationFn: async ({ taskId, message, proposedPrice }: { taskId: string; message: string; proposedPrice: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      return handleBid({
        taskId,
        helperId: user.id,
        message,
        proposedPrice,
        action: 'submit'
      } as HandleBidOptions);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Bid submitted successfully",
        variant: "success"
      });
      queryClient.invalidateQueries({ queryKey: ['user-bids'] });
      setNewBid({ message: '', proposedPrice: '' });
      setSelectedTask(null);
      if (onBidUpdate) {
        onBidUpdate(taskId, 'submitted');
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    },
  });

  const handleSubmitBid = () => {
    if (!taskId || !newBid.message || !newBid.proposedPrice) {
      toast({
        title: "Error",
        description: "Please fill in all bid details",
        variant: "destructive"
      });
      return;
    }

    submitBid.mutate({
      taskId,
      message: newBid.message,
      proposedPrice: Number(newBid.proposedPrice)
    });
  };

  const getStatusBadge = (status: string, paymentStatus?: boolean) => {
    const statusStyles = {
      submitted: "bg-yellow-100 text-yellow-800",
      accepted: "bg-blue-100 text-blue-800",
      rejected: "bg-red-100 text-red-800",
      completed: paymentStatus ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800",
      in_progress: "bg-purple-100 text-purple-800",
      cancelled: "bg-gray-100 text-gray-800"
    };

    return (
      <Badge className={statusStyles[status] || "bg-gray-100 text-gray-800"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
        {status === 'completed' && !paymentStatus && ' (Unpaid)'}
      </Badge>
    );
  };

  const handleStartTask = (taskId: string) => {
    startTask.mutate(taskId);
  };

  const handleCompleteTask = (taskId: string) => {
    completeTask.mutate(taskId);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading your bids...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">My Bids</h2>
      
      {bids?.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">You haven't submitted any bids yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bids?.map((bid) => (
            <Card key={bid.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{bid.tasks.title}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span className="text-lg" role="img" aria-label="money bag">💰</span>
                        <span>{bid.tasks.min_price} - {bid.tasks.max_price} RWF</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{bid.tasks.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-4 w-4" />
                        <span>{new Date(bid.tasks.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(bid.status, bid.tasks.payment_status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      {getStatusBadge(bid.status, bid.tasks.payment_status)}
                    </div>
                    {bid.status === 'accepted' && bid.tasks.status === 'assigned' && (
                      <Button 
                        variant="default"
                        size="sm"
                        onClick={() => handleStartTask(bid.tasks.id)}
                      >
                        Start Task
                      </Button>
                    )}
                    {bid.tasks.status === 'in_progress' && (
                      <Button 
                        variant="default"
                        size="sm"
                        onClick={() => handleCompleteTask(bid.tasks.id)}
                      >
                        Mark as Complete
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Client Details Dialog */}
      <Dialog open={showClientDetails} onOpenChange={setShowClientDetails}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
          </DialogHeader>
          {selectedTask?.client && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src={selectedTask.client.avatar_url || ''} />
                  <AvatarFallback>{selectedTask.client.full_name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedTask.client.full_name}</h3>
                  <p className="text-sm text-gray-500">{selectedTask.client.location || 'Location not provided'}</p>
                </div>
              </div>
              {selectedTask.client.phone_number && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4" />
                  <span>{selectedTask.client.phone_number}</span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BidManagement;
