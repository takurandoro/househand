import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Plus, User, Calendar, CheckCircle, Shield, MapPin, Clock, Star, Globe, ChevronDown, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTranslation } from 'react-i18next';
import { supabase, getStorageUrl } from '@/integrations/supabase/client';
import ResponsiveHeader from '@/components/ResponsiveHeader';
import { Footer } from '@/components/Footer';

const Index = () => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [helpers, setHelpers] = useState<any[]>([]);
  const [loadingHelpers, setLoadingHelpers] = useState(true);

  // Sample tasks that will rotate
  const sampleTasks = [
    t('taskExamples.cleaning'),
    t('taskExamples.gardening'),
    t('taskExamples.painting'),
    t('taskExamples.moving'),
    t('taskExamples.repairs')
  ];

  // Text rotation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => 
        prevIndex === sampleTasks.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [sampleTasks.length]);

  // Fetch helpers with better data
  useEffect(() => {
    const fetchHelpers = async () => {
      try {
        // Get basic profile data first (simplified version)
        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            bio,
            avatar_url,
            location,
            user_type,
            created_at
          `)
          .eq('user_type', 'helper')
          .order('created_at', { ascending: false })
          .limit(6); // Show 6 helpers

        if (error) {
          console.error('Error fetching helpers:', error);
          setHelpers([]);
          return;
        }

        console.log('Raw profiles data:', data);
        console.log('Helpers array length:', data?.length || 0);

        // For now, just use the basic profile data without stats
        const helpersWithStats = data?.map(helper => ({
          ...helper,
          avg_rating: 0,
          total_reviews: 0,
          total_tasks: 0
        })) || [];

        console.log('Helpers with stats:', helpersWithStats);
        console.log('Loading state:', loadingHelpers);

        // Add a test helper if no helpers are found
        if (helpersWithStats.length === 0) {
          console.log('No helpers found, adding test helper');
          setHelpers([{
            id: 'test-helper',
            full_name: 'Test Helper',
            bio: 'This is a test helper to verify the display works',
            avatar_url: null,
            location: 'Kigali, Rwanda',
            user_type: 'helper',
            created_at: new Date().toISOString(),
            avg_rating: 4.5,
            total_reviews: 10,
            total_tasks: 25
          }]);
        } else {
          setHelpers(helpersWithStats);
        }
      } catch (error) {
        console.error('Error fetching helpers:', error);
        setHelpers([]);
      } finally {
        setLoadingHelpers(false);
      }
    };

    fetchHelpers();
  }, []);

  const handlePostTask = () => {
    navigate('/login');
    toast({
      title: t('toasts.signInRequired'),
      description: t('toasts.signInRequiredDesc'),
    });
  };

  const handleFindWork = () => {
    navigate('/find-work');
  };

  const handleGetHelp = () => {
    navigate('/get-help');
  };

  const handleAbout = () => {
    navigate('/about');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleSignup = () => {
    navigate('/signup');
  };

  const handleHelperClick = (helperId: string) => {
    // Navigate to helper details or find work page
    navigate('/find-work');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Responsive Navigation Header */}
      <ResponsiveHeader 
        onFindWork={handleFindWork}
        onGetHelp={handleGetHelp}
        onAbout={handleAbout}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-black via-gray-900 to-orange-600 text-white py-12 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-orange-900/60"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 md:mb-8 bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
            {t('hero.title')}
          </h1>
          <p className="text-lg md:text-xl text-orange-100 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            {t('hero.subtitle')}
          </p>

          {/* Post Task Search Bar */}
          <div className="flex justify-center mb-8">
            <div className="bg-white rounded-2xl md:rounded-full shadow-2xl p-3 md:p-4 max-w-4xl w-full mx-4 cursor-text hover:shadow-3xl transition-all duration-300">
              <div className="flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-4">
                <div className="flex-1 px-4 w-full">
                  <div className="text-left">
                    <p className="text-sm text-gray-600 font-medium mb-1">{t('hero.searchPlaceholder')}</p>
                    <input
                      type="text"
                      className="w-full text-base text-gray-700 outline-none border-none bg-transparent placeholder-gray-400"
                      placeholder={sampleTasks[currentTextIndex]}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      onChange={() => {}}
                    />
                  </div>
                </div>
                <div className="hidden md:block border-l border-gray-200 h-12"></div>
                <div className="flex-1 px-4 w-full">
                  <div className="text-left">
                    <p className="text-sm text-gray-600 font-medium mb-1">{t('hero.location')}</p>
                    <input
                      type="text"
                      className="w-full text-base text-gray-700 outline-none border-none bg-transparent placeholder-gray-400"
                      placeholder={t('hero.locationText')}
                      onFocus={() => setIsInputFocused(true)}
                      onBlur={() => setIsInputFocused(false)}
                      onChange={() => {}}
                    />
                  </div>
                </div>
                <div 
                  onClick={handlePostTask}
                  className="bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 rounded-full p-3 md:p-4 shadow-lg cursor-pointer transition-transform transform hover:scale-105 w-full md:w-auto flex items-center justify-center"
                >
                  <Plus className="w-6 h-6 text-white" />
                  <span className="ml-2 md:hidden text-white font-medium">Post Task</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Cards */}
      <section className="py-12 md:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
            <Card 
              onClick={handleGetHelp}
              className="bg-gradient-to-br from-black via-gray-800 to-orange-600 text-white border-none p-6 md:p-10 cursor-pointer hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              <CardHeader className="p-0 mb-6">
                <User className="w-12 h-12 md:w-16 md:h-16 mb-4 md:mb-6 text-orange-200" />
                <CardTitle className="text-2xl md:text-3xl font-bold text-white mb-3">{t('services.needHelp')}</CardTitle>
                <CardDescription className="text-orange-100 text-base md:text-lg leading-relaxed">
                  {t('services.needHelpDesc')}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              onClick={handleFindWork}
              className="bg-gradient-to-br from-orange-600 via-orange-700 to-black text-white border-none p-6 md:p-10 cursor-pointer hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              <CardHeader className="p-0 mb-6">
                <Calendar className="w-12 h-12 md:w-16 md:h-16 mb-4 md:mb-6 text-orange-200" />
                <CardTitle className="text-2xl md:text-3xl font-bold text-white mb-3">{t('services.wantToHelp')}</CardTitle>
                <CardDescription className="text-orange-100 text-base md:text-lg leading-relaxed">
                  {t('services.wantToHelpDesc')}
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Helpers Near You Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 space-y-4 md:space-y-0">
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-black to-orange-600 bg-clip-text text-transparent">
              {t('helpers.title')}
            </h2>
            <Button 
              variant="outline" 
              className="text-orange-600 border-orange-600 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 border-2 w-full md:w-auto"
              onClick={() => navigate('/find-work')}
            >
              {t('helpers.viewAll')}
            </Button>
          </div>
          
          {loadingHelpers ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
            </div>
          ) : helpers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {helpers.map((helper) => (
                <Card 
                  key={helper.id} 
                  className="bg-gradient-to-br from-black via-gray-800 to-orange-600 text-white border-none p-6 cursor-pointer hover:scale-105 transition-all duration-300 shadow-2xl"
                  onClick={() => handleHelperClick(helper.id)}
                >
                  <CardHeader className="p-0 mb-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="w-16 h-16 border-2 border-orange-200 shadow-lg">
                        <AvatarImage 
                          src={getStorageUrl(helper.avatar_url)} 
                          alt={helper.full_name || 'Helper'}
                          className="object-cover"
                        />
                        <AvatarFallback className="bg-orange-200 text-orange-800 text-lg font-semibold">
                          {helper.full_name ? helper.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'H'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle className="text-xl font-bold text-white mb-1">
                          {helper.full_name || 'Helper'}
                        </CardTitle>
                        {helper.location && (
                          <div className="flex items-center text-orange-200 text-sm">
                            <MapPin className="w-4 h-4 mr-1" />
                            {helper.location}
                          </div>
                        )}
                      </div>
                    </div>
                    <CardDescription className="text-orange-100 text-sm leading-relaxed mb-3">
                      {helper.bio || 'No bio available'}
                    </CardDescription>
                    
                    {/* Helper stats */}
                    <div className="flex items-center justify-between text-xs text-orange-200">
                      <div className="flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        <span>{helper.avg_rating ? helper.avg_rating.toFixed(1) : '0.0'}</span>
                        <span className="ml-1">({helper.total_reviews || 0})</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        <span>{helper.total_tasks || 0} tasks</span>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gradient-to-r from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="w-10 h-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">{t('helpers.noHelpers')}</h3>
              <p className="text-gray-600 max-w-md mx-auto px-4">
                {t('helpers.noHelpersDesc')}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Social Impact Section */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-orange-50 via-orange-100 to-orange-200">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-black to-orange-800 bg-clip-text text-transparent mb-6">{t('impact.title')}</h2>
          <p className="text-base md:text-lg text-gray-700 mb-8 md:mb-12 max-w-2xl mx-auto px-4">
            {t('impact.subtitle')}
          </p>

          <Card className="max-w-4xl mx-auto bg-white/80 backdrop-blur-sm border-orange-300 shadow-2xl">
            <CardHeader className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center justify-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-700 rounded-full flex items-center justify-center mb-4 md:mb-0 md:mr-4">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl md:text-2xl bg-gradient-to-r from-black to-orange-800 bg-clip-text text-transparent text-center md:text-left">{t('impact.contributionTitle')}</CardTitle>
              </div>
              <CardDescription className="text-sm md:text-base text-gray-700 leading-relaxed px-4">
                {t('impact.contributionDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 md:p-8">
              <div className="bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">{t('impact.totalContributions')}</p>
                  <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">275,000 RWF</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-3">{t('impact.helpersBenefiting')}</p>
                  <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">12 people</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Safety Section */}
      <section className="py-12 md:py-20 bg-gradient-to-br from-black via-gray-900 to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">{t('safety.title')}</h2>
          <p className="text-base md:text-lg text-orange-100 mb-8 md:mb-12 max-w-2xl mx-auto px-4">
            {t('safety.subtitle')}
          </p>
          
          <div className="flex justify-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-orange-500 to-orange-700 rounded-full flex items-center justify-center shadow-2xl">
              <Shield className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer 
        onGetHelp={handleGetHelp}
        onFindWork={handleFindWork}
        onAbout={handleAbout}
      />
    </div>
  );
};

export default Index;
