import React from 'react';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'dots';
  message?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  variant = 'spinner',
  message,
  fullScreen = false,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
  };

  const container = fullScreen
    ? 'fixed inset-0 flex items-center justify-center bg-black/50 z-50'
    : 'flex items-center justify-center';

  return (
    <div className={container}>
      <div className="flex flex-col items-center gap-4">
        {variant === 'spinner' && (
          <svg
            className={`${sizeClasses[size]} animate-spin text-blue-400`}
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {variant === 'dots' && (
          <div className="flex gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-100" />
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200" />
          </div>
        )}

        {message && <p className="text-gray-400 text-sm">{message}</p>}
      </div>
    </div>
  );
};

Loading.displayName = 'Loading';

/**
 * Skeleton component for loading states
 */
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  count?: number;
  height?: string;
  width?: string;
  circle?: boolean;
}

export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ count = 1, height = 'h-4', width = 'w-full', circle = false, className, ...props }, ref) => {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            ref={i === 0 ? ref : null}
            className={`${width} ${height} bg-gray-800 ${
              circle ? 'rounded-full' : 'rounded'
            } animate-pulse ${i > 0 ? 'mt-2' : ''} ${className || ''}`}
            {...props}
          />
        ))}
      </>
    );
  }
);

Skeleton.displayName = 'Skeleton';
