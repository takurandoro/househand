import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LanguageContextType {
  language: 'en' | 'rw';
  setLanguage: (lang: 'en' | 'rw') => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.findWork': 'Find work',
    'nav.getHelp': 'Get help',
    'nav.about': 'About',
    'nav.language': 'EN',
    'nav.signupLogin': 'Sign up or log in',
    'nav.logout': 'Logout',
    'nav.welcome': 'Welcome',
    'nav.notLoggedIn': 'Not logged in',
    'nav.loginRequired': 'Login required',
    'nav.loginAsHelper': 'Sign in as a helper',
    'nav.loginAsClient': 'Sign in as a client',

    // Hero Section
    'hero.title': 'Find help for your household tasks',
    'hero.subtitle': 'Connect with skilled helpers in Rwanda. Fair pricing, secure payments, and social benefits for everyone.',
    'hero.searchPlaceholder': 'Cleaning, washing, yard work...',
    'hero.locationPlaceholder': 'Kigali, Rwanda',
    'hero.whatNeed': 'What do you need help with?',
    'hero.location': 'Location',

    // Quick Actions
    'quickActions.needHelp': 'I need help',
    'quickActions.needHelpDesc': 'Post your household tasks and get help from verified helpers',
    'quickActions.wantHelp': 'I want to help',
    'quickActions.wantHelpDesc': 'Find household tasks in your area and earn fair income',

    // Tasks
    'tasks.nearYou': 'Tasks near you',
    'tasks.showAll': 'Show all',
    'tasks.effort': 'effort',
    'tasks.total': 'total',
    'tasks.submitBid': 'Submit bid',
    'tasks.viewDetails': 'View details',

    // Social Impact
    'social.title': 'Building a better future together',
    'social.subtitle': 'Every task helps formalize domestic work and provides social benefits',
    'social.contribution': 'Social Security Fund Contribution',
    'social.description': '5% of each completed task automatically contributes to Rwanda\'s social security fund, helping formalize domestic work and provide benefits to helpers.',
    'social.totalMonth': 'Total Contributions This Month:',
    'social.helpersBenefiting': 'Helpers Benefiting:',
    'social.people': 'people',

    // Trust & Safety
    'trust.title': 'Your safety is our priority',
    'trust.subtitle': 'All helpers are verified and tasks are covered by our guarantee',
    'trust.verified': 'Verified helpers',
    'trust.verifiedDesc': 'Background checks and ID verification for all helpers',
    'trust.rated': 'Rated & reviewed',
    'trust.ratedDesc': 'Community ratings help you choose the right helper',
    'trust.secure': 'Secure payments',
    'trust.secureDesc': 'Payments held safely until your task is completed',

    // Auth
    'auth.joinTitle': 'Join HouseHand',
    'auth.chooseRole': 'Choose how you want to use HouseHand',
    'auth.client': 'I\'m a Client',
    'auth.clientDesc': 'I need help with household tasks and chores',
    'auth.helper': 'I\'m a Helper',
    'auth.helperDesc': 'I want to find work opportunities and earn income',
    'auth.login': 'Login',
    'auth.signup': 'Sign Up',
    'auth.fullName': 'Full Name',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.createAccount': 'Create Account',
    'auth.noAccount': 'Don\'t have an account? Sign up',
    'auth.hasAccount': 'Already have an account? Login',
    'auth.backToRole': 'Back to role selection',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
  },
  rw: {
    // Navigation
    'nav.findWork': 'Shaka akazi',
    'nav.getHelp': 'Saba ubufasha',
    'nav.about': 'Ibyerekeye',
    'nav.language': 'RW',
    'nav.signupLogin': 'Iyandikishe cyangwa injire',
    'nav.logout': 'Sohoka',
    'nav.welcome': 'Murakaza neza',
    'nav.notLoggedIn': 'Ntabwo winjiye',
    'nav.loginRequired': 'Kwinjira birakenewe',
    'nav.loginAsHelper': 'Injira nk\'umufasha',
    'nav.loginAsClient': 'Injira nk\'umukiriya',

    // Hero Section
    'hero.title': 'Shakisha ubufasha mu mirimo y\'urugo',
    'hero.subtitle': 'Hura n\'abafasha banyabushobozi mu Rwanda. Ibiciro byangiza, kwishyura gutegetswe, n\'inyungu z\'imibereho kuri bose.',
    'hero.searchPlaceholder': 'Gusukura, gucukura, gukora mu busitani...',
    'hero.locationPlaceholder': 'Kigali, u Rwanda',
    'hero.whatNeed': 'Ni iki ukeneye ubufasha?',
    'hero.location': 'Aho uri',

    // Quick Actions
    'quickActions.needHelp': 'Nkeneye ubufasha',
    'quickActions.needHelpDesc': 'Andika imirimo yawe y\'urugo ugire ubufasha bw\'abafasha bemejwe',
    'quickActions.wantHelp': 'Nshaka gufasha',
    'quickActions.wantHelpDesc': 'Shakisha imirimo y\'urugo mu karere kawe ukagire amafaranga',

    // Tasks
    'tasks.nearYou': 'Imirimo hafi yawe',
    'tasks.showAll': 'Erekana byose',
    'tasks.effort': 'imbaraga',
    'tasks.total': 'byose',
    'tasks.submitBid': 'Ohereza igiciro',
    'tasks.viewDetails': 'Reba amakuru arambuye',

    // Social Impact
    'social.title': 'Kubaka ejo hazaza heza hamwe',
    'social.subtitle': 'Buri mirimo ifasha gutegura akazi k\'urugo no gutanga inyungu z\'imibereho',
    'social.contribution': 'Umusanzu w\'Ikigega cy\'Ubwiteganyirize bw\'Imibereho',
    'social.description': '5% ya buri mirimo irangiye yishyurwa mu ikigega cy\'ubwiteganyirize bw\'imibereho cya Rwanda, bifasha gutegura akazi k\'urugo no gutanga inyungu ku bafasha.',
    'social.totalMonth': 'Imisanzu Yose y\'Ukwezi:',
    'social.helpersBenefiting': 'Abafasha Bungukiye:',
    'social.people': 'abantu',

    // Trust & Safety
    'trust.title': 'Umutekano wawe ni intego yacu',
    'trust.subtitle': 'Abafasha bose baragenzuwe kandi imirimo irangirwa n\'ikemeza ryacu',
    'trust.verified': 'Abafasha bemejwe',
    'trust.verifiedDesc': 'Gukora ubushakashatsi bw\'amateka no kwemeza indangamuntu ku bafasha bose',
    'trust.rated': 'Bapimwe no gusuzumwa',
    'trust.ratedDesc': 'Amanota y\'umuryango afasha guhitamo umufasha ukwiye',
    'trust.secure': 'Kwishyura gutegetswe',
    'trust.secureDesc': 'Amafaranga abikwa neza kugeza umurimo wawe urangiye',

    // Auth
    'auth.joinTitle': 'Kwinjira muri HouseHand',
    'auth.chooseRole': 'Hitamo uburyo ushaka gukoresha HouseHand',
    'auth.client': 'Ndi umukiriya',
    'auth.clientDesc': 'Nkeneye ubufasha mu mirimo y\'urugo n\'ibindi',
    'auth.helper': 'Ndi umufasha',
    'auth.helperDesc': 'Nshaka gushaka amahirwe y\'akazi no kubona amafaranga',
    'auth.login': 'Kwinjira',
    'auth.signup': 'Kwiyandikisha',
    'auth.fullName': 'Amazina yose',
    'auth.email': 'Imeyili',
    'auth.password': 'Ijambo ry\'ibanga',
    'auth.createAccount': 'Kurema konti',
    'auth.noAccount': 'Ntufite konti? Iyandikishe',
    'auth.hasAccount': 'Usanzwe ufite konti? Injira',
    'auth.backToRole': 'Garuka ku guhitamo uruhare',

    // Common
    'common.loading': 'Biratunganywa...',
    'common.error': 'Ikosa',
    'common.success': 'Byagenze neza',
    'common.cancel': 'Kuraguza',
    'common.confirm': 'Kwemeza',
    'common.save': 'Kubika',
    'common.edit': 'Guhindura',
    'common.delete': 'Gusiba',
    'common.search': 'Gushakisha',
    'common.filter': 'Gutandukanya',
    'common.sort': 'Gutondeka',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<'en' | 'rw'>(() => {
    const saved = localStorage.getItem('househand_language');
    return (saved as 'en' | 'rw') || 'en';
  });

  useEffect(() => {
    localStorage.setItem('househand_language', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
