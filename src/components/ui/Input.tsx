import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={props.id}
            className="block text-sm font-medium text-gray-300 mb-1"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-2 bg-gray-800 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
            error ? 'border-red-500' : 'border-gray-700'
          } ${className || ''}`}
          {...props}
        />
        {error && <p className="text-red-400 text-sm mt-1">{error}</p>}
        {helperText && !error && (
          <p className="text-gray-400 text-xs mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
