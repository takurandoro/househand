import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Globe, ChevronDown } from "lucide-react";
import { useTranslation } from 'react-i18next';
import { useToast } from '@/hooks/use-toast';
import MobileNavigation from './MobileNavigation';

interface ResponsiveHeaderProps {
  onFindWork: () => void;
  onGetHelp: () => void;
  onAbout: () => void;
  onLogin: () => void;
  onSignup: () => void;
}

const ResponsiveHeader = ({ onFindWork, onGetHelp, onAbout, onLogin, onSignup }: ResponsiveHeaderProps) => {
  const { t, i18n } = useTranslation();
  const { toast } = useToast();

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
  };

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  return (
    <header className="bg-white text-gray-900 px-4 py-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-orange-100 rounded-xl flex items-center justify-center shadow-lg">
            <User className="w-5 h-5 md:w-6 md:h-6 text-orange-600" />
          </div>
          <span className="text-xl md:text-2xl font-bold text-gray-900">HouseHand</span>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <button 
            onClick={onFindWork}
            className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
          >
            {t('navigation.findWork')}
          </button>
          <button 
            onClick={onGetHelp}
            className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
          >
            {t('navigation.getHelp')}
          </button>
          <button 
            onClick={onAbout}
            className="text-gray-700 hover:text-orange-600 font-medium transition-colors"
          >
            {t('navigation.about')}
          </button>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-gray-700 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-200">
                <Globe className="w-4 h-4 mr-2" />
                {currentLanguage.flag} {currentLanguage.name}
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg z-50">
              {languages.map((language) => (
                <DropdownMenuItem 
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code, language.name)}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 text-gray-900 hover:text-gray-900"
                >
                  <span className="text-lg">{language.flag}</span>
                  <span>{language.name}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <div className="flex space-x-2">
            <Button 
              onClick={onLogin}
              className="bg-white border border-orange-500 hover:bg-orange-50 text-orange-600 transition-all"
            >
              {t('navigation.login')}
            </Button>
            <Button 
              onClick={onSignup}
              className="bg-orange-600 hover:bg-orange-700 text-white transition-all"
            >
              {t('navigation.signup')}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <MobileNavigation 
          onFindWork={onFindWork}
          onGetHelp={onGetHelp}
          onAbout={onAbout}
          onLogin={onLogin}
          onSignup={onSignup}
        />
      </div>
    </header>
  );
};

export default ResponsiveHeader;
