import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import { TaskWithRelations } from '@/lib/tasks';
import { processTaskPayment } from '@/lib/tasks/payments';
import { formatCurrency } from "@/lib/utils";

interface TaskPaymentDialogProps {
  task: TaskWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
  onPaymentComplete: () => void;
}

// Add Flutterwave script if not already present
const useFlutterwaveScript = () => {
  useEffect(() => {
    if (!document.getElementById('flutterwave-sdk')) {
      const script = document.createElement('script');
      script.id = 'flutterwave-sdk';
      script.src = 'https://checkout.flutterwave.com/v3.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);
};

// Add TypeScript declaration for FlutterwaveCheckout
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare global {
  interface Window {
    FlutterwaveCheckout?: any;
  }
}

export const TaskPaymentDialog = ({ task, isOpen, onClose, onPaymentComplete }: TaskPaymentDialogProps) => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFlutterwaveReady, setIsFlutterwaveReady] = useState(false);
  useFlutterwaveScript();

  // Track when Flutterwave script is loaded
  useEffect(() => {
    const checkScript = () => {
      if (window.FlutterwaveCheckout) {
        setIsFlutterwaveReady(true);
      } else {
        setTimeout(checkScript, 200);
      }
    };
    checkScript();
  }, []);

  // Robustly determine the agreed amount for payment
  const acceptedBid = task?.bids?.find?.((b: any) => b.status === 'accepted');
  const agreedAmount =
    (task?.agreed_amount && task.agreed_amount > 0)
      ? task.agreed_amount
      : (acceptedBid?.proposed_price && acceptedBid.proposed_price > 0)
        ? acceptedBid.proposed_price
        : (typeof task?.payment_amount === 'number' && task.payment_amount > 0)
          ? task.payment_amount
          : 0;
  const healthInsurance = Math.round(agreedAmount * 0.05);
  const totalToPay = agreedAmount + healthInsurance;

  const handleFlutterwavePayment = () => {
    console.log('Complete Payment button clicked');
    if (!task) {
      console.log('No task provided, aborting payment.');
      return;
    }
    if (!window.FlutterwaveCheckout) {
      console.error('Flutterwave SDK not loaded. window.FlutterwaveCheckout is undefined.');
      toast({
        title: 'Payment Error',
        description: 'Flutterwave SDK not loaded. Please try again.',
        variant: 'destructive',
      });
      return;
    }
    console.log('Calling window.FlutterwaveCheckout with:', {
      public_key: 'FLWPUBK_TEST-51b273b12cb327f13adad312719d8489-X',
      tx_ref: `task-${task.id}-${Date.now()}`,
      amount: totalToPay,
      taskId: task.id,
    });
    window.FlutterwaveCheckout({
      public_key: 'FLWPUBK_TEST-51b273b12cb327f13adad312719d8489-X',
      tx_ref: `task-${task.id}-${Date.now()}`,
      amount: totalToPay,
      currency: 'RWF',
      payment_options: 'card, mobilemoneyrwanda, banktransfer',
      customer: {
        email: (task.client && (task.client as any).email) || 'user@example.com',
        name: task.client?.full_name || 'Client',
        phone_number: (task.client && (task.client as any).phone_number) || '',
      },
      customizations: {
        title: 'HouseHand Task Payment',
        description: `Payment for task: ${task.title}`,
        logo: 'https://yourdomain.com/logo.png', // Optional: add your logo URL
      },
      meta: {
        task_id: task.id,
        helper_id: task.selected_helper_id,
        task_title: task.title,
        health_insurance: healthInsurance,
        agreed_amount: agreedAmount,
      },
      callback: async (response: any) => {
        console.log('Flutterwave response:', response);
        if (response.status === 'successful') {
          setIsProcessing(true);
          try {
            await processTaskPayment({
              taskId: task.id,
              clientId: task.client_id,
              amount: agreedAmount, // Only the agreed amount goes to the helper
            });
            toast({
              title: 'Payment Successful',
              description: 'Task payment has been processed successfully',
              variant: 'success',
            });
            onPaymentComplete();
            onClose();
          } catch (error) {
            toast({
              title: 'Payment Failed',
              description: error instanceof Error ? error.message : 'Failed to process payment',
              variant: 'destructive',
            });
          } finally {
            setIsProcessing(false);
          }
        } else {
          toast({
            title: 'Payment Failed',
            description: `Payment was not successful: ${response.status || 'Unknown error'}`,
            variant: 'destructive',
          });
        }
      },
      onclose: () => {
        console.log('Flutterwave modal closed');
      },
    });
  };

  if (!task) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideCloseButton>
        <DialogHeader>
          <DialogTitle>Process Payment</DialogTitle>
          <DialogDescription>
            Please confirm the payment for the completed task
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Task Details</h3>
            <p className="text-sm text-gray-500">{task.title}</p>
          </div>

          <div>
            <h3 className="font-medium">Helper</h3>
            <p className="text-sm text-gray-500">{task.helper?.full_name}</p>
          </div>

          <div>
            <h3 className="font-medium">Task Price</h3>
            <p className="text-lg font-bold">{formatCurrency(agreedAmount)}</p>
          </div>

          <div>
            <h3 className="font-medium">Health Insurance (5%)</h3>
            <p className="text-lg font-bold text-blue-600">{formatCurrency(healthInsurance)}</p>
          </div>

          <div>
            <h3 className="font-medium">Total to Pay</h3>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalToPay)}</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleFlutterwavePayment}
            disabled={isProcessing || !isFlutterwaveReady}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isProcessing ? 'Processing...' : 'Complete Payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 