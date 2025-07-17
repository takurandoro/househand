import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface WithdrawalDialogProps {
  isOpen: boolean;
  isWithdrawing: boolean;
  onClose: () => void;
  onConfirm: (mobileNumber: string, bankAccount: string) => void;
  earnings: {
    availableForWithdrawal: number;
  };
}

export const WithdrawalDialog: React.FC<WithdrawalDialogProps> = ({
  isOpen,
  isWithdrawing,
  onClose,
  onConfirm,
  earnings
}) => {
  const [paymentMethod, setPaymentMethod] = React.useState<'mobile' | 'bank'>('mobile');
  const [mobileNumber, setMobileNumber] = React.useState("");
  const [bankAccount, setBankAccount] = React.useState("");

  const isReady =
    (paymentMethod === 'mobile' && mobileNumber.trim().length > 0) ||
    (paymentMethod === 'bank' && bankAccount.trim().length > 0);

  const availableForWithdrawal = earnings.availableForWithdrawal;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw Earnings</DialogTitle>
          <DialogDescription>
            Please choose your preferred withdrawal method and provide the required details.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex justify-between items-center">
            <span>Available for withdrawal:</span>
            <span className="font-semibold">{availableForWithdrawal} RWF</span>
          </div>
          <div className="space-y-2">
            <Label>Withdrawal Method</Label>
            <RadioGroup value={paymentMethod} onValueChange={val => setPaymentMethod(val as 'mobile' | 'bank')} className="flex gap-4">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="mobile" id="mobile" />
                <Label htmlFor="mobile">Mobile Money</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="bank" id="bank" />
                <Label htmlFor="bank">Bank Account</Label>
              </div>
            </RadioGroup>
          </div>
          {paymentMethod === 'mobile' && (
            <div className="space-y-2">
              <Label htmlFor="mobileNumber">Mobile Number</Label>
              <Input
                id="mobileNumber"
                type="tel"
                placeholder="Enter your mobile number"
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value)}
              />
            </div>
          )}
          {paymentMethod === 'bank' && (
            <div className="space-y-2">
              <Label htmlFor="bankAccount">Bank Account</Label>
              <Input
                id="bankAccount"
                type="text"
                placeholder="Enter your bank account"
                value={bankAccount}
                onChange={e => setBankAccount(e.target.value)}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isWithdrawing}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(mobileNumber, bankAccount)}
            disabled={isWithdrawing || !isReady}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isWithdrawing ? 'Processing...' : 'Confirm Withdrawal'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 