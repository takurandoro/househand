import { Toaster as SonnerToaster } from 'sonner';

export const Toaster = () => {
  return (
    <SonnerToaster
      position="bottom-right"
      theme="system"
      closeButton
      richColors
      toastOptions={{
        duration: 5000,
        className: 'group toast',
      }}
    />
  );
} 