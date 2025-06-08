
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Users } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string, role: 'client' | 'helper') => void;
  onSignup: (email: string, password: string, name: string, role: 'client' | 'helper') => void;
}

const AuthModal = ({ isOpen, onClose, onLogin, onSignup }: AuthModalProps) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'login' | 'signup' | 'role-select'>('role-select');
  const [selectedRole, setSelectedRole] = useState<'client' | 'helper' | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleRoleSelect = (role: 'client' | 'helper') => {
    setSelectedRole(role);
    setMode('login');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    if (mode === 'login') {
      onLogin(formData.email, formData.password, selectedRole);
    } else {
      onSignup(formData.email, formData.password, formData.name, selectedRole);
    }
    
    // Reset form
    setFormData({ email: '', password: '', name: '' });
    setMode('role-select');
    setSelectedRole(null);
    onClose();
  };

  const resetModal = () => {
    setMode('role-select');
    setSelectedRole(null);
    setFormData({ email: '', password: '', name: '' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        {mode === 'role-select' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-gray-900">
                {t('auth.joinTitle')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-center text-gray-600">
                {t('auth.chooseRole')}
              </p>
              
              <div className="grid grid-cols-1 gap-4">
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-orange-300"
                  onClick={() => handleRoleSelect('client')}
                >
                  <CardHeader className="text-center pb-3">
                    <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <User className="text-orange-600" size={32} />
                    </div>
                    <CardTitle className="text-lg">{t('auth.client')}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-gray-600">
                      {t('auth.clientDesc')}
                    </p>
                  </CardContent>
                </Card>

                <Card 
                  className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-orange-300"
                  onClick={() => handleRoleSelect('helper')}
                >
                  <CardHeader className="text-center pb-3">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Users className="text-blue-600" size={32} />
                    </div>
                    <CardTitle className="text-lg">{t('auth.helper')}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-sm text-gray-600">
                      {t('auth.helperDesc')}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {(mode === 'login' || mode === 'signup') && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-gray-900">
                {mode === 'login' ? t('auth.login') : t('auth.signup')} as {selectedRole === 'client' ? t('auth.client') : t('auth.helper')}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <Label htmlFor="name">{t('auth.fullName')}</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t('auth.fullName')}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="email">{t('auth.email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('auth.email')}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="password">{t('auth.password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('auth.password')}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                {mode === 'login' ? t('auth.login') : t('auth.createAccount')}
              </Button>
              
              <div className="text-center space-y-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-orange-600 hover:text-orange-700"
                >
                  {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}
                </Button>
                
                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {t('auth.backToRole')}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
