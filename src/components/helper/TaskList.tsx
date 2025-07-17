
import React from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DollarSign, MapPin, Clock, User, Play, CheckCircle, MessageSquare, Eye } from "lucide-react";
import { TaskWithRelations } from "@/lib/tasks";
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';

interface TaskListProps {
  tasks: TaskWithRelations[];
  userId: string;
  onBidClick: (task: TaskWithRelations) => void;
  onStartTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onWithdrawBid: (taskId: string, bidId: string) => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  userId,
  onBidClick,
  onStartTask,
  onCompleteTask,
  onWithdrawBid
}) => {
  const getStatusBadge = (status: string, paymentStatus?: boolean) => {
    const statusConfig = {
      open: { label: 'Open', variant: 'secondary' as const, color: 'bg-blue-100 text-blue-800' },
      assigned: { label: 'Assigned', variant: 'default' as const, color: 'bg-orange-100 text-orange-800' },
      in_progress: { label: 'In Progress', variant: 'default' as const, color: 'bg-purple-100 text-purple-800' },
      completed: { 
        label: paymentStatus ? 'Paid' : 'Completed', 
        variant: 'default' as const, 
        color: paymentStatus ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800' 
      }
    };
    
    return statusConfig[status] || statusConfig.open;
  };

  const getBidStatusBadge = (bidStatus: string) => {
    const config = {
      submitted: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
      accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800' }
    };
    return config[bidStatus] || config.submitted;
  };

  const getClientInitials = (clientName: string | undefined) => {
    if (!clientName) return 'C';
    return clientName.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="space-y-4">
      {tasks.map((task, idx) => {
        try {
          const userBid = task.bids?.find(bid => bid.helper_id === userId);
          const statusConfig = getStatusBadge(task.status, task.payment_status);
          const totalBids = task.bids?.length || 0;

          // Track call confirmation per task
          const [callConfirmed, setCallConfirmed] = useState<Record<string, boolean>>({});

          // Helper: show call prompt if bid accepted and task assigned
          const showCallPrompt = userBid?.status === 'accepted' && task.status === 'assigned' && !callConfirmed[task.id];

          // Helper: show action buttons only after call confirmed
          const showActionButtons = userBid?.status === 'accepted' && task.status === 'assigned' && callConfirmed[task.id];
          
          // Use a robust key: prefer task.id, fallback to idx
          return (
            <Card key={task.id || idx} className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 hover:border-l-primary">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {task.title}
                      </h3>
                      <Badge className={statusConfig.color}>
                        {statusConfig.label}
                      </Badge>
                      {userBid && (
                        <Badge className={getBidStatusBadge(userBid.status).color}>
                          {getBidStatusBadge(userBid.status).label}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Client Info */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={task.client?.avatar_url} />
                        <AvatarFallback className="text-xs">
                          {getClientInitials(task.client?.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span>by {task.client?.full_name || 'Anonymous Client'}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground line-clamp-2">{task.description}</p>
                  
                  {/* Task Details */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{task.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Replace DollarSign icon with emoji */}
                      <span className="text-lg" role="img" aria-label="money bag">💰</span>
                      <span>{task.budget_min} - {task.budget_max} RWF</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{task.created_at && !isNaN(new Date(task.created_at).getTime())
                        ? formatDistanceToNow(new Date(task.created_at), { addSuffix: true })
                        : 'Unknown time'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <span>{totalBids} bid{totalBids !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* User's Bid Info */}
                  {userBid && (
                    <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Your Bid</span>
                        <Badge variant="outline">{userBid.proposed_price} RWF</Badge>
                      </div>
                      {userBid.message && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          "{userBid.message}"
                        </p>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {task.category}
                      </Badge>
                      {task.hours && (
                        <Badge variant="outline" className="text-xs">
                          {task.hours}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {/* Available Task - Submit Bid */}
                      {!userBid && task.status === 'open' && (
                        <Button 
                          variant="default"
                          size="sm"
                          onClick={() => onBidClick(task)}
                          className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Submit Bid
                        </Button>
                      )}

                      {/* Accepted Bid - Call Prompt */}
                      {showCallPrompt && (
                        <div className="flex items-center gap-3 bg-orange-50 border border-orange-300 rounded-lg px-3 py-2 text-orange-900 shadow-sm mt-2" style={{maxWidth: '100%'}}>
                          <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5 text-orange-500 flex-shrink-0' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 5a2 2 0 012-2h2.28a2 2 0 011.94 1.515l.3 1.2a2 2 0 01-.45 1.95l-.7.7a16.001 16.001 0 006.586 6.586l.7-.7a2 2 0 011.95-.45l1.2.3A2 2 0 0121 18.72V21a2 2 0 01-2 2h-1C7.163 23 1 16.837 1 9V8a2 2 0 012-2z' /></svg>
                          <span className="font-semibold text-sm mr-2">Call client:</span>
                          <a href={`tel:${task.client?.phone_number}`} className="underline text-orange-700 font-bold text-sm mr-3 whitespace-nowrap">{task.client?.phone_number || 'N/A'}</a>
                          <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-3 py-1 rounded ml-auto" style={{minWidth: 'unset'}} onClick={() => setCallConfirmed(prev => ({ ...prev, [task.id]: true }))}>
                            I have called
                          </Button>
                        </div>
                      )}

                      {/* Accepted Bid - Withdraw/Start Task (after call confirmed) */}
                      {showActionButtons && (
                        <>
                          <Button 
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-500 hover:bg-red-50"
                            onClick={() => onWithdrawBid(task.id, userBid.id)}
                          >
                            Withdraw Bid
                          </Button>
                          <Button 
                            variant="default"
                            size="sm"
                            onClick={() => onStartTask(task.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Start Task
                          </Button>
                        </>
                      )}

                      {/* In Progress - Complete Task */}
                      {task.status === 'in_progress' && task.selected_helper_id === userId && (
                        <Button 
                          variant="default"
                          size="sm"
                          onClick={() => onCompleteTask(task.id)}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        } catch (err) {
          console.error('Error rendering task in TaskList:', { task, err });
          return <div className="text-red-500">Error rendering task. Check console for details.</div>;
        }
      })}
    </div>
  );
};
