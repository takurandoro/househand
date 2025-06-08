
import { Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SocialFundDisplay = () => {
  return (
    <Card className="bg-gradient-to-r from-orange-50 via-orange-100 to-gray-100 border-orange-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold bg-gradient-to-r from-orange-700 to-black bg-clip-text text-transparent flex items-center">
          <Check size={20} className="mr-2 text-orange-600" />
          Social Security Fund Contribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-700">
            5% of each completed task automatically contributes to Rwanda's social security fund, 
            helping formalize domestic work and provide benefits to helpers.
          </p>
          <div className="bg-gradient-to-r from-white to-orange-50 rounded-lg p-3 border border-orange-200">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Total Contributions This Month:</span>
              <span className="font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">45,230 RWF</span>
            </div>
            <div className="flex justify-between items-center text-sm mt-1">
              <span className="text-gray-600">Helpers Benefiting:</span>
              <span className="font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">127 people</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SocialFundDisplay;
