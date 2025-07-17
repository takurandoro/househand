import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { getStorageUrl } from "@/integrations/supabase/client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('rw-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export function getAvatarUrl(avatarUrl: string | null, name: string | null): string {
  console.log('getAvatarUrl input:', { avatarUrl, name });
  
  // Generate a consistent seed for DiceBear
  const getSeed = () => {
    return name ? encodeURIComponent(name) : Math.random().toString(36).substring(7);
  };

  // Generate DiceBear URL
  const getDiceBearUrl = (seed: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=orange`;
  };

  if (!avatarUrl) {
    const fallbackUrl = getDiceBearUrl(getSeed());
    console.log('Using DiceBear fallback:', fallbackUrl);
    return fallbackUrl;
  }
  
  // If the URL is already a full URL, return it as is
  if (avatarUrl.startsWith('http://') || avatarUrl.startsWith('https://')) {
    console.log('Using direct URL:', avatarUrl);
    return avatarUrl;
  }
  
  // If it's a storage URL, get the full URL
  const storageUrl = getStorageUrl(avatarUrl);
  console.log('Storage URL result:', storageUrl);
  
  if (!storageUrl) {
    // If we couldn't get a storage URL, use DiceBear as fallback
    const fallbackUrl = getDiceBearUrl(getSeed());
    console.log('Using DiceBear fallback after storage URL failed:', fallbackUrl);
    return fallbackUrl;
  }

  return storageUrl;
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return 'H';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return 'H';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
