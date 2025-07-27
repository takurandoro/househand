import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { User, ArrowLeft, Loader2 } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { supabase } from "@/integrations/supabase/client";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

// Function to generate a unique avatar URL using DiceBear
const generateAvatarUrl = (seed: string) => {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
};

const Signup = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    userType: "client", // Default to client
    phoneNumber: "",
    location: "",
    bio: ""
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUserTypeChange = (value: string) => {
    if (value) { // Only update if a value is selected
      setFormData({
        ...formData,
        userType: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      });

      if (authError) throw authError;

      if (!authData.user) throw new Error("No user data returned");

      // Generate avatar URL using email as seed for consistency
      const avatarUrl = generateAvatarUrl(formData.email);

      // Create the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: formData.fullName,
          user_type: formData.userType,
          phone_number: formData.phoneNumber,
          location: formData.location,
          bio: formData.bio,
          avatar_url: avatarUrl,
          email: formData.email
        });

      if (profileError) throw profileError;

      toast({
        title: "Success",
        description: "Account created successfully! Please check your email to verify your account.",
      });

      navigate("/login");
    } catch (error) {
      console.error('Error signing up:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred during signup",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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

      {/* Signup Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Card className="bg-white shadow-2xl border-orange-200">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-3xl bg-gradient-to-r from-black to-orange-600 bg-clip-text text-transparent">
                  {t('auth.joinHouseHand')}
                </CardTitle>
                <CardDescription className="text-gray-600 text-lg">
                  {t('auth.createAccount')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-gray-700 font-medium">{t('auth.fullName')}</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="border-orange-200 focus:border-orange-500 py-3"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">{t('auth.email')}</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="border-orange-200 focus:border-orange-500 py-3"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="text-gray-700 font-medium">{t('auth.phoneNumber')}</Label>
                    <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      type="tel"
                      placeholder="+25078xxxxxxx"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="border-orange-200 focus:border-orange-500 py-3"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-gray-700 font-medium">{t('auth.location')}</Label>
                    <Input
                      id="location"
                      name="location"
                      type="text"
                      placeholder="Enter your location"
                      value={formData.location}
                      onChange={handleChange}
                      className="border-orange-200 focus:border-orange-500 py-3"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="text-gray-700 font-medium">{t('auth.bio')}</Label>
                    <Textarea
                      id="bio"
                      name="bio"
                      placeholder="Tell us about yourself"
                      value={formData.bio}
                      onChange={handleChange}
                      className="border-orange-200 focus:border-orange-500 py-3"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">{t('auth.iAmA')}</Label>
                    <ToggleGroup
                      type="single"
                      value={formData.userType}
                      onValueChange={handleUserTypeChange}
                      className="justify-center border rounded-lg p-1"
                    >
                      <ToggleGroupItem
                        value="client"
                        className="flex-1 data-[state=on]:bg-orange-500 data-[state=on]:text-white"
                      >
                        {t('auth.client')}
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="helper"
                        className="flex-1 data-[state=on]:bg-orange-500 data-[state=on]:text-white"
                      >
                        {t('auth.helper')}
                      </ToggleGroupItem>
                    </ToggleGroup>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">{t('auth.password')}</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="border-orange-200 focus:border-orange-500 py-3"
                      required
                      disabled={loading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">{t('auth.confirmPassword')}</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="border-orange-200 focus:border-orange-500 py-3"
                      required
                      disabled={loading}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-black to-orange-600 hover:from-black hover:to-orange-700 text-white py-3 rounded-lg font-medium shadow-lg"
                    disabled={loading}
                  >
                    {loading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    "Create Account"
                  )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Signup;
