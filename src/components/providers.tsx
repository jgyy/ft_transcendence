'use client';

import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/components/ui/Toast';
import { ChatButton } from '@/components/chat/ChatButton';
import React from 'react';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <ToastProvider>
        {children}
        <ChatButton />
      </ToastProvider>
    </SessionProvider>
  );
}
