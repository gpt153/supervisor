import React from 'react';

export interface ButtonProps {
  /**
   * Button label
   */
  label: string;
  /**
   * Button variant
   */
  variant?: 'primary' | 'secondary' | 'outline';
  /**
   * Button size
   */
  size?: 'small' | 'medium' | 'large';
  /**
   * Optional click handler
   */
  onClick?: () => void;
}

/**
 * Primary UI component for user interaction
 */
export const Button = ({
  variant = 'primary',
  size = 'medium',
  label,
  onClick,
}: ButtonProps) => {
  const baseStyles = 'font-sans font-semibold rounded cursor-pointer inline-block transition-colors';

  const variantStyles = {
    primary: 'text-white bg-blue-600 hover:bg-blue-700',
    secondary: 'text-white bg-gray-600 hover:bg-gray-700',
    outline: 'text-blue-600 bg-white border-2 border-blue-600 hover:bg-blue-50',
  };

  const sizeStyles = {
    small: 'text-sm py-2 px-4',
    medium: 'text-base py-3 px-6',
    large: 'text-lg py-4 px-8',
  };

  return (
    <button
      type="button"
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]}`}
      onClick={onClick}
    >
      {label}
    </button>
  );
};
