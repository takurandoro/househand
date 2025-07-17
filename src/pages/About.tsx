
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { User, ArrowLeft, Heart, Users, Shield, Globe, Target, Award } from "lucide-react";

const About = () => {
  const navigate = useNavigate();

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

      {/* Hero Section */}
      <section className="py-20 text-center">
        <div className="container mx-auto px-4">
          <div className="w-20 h-20 bg-gradient-to-r from-black to-orange-600 rounded-full flex items-center justify-center mx-auto mb-8">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-black to-orange-600 bg-clip-text text-transparent mb-6">
            About HouseHand
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            We're building a platform that connects households with trusted helpers across Rwanda, 
            creating opportunities for fair employment while formalizing domestic work.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-black to-orange-600 bg-clip-text text-transparent mb-6">
              Our Mission
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed">
              HouseHand was created to address the informal nature of domestic work in Rwanda. 
              By providing a platform that connects households with helpers, we're not just facilitating 
              services – we're creating a pathway to formalize domestic work, ensure fair wages, 
              and provide social security benefits to workers who have long been overlooked.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="text-center p-6 border-orange-200 hover:shadow-lg transition-shadow">
              <Target className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <CardTitle className="text-xl mb-3">Our Goal</CardTitle>
              <CardDescription>
                To formalize domestic work in Rwanda and provide social security benefits to helpers
              </CardDescription>
            </Card>
            <Card className="text-center p-6 border-orange-200 hover:shadow-lg transition-shadow">
              <Users className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <CardTitle className="text-xl mb-3">Community Impact</CardTitle>
              <CardDescription>
                Building stronger communities by connecting neighbors and creating local employment
              </CardDescription>
            </Card>
            <Card className="text-center p-6 border-orange-200 hover:shadow-lg transition-shadow">
              <Shield className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <CardTitle className="text-xl mb-3">Social Security</CardTitle>
              <CardDescription>
                5% of each task automatically contributes to Rwanda's social security fund
              </CardDescription>
            </Card>
          </div>
        </div>
      </section>

      {/* Research Background */}
      <section className="py-16 bg-gradient-to-br from-orange-50 to-orange-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-black to-orange-800 bg-clip-text text-transparent mb-8 text-center">
              Research Foundation
            </h2>
            
            <Card className="bg-white/80 backdrop-blur-sm border-orange-300 shadow-xl mb-8">
              <CardHeader>
                <CardTitle className="text-2xl text-center">The Challenge</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p>
                  Domestic work in Rwanda, like in many developing countries, operates largely in the informal sector. 
                  This means that millions of workers – predominantly women – lack access to social protection, 
                  fair wages, and job security.
                </p>
                <p>
                  Our research identified key issues:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Lack of standardized pricing for domestic services</li>
                  <li>No social security coverage for domestic workers</li>
                  <li>Limited access to reliable helper services for households</li>
                  <li>Absence of formal contracts and worker protections</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-orange-300 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-center">Our Solution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-gray-700">
                <p>
                  HouseHand addresses these challenges through technology and policy integration:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Transparent Pricing:</strong> Fair, standardized rates for all services</li>
                  <li><strong>Social Security Integration:</strong> Automatic contributions to RSSB for all completed tasks</li>
                  <li><strong>Worker Verification:</strong> Background checks and skill verification for all helpers</li>
                  <li><strong>Digital Contracts:</strong> Clear terms and protections for both parties</li>
                  <li><strong>Community Building:</strong> Connecting neighbors and building trust</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Goals */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-black to-orange-600 bg-clip-text text-transparent mb-8">
              Our Impact Goals
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="p-8 border-orange-200 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <Award className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">For Helpers</h3>
                  <ul className="text-gray-600 space-y-2 text-left">
                    <li>• Fair compensation and transparent pricing</li>
                    <li>• Social security benefits and protections</li>
                    <li>• Flexible work opportunities</li>
                    <li>• Skills development and training</li>
                    <li>• Professional recognition and dignity</li>
                  </ul>
                </div>
              </Card>

              <Card className="p-8 border-orange-200 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <Globe className="w-16 h-16 text-orange-600 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">For Society</h3>
                  <ul className="text-gray-600 space-y-2 text-left">
                    <li>• Formalization of domestic work sector</li>
                    <li>• Increased tax base and social contributions</li>
                    <li>• Gender equality in work opportunities</li>
                    <li>• Stronger community connections</li>
                    <li>• Economic empowerment for women</li>
                  </ul>
                </div>
              </Card>
            </div>

            <div className="bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Join Our Mission</h3>
              <p className="text-gray-700 mb-6">
                Whether you need help with household tasks or want to provide services, 
                you're contributing to a larger movement toward formalizing domestic work in Rwanda.
              </p>
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={() => navigate('/get-help')}
                  className="bg-gradient-to-r from-black to-orange-600 hover:from-gray-900 hover:to-orange-700 text-white"
                >
                  Get Help
                </Button>
                <Button 
                  onClick={() => navigate('/find-work')}
                  className="bg-gradient-to-r from-orange-600 to-black hover:from-orange-700 hover:to-gray-900 text-white"
                >
                  Become a Helper
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
