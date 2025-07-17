import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TaskWithRelations } from "@/lib/tasks";
import { useToast } from "@/hooks/use-toast";

interface BidDialogProps {
  isOpen: boolean;
  task: TaskWithRelations | null;
  onClose: () => void;
  onSubmit: (taskId: string, message: string, price: number) => void;
}

export const BidDialog: React.FC<BidDialogProps> = ({
  isOpen,
  task,
  onClose,
  onSubmit
}) => {
  const [bidDetails, setBidDetails] = useState({
    message: '',
    price: ''
  });

  const { toast } = useToast();

  const handleSubmit = () => {
    if (!task) return;

    const price = parseInt(bidDetails.price);
    if (!bidDetails.message.trim() || !price || price <= 0) {
      toast({
        title: "Invalid bid",
        description: "Please provide both a message and a valid price",
        variant: "destructive"
      });
      return;
    }

    if (price < task.budget_min || price > task.budget_max) {
      toast({
        title: "Invalid price",
        description: `Price must be between ${task.budget_min} and ${task.budget_max} RWF`,
        variant: "destructive"
      });
      return;
    }

    onSubmit(task.id, bidDetails.message.trim(), price);
    setBidDetails({ message: '', price: '' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Submit Bid</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Message</Label>
            <Textarea
              value={bidDetails.message}
              onChange={(e) => setBidDetails(prev => ({ ...prev, message: e.target.value }))}
              placeholder="Explain why you're the best person for this task..."
            />
          </div>
          <div>
            <Label>Price (RWF)</Label>
            <Input
              type="number"
              value={bidDetails.price}
              onChange={(e) => setBidDetails(prev => ({ ...prev, price: e.target.value }))}
              placeholder="Enter your price..."
            />
            {task && (
              <p className="text-sm text-gray-500 mt-1">
                Budget range: {task.budget_min} - {task.budget_max} RWF
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600 text-white">
            Submit Bid
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 