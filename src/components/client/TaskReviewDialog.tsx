
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { TaskWithRelations } from '@/lib/tasks';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

interface TaskReviewDialogProps {
  task: TaskWithRelations | null;
  completedTasks?: TaskWithRelations[];
  isOpen: boolean;
  onClose: () => void;
  onReviewComplete: () => void;
}

interface ReviewDetails {
  rating: number;
  comment: string;
  selectedTaskId?: string;
}

export const TaskReviewDialog = ({ 
  task, 
  completedTasks = [], 
  isOpen, 
  onClose, 
  onReviewComplete 
}: TaskReviewDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewDetails, setReviewDetails] = useState<ReviewDetails>({
    rating: 5,
    comment: '',
    selectedTaskId: task?.id || ''
  });

  // Get available tasks for review (completed tasks without reviews)
  const availableTasksForReview = completedTasks.filter(t => 
    t.status === 'completed' && 
    t.payment_status && 
    !t.has_review &&
    t.selected_helper_id
  );

  const selectedTask = task || availableTasksForReview.find(t => t.id === reviewDetails.selectedTaskId);

  const handleSubmit = async () => {
    if (!selectedTask || !selectedTask.selected_helper_id) {
      toast({
        title: "Error",
        description: "Please select a task to review",
        variant: "destructive",
      });
      return;
    }

    if (!reviewDetails.comment.trim()) {
      toast({
        title: "Error", 
        description: "Please provide a comment for your review",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        task_id: selectedTask.id,
        helper_id: selectedTask.selected_helper_id,
        client_id: selectedTask.client_id,
        rating: reviewDetails.rating,
        comment: reviewDetails.comment,
      };
      console.log('Submitting review payload:', payload);
      const { error, data } = await supabase
        .from('helper_reviews')
        .insert(payload);
      console.log('Supabase insert result:', { error, data });
      if (error) throw error;

      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
        variant: "default",
      });

      onReviewComplete();
      onClose();
      
      // Reset form
      setReviewDetails({
        rating: 5,
        comment: '',
        selectedTaskId: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit review",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
          <DialogDescription>
            Rate your experience and provide feedback for the helper
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!task && (
            <div>
              <Label htmlFor="task-select">Select Task</Label>
              <Select
                value={reviewDetails.selectedTaskId}
                onValueChange={(value) => setReviewDetails(prev => ({ ...prev, selectedTaskId: value }))}
                disabled={availableTasksForReview.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a completed task to review" />
                </SelectTrigger>  
                <SelectContent>
                  {availableTasksForReview.length > 0 ? (
                    availableTasksForReview.map((completedTask) => (
                      <SelectItem key={completedTask.id} value={completedTask.id}>
                        {completedTask.title} - {completedTask.helper?.full_name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>No tasks available</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedTask && (
            <>
              <div>
                <h3 className="font-medium">Task</h3>
                <p className="text-sm text-gray-500">{selectedTask.title}</p>
              </div>

              <div>
                <h3 className="font-medium">Helper</h3>
                <p className="text-sm text-gray-500">{selectedTask.helper?.full_name}</p>
              </div>

              <div>
                <Label htmlFor="rating">Rating</Label>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewDetails(prev => ({ ...prev, rating: star }))}
                        className={`text-2xl transition-transform duration-150 focus:outline-none ${
                          star <= reviewDetails.rating ? 'text-orange-500' : 'text-gray-300'
                        } hover:scale-110 active:scale-95`}
                        style={{ cursor: 'pointer' }}
                        aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  <span className="text-sm text-gray-600 min-w-[60px]">{reviewDetails.rating}/5 stars</span>
                </div>
              </div>

              <div>
                <Label htmlFor="comment">Comment</Label>
                <Textarea
                  id="comment"
                  value={reviewDetails.comment}
                  onChange={(e) => setReviewDetails(prev => ({ ...prev, comment: e.target.value }))}
                  placeholder="Share your experience with this helper..."
                  rows={4}
                />
              </div>
            </>
          )}

          {!task && availableTasksForReview.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No completed tasks available for review</p>
              <p className="text-sm text-gray-400 mt-2">
                Only completed and paid tasks can be reviewed
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || (!selectedTask && availableTasksForReview.length === 0)}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
