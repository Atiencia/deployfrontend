import React from 'react';
import { LoadingSpinner } from './LoadingComponents';

interface LoadingButtonProps {
  children: React.ReactNode;
  loading: boolean;
  loadingText?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

const variantClasses = {
  primary: 'bg-red-800 text-white hover:bg-red-900',
  secondary: 'bg-gray-500 text-white hover:bg-gray-600',
  danger: 'bg-red-600 text-white hover:bg-red-700'
};

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  loading,
  loadingText = 'Cargando...',
  disabled = false,
  onClick,
  type = 'button',
  className = '',
  variant = 'primary'
}) => {
  return (
    <button
      type={type}
      disabled={loading || disabled}
      onClick={onClick}
      className={`
        px-6 py-3 font-bold rounded-md transition-colors
        flex items-center justify-center gap-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${className}
      `}
    >
      {loading && <LoadingSpinner size="sm" message="" />}
      {loading ? loadingText : children}
    </button>
  );
};