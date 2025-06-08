
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Menu, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import AuthModal from '@/components/auth/AuthModal';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const location = useLocation();
  const { user, login, signup, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { path: '/helpers', label: t('nav.findWork') },
    { path: '/clients', label: t('nav.getHelp') },
    { path: '/about', label: t('nav.about') },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'rw' : 'en');
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo - Airbnb style */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-orange-500 text-white p-2 rounded-lg">
                <User size={24} />
              </div>
              <span className="text-2xl font-bold text-orange-500 hidden sm:block">HouseHand</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`text-sm font-medium transition-colors hover:text-orange-500 ${
                    location.pathname === item.path ? 'text-orange-500' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* User Menu - Airbnb style */}
            <div className="hidden md:flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-gray-600 hover:text-gray-900"
                onClick={toggleLanguage}
              >
                <Globe size={16} className="mr-2" />
                {t('nav.language')}
              </Button>
              
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-700">
                    {t('nav.welcome')}, {user.name}!
                  </span>
                  <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-full p-1 hover:shadow-md transition-shadow cursor-pointer">
                    <Menu size={16} className="text-gray-600 ml-2" />
                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                      <User size={16} className="text-white" />
                    </div>
                  </div>
                  <Button 
                    onClick={logout}
                    variant="ghost" 
                    size="sm"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {t('nav.logout')}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 bg-white border border-gray-300 rounded-full p-1 hover:shadow-md transition-shadow cursor-pointer">
                  <Button 
                    onClick={() => setAuthModalOpen(true)}
                    variant="ghost" 
                    size="sm"
                    className="text-gray-700 hover:text-gray-900"
                  >
                    <Menu size={16} className="mr-2" />
                    <User size={16} />
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden py-4 border-t bg-white">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="block py-3 px-4 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              
              <div className="border-t pt-4 mt-4">
                <div className="px-4 mb-3">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full justify-start text-gray-600 hover:text-gray-900"
                    onClick={toggleLanguage}
                  >
                    <Globe size={16} className="mr-2" />
                    {t('nav.language')}
                  </Button>
                </div>
                {user ? (
                  <div className="px-4 space-y-3">
                    <p className="text-sm text-gray-700">{t('nav.welcome')}, {user.name}!</p>
                    <Button 
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      {t('nav.logout')}
                    </Button>
                  </div>
                ) : (
                  <div className="px-4">
                    <Button 
                      onClick={() => {
                        setAuthModalOpen(true);
                        setIsOpen(false);
                      }}
                      className="w-full bg-orange-500 hover:bg-orange-600"
                    >
                      {t('nav.signupLogin')}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onLogin={login}
        onSignup={signup}
      />
    </>
  );
};

export default Navigation;
