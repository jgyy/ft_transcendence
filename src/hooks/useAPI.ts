'use client';

import { useState, useCallback } from 'react';
import { handleAPIError, getErrorMessage } from '@/lib/api-error';
import { useToast } from './useToast';

interface UseAPIOptions {
  showErrorToast?: boolean;
  showSuccessToast?: boolean;
  successMessage?: string;
}

export function useAPI() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(
    async <T,>(
      url: string,
      options?: RequestInit & UseAPIOptions
    ): Promise<T | null> => {
      const {
        showErrorToast = true,
        showSuccessToast = false,
        successMessage,
        ...fetchOptions
      } = options || {};

      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...fetchOptions.headers,
          },
          ...fetchOptions,
        });

        if (!response.ok) {
          await handleAPIError(response);
        }

        const data = (await response.json()) as T;

        if (showSuccessToast && successMessage) {
          showToast({
            type: 'success',
            message: successMessage,
          });
        }

        return data;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        setError(errorMessage);

        if (showErrorToast) {
          showToast({
            type: 'error',
            message: errorMessage,
          });
        }

        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [showToast]
  );

  return { request, isLoading, error };
}
