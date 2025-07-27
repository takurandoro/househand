
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { User, Calendar, MapPin, Clock, Star, ArrowLeft } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { Footer } from '@/components/Footer';

const FindWork = () => {
  const { t } = useTranslation();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    phone: ''
  });
  const [showLogin, setShowLogin] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.email && loginData.password) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userType', 'helper');
      toast({
        title: t('findWork.welcomeHelper'),
        description: t('findWork.readyToWork'),
      });
      navigate('/dashboard');
    }
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.name && signupData.email && signupData.password) {
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userType', 'helper');
      toast({
        title: t('findWork.welcomeToHouseHand'),
        description: t('findWork.helperAccountCreated'),
      });
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
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

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <div className="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-700 rounded-full flex items-center justify-center mx-auto mb-8">
            <Calendar className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-black to-orange-600 bg-clip-text text-transparent mb-6">
            {t('findWork.title')}
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            {t('findWork.subtitle')}
          </p>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center p-6 border-orange-200 hover:shadow-lg transition-shadow">
              <Clock className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <CardTitle className="text-xl mb-3">{t('findWork.benefits.flexibleSchedule')}</CardTitle>
              <CardDescription>{t('findWork.benefits.flexibleScheduleDesc')}</CardDescription>
            </Card>
            <Card className="text-center p-6 border-orange-200 hover:shadow-lg transition-shadow">
              <Star className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <CardTitle className="text-xl mb-3">{t('findWork.benefits.fairCompensation')}</CardTitle>
              <CardDescription>{t('findWork.benefits.fairCompensationDesc')}</CardDescription>
            </Card>
            <Card className="text-center p-6 border-orange-200 hover:shadow-lg transition-shadow">
              <MapPin className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <CardTitle className="text-xl mb-3">{t('findWork.benefits.workLocally')}</CardTitle>
              <CardDescription>{t('findWork.benefits.workLocallyDesc')}</CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* Sign In/Up Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="bg-white shadow-2xl border-orange-200">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl bg-gradient-to-r from-black to-orange-600 bg-clip-text text-transparent">
                  {showLogin ? t('findWork.signInAsHelper') : t('findWork.becomeHelper')}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {showLogin ? t('findWork.accessDashboard') : t('findWork.createProfile')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {showLogin ? (
                  <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-gray-700 font-medium">{t('auth.email')}</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={loginData.email}
                        onChange={(e) => setLoginData({...loginData, email: e.target.value})}
                        className="border-orange-200 focus:border-orange-500"
                        required
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
                        className="border-orange-200 focus:border-orange-500"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-black to-orange-600 hover:from-gray-900 hover:to-orange-700 text-white py-3">
                      {t('findWork.signInAsHelperBtn')}
                    </Button>
                    <p className="text-center text-sm text-gray-600">
                      {t('findWork.newHelper')}{' '}
                      <button
                        type="button"
                        onClick={() => setShowLogin(false)}
                        className="text-orange-600 hover:text-orange-700 font-medium"
                      >
                        {t('auth.signUpHere')}
                      </button>
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleSignup} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-gray-700 font-medium">{t('auth.fullName')}</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={signupData.name}
                        onChange={(e) => setSignupData({...signupData, name: e.target.value})}
                        className="border-orange-200 focus:border-orange-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-gray-700 font-medium">{t('auth.email')}</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="your@email.com"
                        value={signupData.email}
                        onChange={(e) => setSignupData({...signupData, email: e.target.value})}
                        className="border-orange-200 focus:border-orange-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-gray-700 font-medium">{t('auth.phoneNumber')}</Label>
                      <Input
                        id="phone"
                        placeholder="+25078xxxxxxx"
                        value={signupData.phone}
                        onChange={(e) => setSignupData({...signupData, phone: e.target.value})}
                        className="border-orange-200 focus:border-orange-500"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-gray-700 font-medium">{t('auth.password')}</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder={t('auth.createPassword')}
                        value={signupData.password}
                        onChange={(e) => setSignupData({...signupData, password: e.target.value})}
                        className="border-orange-200 focus:border-orange-500"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full bg-gradient-to-r from-black to-orange-600 hover:from-gray-900 hover:to-orange-700 text-white py-3">
                      {t('findWork.createHelperAccount')}
                    </Button>
                    <p className="text-center text-sm text-gray-600">
                      {t('findWork.alreadyHelper')}{' '}
                      <button
                        type="button"
                        onClick={() => setShowLogin(true)}
                        className="text-orange-600 hover:text-orange-700 font-medium"
                      >
                        {t('auth.signInHere')}
                      </button>
                    </p>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default FindWork;
