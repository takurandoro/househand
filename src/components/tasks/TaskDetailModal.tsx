
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, DollarSign, User, MessageCircle, Trash2, CheckCircle } from 'lucide-react';
import { Task, Bid, useTask } from '@/contexts/TaskContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface TaskDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task;
}

const TaskDetailModal = ({ isOpen, onClose, task }: TaskDetailModalProps) => {
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'bids' | 'messages'>('bids');
  const { acceptBid, markTaskCompleted, addMessage, deleteTask, getMessagesByTask } = useTask();
  const { user } = useAuth();
  const messages = getMessagesByTask(task.id);

  const handleAcceptBid = (bidId: string) => {
    acceptBid(task.id, bidId);
    toast.success('Bid accepted! The helper has been notified.');
  };

  const handleCompleteTask = () => {
    markTaskCompleted(task.id);
    toast.success('Task marked as completed!');
    onClose();
  };

  const handleDeleteTask = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      deleteTask(task.id);
      toast.success('Task deleted successfully');
      onClose();
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !user) return;
    
    addMessage({
      taskId: task.id,
      senderId: user.id,
      senderName: user.name,
      content: newMessage.trim()
    });
    setNewMessage('');
    toast.success('Message sent!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isClientOwner = user?.id === task.clientId;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-black bg-clip-text text-transparent">
                {task.title}
              </DialogTitle>
              <Badge className={`mt-2 ${getStatusColor(task.status)}`}>
                {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
              </Badge>
            </div>
            {isClientOwner && (
              <div className="flex space-x-2">
                {task.status === 'in-progress' && (
                  <Button onClick={handleCompleteTask} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle size={16} className="mr-2" />
                    Mark Complete
                  </Button>
                )}
                <Button onClick={handleDeleteTask} variant="destructive" size="sm">
                  <Trash2 size={16} className="mr-2" />
                  Delete
                </Button>
              </div>
            )}
          </div>
        </DialogHeader>

        {/* Task Details */}
        <div className="bg-gradient-to-r from-orange-50 to-gray-50 p-4 rounded-lg border border-orange-200">
          <p className="text-gray-700 mb-4">{task.description}</p>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <MapPin size={16} className="mr-2 text-orange-500" />
              {task.location}
            </div>
            <div className="flex items-center">
              <DollarSign size={16} className="mr-2 text-orange-500" />
              {task.budget} RWF
            </div>
            <div className="flex items-center">
              <Clock size={16} className="mr-2 text-orange-500" />
              {task.date}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 border-b">
          <button
            onClick={() => setActiveTab('bids')}
            className={`pb-2 px-1 ${activeTab === 'bids' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500'}`}
          >
            Bids ({task.bids.length})
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`pb-2 px-1 ${activeTab === 'messages' ? 'border-b-2 border-orange-500 text-orange-600' : 'text-gray-500'}`}
          >
            Messages ({messages.length})
          </button>
        </div>

        {/* Bids Tab */}
        {activeTab === 'bids' && (
          <div className="space-y-4">
            {task.bids.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bids yet</p>
            ) : (
              task.bids.map((bid) => (
                <Card key={bid.id} className={`border ${bid.status === 'accepted' ? 'border-green-300 bg-green-50' : 'border-gray-200'}`}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <User size={16} className="mr-2 text-orange-500" />
                          <span className="font-semibold">{bid.helperName}</span>
                          <Badge className={`ml-2 ${bid.status === 'accepted' ? 'bg-green-100 text-green-800' : bid.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {bid.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{bid.message}</p>
                        <div className="flex space-x-4 text-sm text-gray-500">
                          <span>Price: {bid.price} RWF</span>
                          <span>Time: {bid.timeframe}</span>
                        </div>
                      </div>
                      {isClientOwner && bid.status === 'pending' && task.status === 'active' && (
                        <Button 
                          onClick={() => handleAcceptBid(bid.id)}
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          Accept Bid
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-4">
            <div className="max-h-60 overflow-y-auto space-y-3">
              {messages.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No messages yet</p>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`p-3 rounded-lg ${message.senderId === user?.id ? 'bg-orange-100 ml-8' : 'bg-gray-100 mr-8'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-sm">{message.senderName}</span>
                      <span className="text-xs text-gray-500">{message.createdAt.toLocaleTimeString()}</span>
                    </div>
                    <p className="text-gray-700">{message.content}</p>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex space-x-2">
              <Textarea
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1"
                rows={2}
              />
              <Button onClick={handleSendMessage} className="bg-orange-500 hover:bg-orange-600">
                <MessageCircle size={16} className="mr-2" />
                Send
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default TaskDetailModal;
