import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Menu, X, Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/contexts/LanguageContext';
import AuthModal from '@/components/auth/AuthModal';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState<'client' | 'helper'>('client');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, signup, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { path: '/helpers', label: t('nav.findWork'), role: 'helper' },
    { path: '/clients', label: t('nav.getHelp'), role: 'client' },
    { path: '/about', label: t('nav.about') },
  ];

  const handleNavClick = (path: string, role?: 'client' | 'helper') => {
    if (role && (!user || user.role !== role)) {
      setAuthRole(role);
      setAuthModalOpen(true);
      return;
    }
    navigate(path);
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
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path, item.role)}
                  className={`text-sm font-medium transition-colors hover:text-orange-500 ${
                    location.pathname === item.path ? 'text-orange-500' : 'text-gray-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* User Menu - Airbnb style */}
            <div className="hidden md:flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Globe size={16} className="mr-2" />
                    {language === 'en' ? 'English' : 'Kinyarwanda'}
                    <ChevronDown size={16} className="ml-2" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setLanguage('en')}>
                    🇬🇧 English
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage('rw')}>
                    🇷🇼 Kinyarwanda
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
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
                <Button 
                  onClick={() => setAuthModalOpen(true)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6"
                >
                  {t('nav.signupLogin')}
                </Button>
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
                <button
                  key={item.path}
                  onClick={() => {
                    handleNavClick(item.path, item.role);
                    setIsOpen(false);
                  }}
                  className="block w-full text-left py-3 px-4 text-base font-medium text-gray-700 hover:text-orange-500 hover:bg-gray-50"
                >
                  {item.label}
                </button>
              ))}
              
              <div className="border-t pt-4 mt-4">
                <div className="px-4 mb-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start text-gray-600 hover:text-gray-900"
                      >
                        <Globe size={16} className="mr-2" />
                        {language === 'en' ? 'English' : 'Kinyarwanda'}
                        <ChevronDown size={16} className="ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => setLanguage('en')}>
                        🇬🇧 English
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLanguage('rw')}>
                        🇷🇼 Kinyarwanda
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
        defaultRole={authRole}
      />
    </>
  );
};

export default Navigation;
