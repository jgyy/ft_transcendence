'use client';

import React, { useEffect, useRef, useState } from 'react';

interface DropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: 'left' | 'right';
}

export const Dropdown: React.FC<DropdownProps> = ({ trigger, children, align = 'right' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="focus:outline-none"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          className={`absolute top-full mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 min-w-max ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          role="menu"
        >
          {children}
        </div>
      )}
    </div>
  );
};

Dropdown.displayName = 'Dropdown';

interface DropdownItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
}

export const DropdownItem = React.forwardRef<HTMLButtonElement, DropdownItemProps>(
  ({ children, onClick, className, ...props }, ref) => (
    <button
      ref={ref}
      onClick={onClick}
      className={`w-full text-left px-4 py-2 text-sm text-gray-400 hover:bg-gray-700 hover:text-white transition-colors first:rounded-t-lg last:rounded-b-lg ${className || ''}`}
      role="menuitem"
      {...props}
    >
      {children}
    </button>
  )
);

DropdownItem.displayName = 'DropdownItem';
