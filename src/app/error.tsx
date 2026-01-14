'use client';

import { useEffect } from 'react';
import { Card } from '@/components/ui/Card';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Global error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-950 py-12 px-4 flex items-center justify-center">
      <Card className="text-center max-w-md">
        <div className="text-5xl mb-4">😔</div>
        <h1 className="text-2xl font-bold text-white mb-2">Oops! Something Went Wrong</h1>
        <p className="text-gray-400 mb-2">
          {error.message || 'An unexpected error occurred while processing your request'}
        </p>
        {error.digest && (
          <p className="text-xs text-gray-500 mb-6 break-all">Error ID: {error.digest}</p>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
          >
            Try Again
          </button>
          <a
            href="/"
            className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-semibold"
          >
            Back to Home
          </a>
        </div>
      </Card>
    </div>
  );
}
