import { toast as sonnerToast, type ToasterProps } from 'sonner';

type ToastVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onDismiss?: () => void;
  onAutoClose?: () => void;
}

export const toast = (options: ToastOptions) => {
  const { variant = 'default', duration = 5000, ...rest } = options;

  const toastFn = variant === 'destructive' 
    ? sonnerToast.error 
    : variant === 'success'
    ? sonnerToast.success
    : variant === 'warning'
    ? sonnerToast.warning
    : variant === 'info'
    ? sonnerToast.info
    : sonnerToast;

  return toastFn(options.title, {
    description: options.description,
    duration,
    action: options.action && {
      label: options.action.label,
      onClick: options.action.onClick,
    },
    onDismiss: options.onDismiss,
    onAutoClose: options.onAutoClose,
  });
};

export function useToast() {
  return {
    toast,
    dismiss: sonnerToast.dismiss,
    dismissAll: sonnerToast.dismiss,
  };
}
