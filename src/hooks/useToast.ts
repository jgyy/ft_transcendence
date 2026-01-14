'use client';

import { useToast as useBaseToast, ToastType } from '@/components/ui/Toast';

interface ShowToastOptions {
  type: ToastType;
  message: string;
}

export function useToast() {
  const { addToast } = useBaseToast();

  const showToast = ({ type, message }: ShowToastOptions) => {
    addToast(message, type);
  };

  return { showToast };
}
