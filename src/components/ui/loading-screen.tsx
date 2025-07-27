import React from 'react';
import { Loader2, User } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  showLogo?: boolean;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading...", 
  showLogo = true 
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-orange-600 flex items-center justify-center">
      <div className="text-center">
        {showLogo && (
          <div className="mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">HouseHand</h1>
            <p className="text-orange-200">Connecting you to trusted helpers</p>
          </div>
        )}
        
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
            <div className="absolute inset-0 w-8 h-8 border-2 border-orange-200 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-white text-lg font-medium">{message}</p>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SimpleLoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
      <div className="text-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
          <p className="text-gray-700 font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}; 