
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Award, Wallet, TrendingUp, Star } from "lucide-react";

interface EarningsDisplayProps {
  earnings: {
    totalEarnings: number;
    taskCount: number;
    healthInsurance: number;
    averageRating: number;
    reviewCount: number;
    availableForWithdrawal: number;
  };
  onWithdraw: () => void;
  onSeeAllReviews?: () => void;
  onShowMedicalCard?: () => void;
}

export const EarningsDisplay: React.FC<EarningsDisplayProps> = ({
  earnings,
  onWithdraw,
  onSeeAllReviews,
  onShowMedicalCard
}) => {
  const availableForWithdrawal = earnings.availableForWithdrawal;
  const healthInsurancePercentage = earnings.totalEarnings > 0 ? (earnings.healthInsurance / earnings.totalEarnings) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Earnings Card */}
      <Card className="bg-gradient-to-br from-green-50 via-white to-green-50 border-green-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-green-700">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-xl" role="img" aria-label="money bag">💰</span>
            </div>
            Total Earnings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-3xl font-bold text-green-600">
              {earnings.totalEarnings.toLocaleString()} RWF
            </div>
            <div className="text-sm text-muted-foreground">
              From {earnings.taskCount} completed tasks
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-green-600 font-medium">
                ~{earnings.taskCount > 0 ? Math.round(earnings.totalEarnings / earnings.taskCount) : 0} RWF per task
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Rating Card */}
      <Card className="bg-gradient-to-br from-yellow-50 via-white to-yellow-50 border-yellow-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-yellow-700">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
            Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="text-3xl font-bold text-yellow-600">
                {earnings.averageRating.toFixed(1)}
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= earnings.averageRating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Based on {earnings.reviewCount} reviews
            </div>
            <Progress 
              value={(earnings.averageRating / 5) * 100} 
              className="h-2"
            />
            {typeof onSeeAllReviews === 'function' && (
              <Button
                className="mt-2 w-full bg-yellow-400 hover:bg-yellow-500 text-yellow-900"
                onClick={onSeeAllReviews}
              >
                See all reviews
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Health Insurance Card */}
      <Card className="bg-gradient-to-br from-blue-50 via-white to-blue-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-blue-700">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Wallet className="w-5 h-5 text-blue-600" />
            </div>
            Health Insurance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-3xl font-bold text-blue-600">
              {earnings.healthInsurance.toLocaleString()} RWF
            </div>
            <div className="text-sm text-muted-foreground">
              {healthInsurancePercentage.toFixed(1)}% of total earnings
            </div>
            <Progress 
              value={healthInsurancePercentage} 
              className="h-2"
            />
            {typeof onShowMedicalCard === 'function' && (
              <Button
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={onShowMedicalCard}
              >
                Show Medical Aid Card
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Withdrawal Card */}
      <Card className="bg-gradient-to-br from-purple-50 via-white to-purple-50 border-purple-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-purple-700">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            Available
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="text-3xl font-bold text-purple-600">
              {availableForWithdrawal.toLocaleString()} RWF
            </div>
            <div className="text-sm text-muted-foreground">
              Ready for withdrawal
            </div>
            <Button
              onClick={onWithdraw}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={availableForWithdrawal <= 0}
            >
              <Wallet className="w-4 h-4 mr-2" />
              Withdraw Earnings
            </Button>
            {availableForWithdrawal <= 0 && (
              <p className="text-xs text-muted-foreground text-center">
                No funds available for withdrawal
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
