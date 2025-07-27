import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { TaskCategory } from '@/types/common';
import { useCreateTask } from '@/hooks/data/useTasks';
import { useAuth } from "@/hooks/dashboard/useAuth";

interface CreateTaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}

interface NewTask {
  title: string;
  description: string;
  category: TaskCategory;
  location: string;
  locationInput: {
    area: string;
    district: string;
  };
  min_price: number;
  max_price: number;
  effort_level: string;
  hours: string;
}

// Allowed task categories (from TaskCategory type)
const TASK_CATEGORIES: TaskCategory[] = [
  'cleaning',
  'gardening',
  'moving',
  'home_maintenance',
  'painting',
  'other',
];

const CATEGORY_LABELS: Record<TaskCategory, string> = {
  cleaning: 'Cleaning',
  gardening: 'Gardening',
  moving: 'Moving',
  home_maintenance: 'Home Maintenance',
  painting: 'Painting',
  other: 'Other',
};

export const CreateTaskDialog = ({ isOpen, onClose, onTaskCreated }: CreateTaskDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const createTaskMutation = useCreateTask();
  const [newTask, setNewTask] = useState<NewTask>({
    title: '',
    description: '',
    category: 'other',
    location: '',
    locationInput: {
      area: '',
      district: ''
    },
    min_price: 0,
    max_price: 0,
    effort_level: '',
    hours: ''
  });

  // Add state for tracking if user has manually edited price fields
  const [priceManuallyEdited, setPriceManuallyEdited] = useState({ min: false, max: false });
  const [prevSuggested, setPrevSuggested] = useState({ min: 0, max: 0 });
  const [selectedHours, setSelectedHours] = useState('');

  // Standard hour ranges
  const hourOptions = [
    { value: '1-2 hours', min: 1, max: 2 },
    { value: '2-4 hours', min: 2, max: 4 },
    { value: '4-6 hours', min: 4, max: 6 },
    { value: '6-8 hours', min: 6, max: 8 },
    { value: '8-12 hours', min: 8, max: 12 },
    { value: '12-24 hours', min: 12, max: 24 },
    { value: '24-48 hours', min: 24, max: 48 },
    { value: '48+ hours', min: 48, max: 60 }, // 60 is an arbitrary upper bound for suggestion
  ];

  // Update price suggestion when hours change
  React.useEffect(() => {
    const selected = hourOptions.find(opt => opt.value === selectedHours);
    if (selected) {
      const suggestedMin = selected.min * 2000;
      const suggestedMax = selected.max * 2000;
      setPrevSuggested({ min: suggestedMin, max: suggestedMax });
      setNewTask(prev => ({
        ...prev,
        min_price: (!priceManuallyEdited.min || prev.min_price === prevSuggested.min) ? suggestedMin : prev.min_price,
        max_price: (!priceManuallyEdited.max || prev.max_price === prevSuggested.max) ? suggestedMax : prev.max_price,
        hours: selected.value
      }));
    }
  }, [selectedHours]);

  const handleInputChange = (field: keyof NewTask, value: string | number) => {
    if (field === 'location') {
      return;
    }
    setNewTask(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationChange = (type: 'area' | 'district', value: string) => {
    const updatedLocationInput = {
      ...newTask.locationInput,
      [type]: value
    };
    setNewTask(prev => ({
      ...prev,
      locationInput: updatedLocationInput,
      location: `${updatedLocationInput.area}, ${updatedLocationInput.district}`
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTask.title || !newTask.description || !newTask.location || !user?.id) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        category: newTask.category,
        location: newTask.location,
        min_price: newTask.min_price,
        max_price: newTask.max_price,
        hours: newTask.hours
      };
      
      console.log('Creating task with data:', taskData);
      
      await createTaskMutation.mutateAsync(taskData);

      onTaskCreated();
      onClose();
    } catch (error) {
      // Error handling is done by the mutation
      console.error('Task creation failed:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Post a New Task</DialogTitle>
          <DialogDescription>
            Fill in the details below to post your task.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={newTask.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter task title"
              className="rounded-lg border-gray-300 placeholder-gray-400"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newTask.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your task"
              className="rounded-lg border-gray-300 placeholder-gray-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="area">Area</Label>
              <Input
                id="area"
                value={newTask.locationInput.area}
                onChange={(e) => handleLocationChange('area', e.target.value)}
                placeholder="e.g., Kanombe"
                className="rounded-lg border-gray-300 placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                value={newTask.locationInput.district}
                onChange={(e) => handleLocationChange('district', e.target.value)}
                placeholder="e.g., Kigali"
                className="rounded-lg border-gray-300 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Task Category Dropdown */}
          <div>
            <Label htmlFor="category">Category</Label>
            <Select
              value={newTask.category}
              onValueChange={value => handleInputChange('category', value as TaskCategory)}
            >
              <SelectTrigger className="rounded-lg border-gray-300 placeholder-gray-400">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {TASK_CATEGORIES.map(category => (
                  <SelectItem key={category} value={category}>
                    {CATEGORY_LABELS[category]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="hours">Hours Needed</Label>
            <Select
              value={selectedHours}
              onValueChange={value => {
                setSelectedHours(value);
                setNewTask(prev => ({
                  ...prev,
                  hours: value,
                  effort_level: value // keep effort_level in sync with hours
                }));
              }}
            >
              <SelectTrigger className="rounded-lg border-gray-300 placeholder-gray-400">
                <SelectValue placeholder="Select hours needed" />
              </SelectTrigger>
              <SelectContent>
                {hourOptions.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.value}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedHours && (() => {
              const selected = hourOptions.find(opt => opt.value === selectedHours);
              if (!selected) return null;
              const min = selected.min * 2000;
              const max = selected.max * 2000;
              return (
                <div className="mt-2 text-sm text-orange-700 bg-orange-50 rounded p-2">
                  For hours between {selected.min} and {selected.max}, we suggest that you pay {min}–{max} RWF
                </div>
              );
            })()}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="min_price">Minimum Budget (RWF)</Label>
              <Input
                id="min_price"
                type="number"
                value={newTask.min_price}
                onChange={e => {
                  setNewTask(prev => ({ ...prev, min_price: parseInt(e.target.value) }));
                  setPriceManuallyEdited(pm => ({ ...pm, min: true }));
                }}
                placeholder="0"
                className="rounded-lg border-gray-300 placeholder-gray-400"
              />
            </div>
            <div>
              <Label htmlFor="max_price">Maximum Budget (RWF)</Label>
              <Input
                id="max_price"
                type="number"
                value={newTask.max_price}
                onChange={e => {
                  setNewTask(prev => ({ ...prev, max_price: parseInt(e.target.value) }));
                  setPriceManuallyEdited(pm => ({ ...pm, max: true }));
                }}
                placeholder="0"
                className="rounded-lg border-gray-300 placeholder-gray-400"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={createTaskMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createTaskMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {createTaskMutation.isPending ? 'Posting...' : 'Post Task'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTaskDialog; 