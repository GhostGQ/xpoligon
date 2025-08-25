import React from 'react';

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  title?: string;
  className?: string;
}

const variantStyles = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white',
  secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  warning: 'bg-orange-500 hover:bg-orange-600 text-white',
};

const sizeStyles = {
  sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-1',
  lg: 'px-4 py-2 text-lg',
};

export const Button: React.FC<ButtonProps> = ({
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  title,
  className = '',
}) => {
  const variantClass = variantStyles[variant];
  const sizeClass = sizeStyles[size];
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`${variantClass} ${sizeClass} rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
};
