
import React, { useState } from 'react';
import { Menu, X, User, Calendar, Globe, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface MobileNavigationProps {
  onFindWork: () => void;
  onGetHelp: () => void;
  onAbout: () => void;
  onLogin: () => void;
  onSignup: () => void;
}

const MobileNavigation = ({ onFindWork, onGetHelp, onAbout, onLogin, onSignup }: MobileNavigationProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { name: 'English', code: 'en', flag: '🇺🇸' },
    { name: 'Kinyarwanda', code: 'rw', flag: '🇷🇼' },
    { name: 'French', code: 'fr', flag: '🇫🇷' }
  ];

  const handleLanguageChange = (languageCode: string, languageName: string) => {
    i18n.changeLanguage(languageCode);
    toast({
      title: t('toasts.languageChanged'),
      description: `${t('toasts.languageChangedDesc')} ${languageName}`,
    });
    setIsOpen(false);
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const handleNavClick = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col space-y-4 mt-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-black via-orange-700 to-orange-500 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">HouseHand</span>
            </div>
          </div>

          <nav className="flex flex-col space-y-4">
            <Button
              variant="ghost"
              className="justify-start text-left h-12 text-base"
              onClick={() => handleNavClick(onFindWork)}
            >
              <Calendar className="w-5 h-5 mr-3" />
              {t('navigation.findWork')}
            </Button>
            
            <Button
              variant="ghost"
              className="justify-start text-left h-12 text-base"
              onClick={() => handleNavClick(onGetHelp)}
            >
              <User className="w-5 h-5 mr-3" />
              {t('navigation.getHelp')}
            </Button>
            
            <Button
              variant="ghost"
              className="justify-start text-left h-12 text-base"
              onClick={() => handleNavClick(onAbout)}
            >
              {t('navigation.about')}
            </Button>
          </nav>

          <div className="border-t pt-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start text-left h-12 text-base">
                  <Globe className="w-5 h-5 mr-3" />
                  {currentLanguage.flag} {currentLanguage.name}
                  <ChevronDown className="w-4 h-4 ml-auto" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                {languages.map((language) => (
                  <DropdownMenuItem 
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code, language.name)}
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <span className="text-lg">{language.flag}</span>
                    <span>{language.name}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="border-t pt-4 space-y-3">
            <Button 
              onClick={() => handleNavClick(onLogin)}
              variant="outline"
              className="w-full h-12 text-base border-orange-500 text-orange-600 hover:bg-orange-50"
            >
              {t('navigation.login')}
            </Button>
            <Button 
              onClick={() => handleNavClick(onSignup)}
              className="w-full h-12 text-base bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-white"
            >
              {t('navigation.signup')}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNavigation;
