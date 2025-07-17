import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('sonner', () => {
  const toastFn = vi.fn() as any;
  toastFn.error = vi.fn();
  toastFn.success = vi.fn();
  toastFn.warning = vi.fn();
  toastFn.info = vi.fn();
  toastFn.dismiss = vi.fn();
  return {
    toast: toastFn,
    dismiss: toastFn.dismiss,
  };
});

import { toast, useToast } from '../hooks/use-toast';
import * as sonnerImport from 'sonner';
const sonner = sonnerImport as any;

describe('toast', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls sonner.toast for default variant', () => {
    toast({ title: 'Hello' });
    expect(sonner.toast).toHaveBeenCalledWith('Hello', expect.any(Object));
  });
  it('calls sonner.toast.error for destructive variant', () => {
    toast({ title: 'Oops', variant: 'destructive' });
    expect(sonner.toast.error).toHaveBeenCalledWith('Oops', expect.any(Object));
  });
  it('calls sonner.toast.success for success variant', () => {
    toast({ title: 'Yay', variant: 'success' });
    expect(sonner.toast.success).toHaveBeenCalledWith('Yay', expect.any(Object));
  });
  it('calls sonner.toast.warning for warning variant', () => {
    toast({ title: 'Warn', variant: 'warning' });
    expect(sonner.toast.warning).toHaveBeenCalledWith('Warn', expect.any(Object));
  });
  it('calls sonner.toast.info for info variant', () => {
    toast({ title: 'Info', variant: 'info' });
    expect(sonner.toast.info).toHaveBeenCalledWith('Info', expect.any(Object));
  });
});

describe('useToast', () => {
  it('returns toast, dismiss, and dismissAll', () => {
    const api = useToast();
    expect(typeof api.toast).toBe('function');
    expect(typeof api.dismiss).toBe('function');
    expect(typeof api.dismissAll).toBe('function');
  });
}); 