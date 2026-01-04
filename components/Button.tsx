import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
  
  const variants = {
    primary: "bg-brand-600 hover:bg-brand-500 text-white shadow-lg shadow-brand-900/50 focus:ring-brand-500",
    secondary: "bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600 focus:ring-slate-500",
    danger: "bg-red-600 hover:bg-red-500 text-white focus:ring-red-500",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : (
        children
      )}
    </button>
  );
};