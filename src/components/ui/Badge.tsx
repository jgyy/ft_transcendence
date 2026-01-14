import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  children: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'neutral',
      size = 'md',
      dot = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'font-medium rounded-full inline-flex items-center justify-center gap-1';

    const variantStyles = {
      primary: 'bg-blue-900/50 text-blue-400 border border-blue-800',
      success: 'bg-green-900/50 text-green-400 border border-green-800',
      warning: 'bg-yellow-900/50 text-yellow-400 border border-yellow-800',
      danger: 'bg-red-900/50 text-red-400 border border-red-800',
      neutral: 'bg-gray-800/50 text-gray-400 border border-gray-700',
    };

    const sizeStyles = {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-1.5 text-base',
    };

    return (
      <span
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`}
        {...props}
      >
        {dot && (
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              {
                primary: 'bg-blue-400',
                success: 'bg-green-400',
                warning: 'bg-yellow-400',
                danger: 'bg-red-400',
                neutral: 'bg-gray-400',
              }[variant]
            }`}
          />
        )}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';
