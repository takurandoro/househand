import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Globe, Shield, FileText, Lock, Scale, Users, Heart } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface FooterProps {
  onGetHelp?: () => void;
  onFindWork?: () => void;
  onAbout?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onGetHelp,
  onFindWork,
  onAbout
}) => {
  const { t } = useTranslation();
  const [activeDialog, setActiveDialog] = useState<string | null>(null);

  const openDialog = (dialog: string) => setActiveDialog(dialog);
  const closeDialog = () => setActiveDialog(null);

  return (
    <>
      <footer className="bg-gradient-to-r from-black via-gray-900 to-orange-600 text-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">HouseHand</span>
              </div>
              <p className="text-orange-100 text-sm leading-relaxed mb-4">
                {t('footer.description')}
              </p>
              <div className="flex items-center space-x-2 text-orange-200 text-xs">
                <Shield className="w-4 h-4" />
                <span>Verified & Secure</span>
              </div>
            </div>
            
            {/* Platform Links */}
            <div>
              <h3 className="font-semibold mb-4 text-orange-200 flex items-center">
                <Globe className="w-4 h-4 mr-2" />
                {t('footer.platform')}
              </h3>
              <ul className="space-y-2 text-sm text-orange-100">
                <li><button onClick={onGetHelp} className="hover:text-white transition-colors">{t('footer.postTask')}</button></li>
                <li><button onClick={onFindWork} className="hover:text-white transition-colors">{t('footer.findWork')}</button></li>
                <li><button className="hover:text-white transition-colors">{t('footer.safety')}</button></li>
                <li><button className="hover:text-white transition-colors">{t('footer.howItWorks')}</button></li>
              </ul>
            </div>

            {/* Legal & Support */}
            <div>
              <h3 className="font-semibold mb-4 text-orange-200 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Legal & Support
              </h3>
              <ul className="space-y-2 text-sm text-orange-100">
                <li><button onClick={() => openDialog('terms')} className="hover:text-white transition-colors">Terms of Service</button></li>
                <li><button onClick={() => openDialog('privacy')} className="hover:text-white transition-colors">Privacy Policy</button></li>
                <li><button onClick={() => openDialog('license')} className="hover:text-white transition-colors">End-User License</button></li>
                <li><button onClick={() => openDialog('cookies')} className="hover:text-white transition-colors">Cookie Policy</button></li>
                <li><button className="hover:text-white transition-colors">{t('footer.helpCenter')}</button></li>
                <li><button className="hover:text-white transition-colors">{t('footer.contactUs')}</button></li>
              </ul>
            </div>

            {/* Community */}
            <div>
              <h3 className="font-semibold mb-4 text-orange-200 flex items-center">
                <Users className="w-4 h-4 mr-2" />
                {t('footer.community')}
              </h3>
              <ul className="space-y-2 text-sm text-orange-100">
                <li><button onClick={onAbout} className="hover:text-white transition-colors">{t('footer.aboutUs')}</button></li>
                <li><button className="hover:text-white transition-colors">{t('footer.socialImpact')}</button></li>
                <li><button className="hover:text-white transition-colors">{t('footer.blog')}</button></li>
                <li><button className="hover:text-white transition-colors">{t('footer.careers')}</button></li>
              </ul>
            </div>
          </div>

          <Separator className="my-6 md:my-8 bg-orange-300/30" />

          {/* Bottom Section */}
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-orange-100 text-sm">
                {t('footer.copyright')}
              </p>
              <p className="text-orange-200 text-xs mt-1">
                Made with <Heart className="w-3 h-3 inline text-red-400" /> in Rwanda
              </p>
            </div>
            <div className="flex space-x-4">
              <button className="text-orange-100 hover:text-white transition-colors">
                <Globe className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Legal Dialogs */}
      
      {/* Terms of Service Dialog */}
      <Dialog open={activeDialog === 'terms'} onOpenChange={() => closeDialog()}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Terms of Service</DialogTitle>
            <DialogDescription className="text-gray-600">
              Last updated: January 2025
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 text-gray-700">
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1. User Rights and Responsibilities</h3>
              <div className="space-y-3 text-sm">
                <p><strong>User Rights:</strong> You have the right to access and use our platform in accordance with these terms. You may post tasks, bid on tasks, and communicate with other users through our secure messaging system.</p>
                <p><strong>User Responsibilities:</strong> You are responsible for providing accurate information, maintaining the security of your account, and complying with all applicable laws and regulations.</p>
                <p><strong>Age Requirement:</strong> You must be at least 18 years old to use our platform. By using our service, you represent that you meet this requirement.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Service Usage and Limitations</h3>
              <div className="space-y-3 text-sm">
                <p><strong>Acceptable Use:</strong> Our platform is designed for household tasks and services. You may not use our service for illegal activities, harassment, or any purpose that violates these terms.</p>
                <p><strong>Service Availability:</strong> We strive to maintain 24/7 service availability but cannot guarantee uninterrupted access. We may perform maintenance or updates that temporarily affect service.</p>
                <p><strong>Geographic Limitations:</strong> Our services are currently available in Rwanda. Users must be located within our service area to use the platform.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Payment and Financial Terms</h3>
              <div className="space-y-3 text-sm">
                <p><strong>Payment Processing:</strong> All payments are processed securely through our payment partners. We charge a 5% service fee on completed tasks, which contributes to Rwanda's social security fund.</p>
                <p><strong>Refunds:</strong> Refunds are processed according to our refund policy. Disputes are handled through our customer support team.</p>
                <p><strong>Tax Obligations:</strong> Users are responsible for their own tax obligations related to income earned through our platform.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Liability and Disclaimers</h3>
              <div className="space-y-3 text-sm">
                <p><strong>Service Disclaimer:</strong> We provide a platform for connecting users but are not responsible for the quality of services provided by helpers or the actions of users.</p>
                <p><strong>Limitation of Liability:</strong> Our liability is limited to the amount paid for our services in the 12 months preceding any claim.</p>
                <p><strong>Indemnification:</strong> You agree to indemnify us against any claims arising from your use of our platform or violation of these terms.</p>
              </div>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Dialog */}
      <Dialog open={activeDialog === 'privacy'} onOpenChange={() => closeDialog()}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Privacy Policy</DialogTitle>
            <DialogDescription className="text-gray-600">
              Last updated: January 2025
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 text-gray-700">
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1. Data Collection and Usage</h3>
              <div className="space-y-3 text-sm">
                <p><strong>Personal Information:</strong> We collect information you provide, including name, email, phone number, location, and profile information.</p>
                <p><strong>Usage Data:</strong> We collect data about how you use our platform, including task postings, bids, and communications.</p>
                <p><strong>Device Information:</strong> We may collect information about your device, browser, and IP address for security and analytics purposes.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Consent Requirements</h3>
              <div className="space-y-3 text-sm">
                <p><strong>Explicit Consent:</strong> By using our platform, you explicitly consent to the collection, processing, and storage of your data as described in this policy.</p>
                <p><strong>Marketing Consent:</strong> You may opt-in to receive marketing communications. You can withdraw consent at any time through your account settings.</p>
                <p><strong>Third-Party Services:</strong> We may use third-party services for payment processing and analytics. These services have their own privacy policies.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Data Protection and Security</h3>
              <div className="space-y-3 text-sm">
                <p><strong>Security Measures:</strong> We implement industry-standard security measures to protect your data, including encryption and secure servers.</p>
                <p><strong>Data Retention:</strong> We retain your data for as long as necessary to provide our services and comply with legal obligations.</p>
                <p><strong>Data Breach Response:</strong> In the event of a data breach, we will notify affected users and relevant authorities as required by law.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Your Rights</h3>
              <div className="space-y-3 text-sm">
                <p><strong>Access and Correction:</strong> You have the right to access, correct, or delete your personal information through your account settings.</p>
                <p><strong>Data Portability:</strong> You may request a copy of your data in a portable format.</p>
                <p><strong>Right to Object:</strong> You may object to certain types of data processing, such as marketing communications.</p>
              </div>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {/* End-User License Agreement Dialog */}
      <Dialog open={activeDialog === 'license'} onOpenChange={() => closeDialog()}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">End-User License Agreement</DialogTitle>
            <DialogDescription className="text-gray-600">
              Last updated: January 2025
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 text-gray-700">
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1. License Grant</h3>
              <div className="space-y-3 text-sm">
                <p><strong>Non-Exclusive License:</strong> We grant you a non-exclusive, non-transferable license to use our platform for personal or commercial purposes in accordance with these terms.</p>
                <p><strong>License Scope:</strong> This license covers access to our web platform, mobile applications, and related services.</p>
                <p><strong>License Restrictions:</strong> You may not reverse engineer, modify, or create derivative works of our platform without explicit permission.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2. Intellectual Property Rights</h3>
              <div className="space-y-3 text-sm">
                <p><strong>Our Rights:</strong> We retain all intellectual property rights to our platform, including trademarks, copyrights, and trade secrets.</p>
                <p><strong>User Content:</strong> You retain rights to content you create, but grant us a license to use it for platform operation.</p>
                <p><strong>Third-Party Content:</strong> Our platform may include third-party content subject to their respective licenses.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Termination and Suspension</h3>
              <div className="space-y-3 text-sm">
                <p><strong>Termination by User:</strong> You may terminate this license at any time by deleting your account and discontinuing use.</p>
                <p><strong>Termination by Us:</strong> We may terminate or suspend your license for violations of these terms or for any other reason at our discretion.</p>
                <p><strong>Effect of Termination:</strong> Upon termination, your right to use our platform ceases immediately.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Updates and Modifications</h3>
              <div className="space-y-3 text-sm">
                <p><strong>Platform Updates:</strong> We may update our platform from time to time. Continued use constitutes acceptance of updates.</p>
                <p><strong>License Modifications:</strong> We may modify this license with notice. Continued use after modifications constitutes acceptance.</p>
                <p><strong>Backward Compatibility:</strong> We strive to maintain backward compatibility but cannot guarantee it for all updates.</p>
              </div>
            </section>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cookie Policy Dialog */}
      <Dialog open={activeDialog === 'cookies'} onOpenChange={() => closeDialog()}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900">Cookie Policy</DialogTitle>
            <DialogDescription className="text-gray-600">
              Last updated: January 2025
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 text-gray-700">
            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">1. What Are Cookies</h3>
              <div className="space-y-3 text-sm">
                <p>Cookies are small text files stored on your device that help us provide and improve our services. They enable essential functions and enhance your user experience.</p>
                <p><strong>Types of Cookies:</strong> We use session cookies, persistent cookies, and third-party cookies for different purposes.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">2. How We Use Cookies</h3>
              <div className="space-y-3 text-sm">
                <p><strong>Essential Cookies:</strong> Required for basic platform functionality, including authentication and security.</p>
                <p><strong>Analytics Cookies:</strong> Help us understand how users interact with our platform to improve our services.</p>
                <p><strong>Preference Cookies:</strong> Remember your settings and preferences for a personalized experience.</p>
                <p><strong>Marketing Cookies:</strong> Used for targeted advertising and marketing campaigns (with your consent).</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">3. Cookie Management</h3>
              <div className="space-y-3 text-sm">
                <p><strong>Browser Settings:</strong> You can control cookies through your browser settings, though this may affect platform functionality.</p>
                <p><strong>Opt-Out Options:</strong> You can opt out of non-essential cookies through our cookie consent banner.</p>
                <p><strong>Third-Party Cookies:</strong> Third-party services may set their own cookies, subject to their privacy policies.</p>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">4. Updates to This Policy</h3>
              <div className="space-y-3 text-sm">
                <p>We may update this cookie policy from time to time. Changes will be posted on this page with an updated revision date.</p>
                <p>For questions about our cookie policy, please contact us through our support channels.</p>
              </div>
            </section>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}; 