
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Clock } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface BidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bidData: any) => void;
  task: {
    title: string;
    description: string;
    price: string;
  };
}

const BidModal = ({ isOpen, onClose, onSubmit, task }: BidModalProps) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    price: '',
    timeframe: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    setFormData({
      price: '',
      timeframe: '',
      message: ''
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-black bg-clip-text text-transparent">
            Submit Your Bid
          </DialogTitle>
        </DialogHeader>
        
        <div className="bg-gradient-to-r from-orange-50 to-gray-50 p-4 rounded-lg mb-6 border border-orange-200">
          <h3 className="font-semibold text-lg mb-2">{task.title}</h3>
          <p className="text-gray-600 mb-2">{task.description}</p>
          <p className="text-orange-600 font-semibold">Client's budget: {task.price} RWF</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="price">Your price (RWF)</Label>
            <div className="relative">
              <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500" />
              <Input
                id="price"
                placeholder="Enter your price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="pl-10 border-orange-200 focus:border-orange-500"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="timeframe">How long will it take?</Label>
            <div className="relative">
              <Clock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-500" />
              <Input
                id="timeframe"
                placeholder="e.g., 3 hours, half day"
                value={formData.timeframe}
                onChange={(e) => setFormData({ ...formData, timeframe: e.target.value })}
                className="pl-10 border-orange-200 focus:border-orange-500"
                required
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="message">Message to client</Label>
            <Textarea
              id="message"
              placeholder="Explain your experience and approach to this task..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              rows={4}
              className="border-orange-200 focus:border-orange-500"
            />
          </div>
          
          <div className="flex space-x-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-orange-200">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800">
              Submit Bid
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BidModal;
