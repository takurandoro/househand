import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Users, Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string, role: 'client' | 'helper') => Promise<void>;
  onSignup: (email: string, password: string, name: string, role: 'client' | 'helper') => Promise<void>;
  defaultRole?: 'client' | 'helper';
}

const AuthModal = ({ isOpen, onClose, onLogin, onSignup, defaultRole }: AuthModalProps) => {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'role' | 'login' | 'signup'>('role');
  const [selectedRole, setSelectedRole] = useState<'client' | 'helper'>(defaultRole || 'client');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    if (defaultRole) {
      setSelectedRole(defaultRole);
      setMode('login');
    } else {
      setMode('role');
    }
  }, [defaultRole, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (mode === 'login') {
        await onLogin(formData.email, formData.password, selectedRole);
      } else {
        await onSignup(formData.email, formData.password, formData.name, selectedRole);
      }
      onClose();
      setFormData({ name: '', email: '', password: '' });
      setMode('role');
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        {mode === 'role' && (
          <>
            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-gray-900">
                {t('auth.joinTitle')}
              </DialogTitle>
            </DialogHeader>
            
            <div className="mt-4 space-y-4">
              <p className="text-center text-gray-600">{t('auth.chooseRole')}</p>
              
              <button
                onClick={() => {
                  setSelectedRole('client');
                  setMode('login');
                }}
                className="w-full p-4 border rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <User className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{t('auth.client')}</h3>
                    <p className="text-sm text-gray-600">{t('auth.clientDesc')}</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => {
                  setSelectedRole('helper');
                  setMode('login');
                }}
                className="w-full p-4 border rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="bg-orange-100 p-3 rounded-full">
                    <Calendar className="w-6 h-6 text-orange-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{t('auth.helper')}</h3>
                    <p className="text-sm text-gray-600">{t('auth.helperDesc')}</p>
                  </div>
                </div>
              </button>
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
                <button
                  type="button"
                  onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  {mode === 'login' ? t('auth.noAccount') : t('auth.hasAccount')}
                </button>
                {!defaultRole && (
                  <button
                    type="button"
                    onClick={() => setMode('role')}
                    className="block w-full text-sm text-gray-500 hover:text-gray-700"
                  >
                    {t('auth.backToRole')}
                  </button>
                )}
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
