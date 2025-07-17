
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { User, ArrowLeft } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const { t } = useTranslation();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        let errorMessage = error.message;
        
        // Provide more user-friendly error messages
        if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email and click the confirmation link before signing in.';
        } else if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        }
        
        toast({
          title: "Login Error",
          description: errorMessage,
          variant: "destructive"
        });
        return;
      }

      if (data.user && data.session) {
        // Get user type from user metadata or default to client
        const userType = data.user.user_metadata?.user_type || 'client';
        localStorage.setItem('userType', userType);
        
        toast({
          title: t('auth.welcomeBackToast'),
          description: t('auth.successfullyLoggedIn'),
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-black via-gray-900 to-orange-600 text-white px-4 py-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => navigate('/')}
              variant="ghost" 
              className="text-white hover:bg-white/20 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">HouseHand</span>
          </div>
        </div>
      </header>

      {/* Login Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="bg-white shadow-2xl border-orange-200">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-3xl bg-gradient-to-r from-black to-orange-600 bg-clip-text text-transparent">
                  {t('auth.welcomeBack')}
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  {t('auth.signInToAccount')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">{t('auth.email')}</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                      className="border-orange-200 focus:border-orange-500 py-3"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">{t('auth.password')}</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder={t('auth.createPassword')}
                      value={loginData.password}
                      onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                      className="border-orange-200 focus:border-orange-500 py-3"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-black to-orange-600 hover:from-gray-900 hover:to-orange-700 text-white py-3 text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : t('auth.signIn')}
                  </Button>
                  <p className="text-center text-sm text-gray-600">
                    {t('auth.dontHaveAccount')}{' '}
                    <button
                      type="button"
                      onClick={() => navigate('/signup')}
                      className="text-orange-600 hover:text-orange-700 font-medium"
                      disabled={isLoading}
                    >
                      {t('auth.signUpHere')}
                    </button>
                  </p>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Login;
