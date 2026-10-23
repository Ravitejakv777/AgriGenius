import React from 'react';

interface AgriGeniusLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  alt?: string;
}

export const AgriGeniusLogo: React.FC<AgriGeniusLogoProps> = ({
  className = '',
  size = 'md',
  alt = 'AgriGenius Logo'
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-8 h-8 sm:w-9 sm:h-9',
    lg: 'w-10 h-10 sm:w-12 sm:h-12'
  };

  return (
    <img
      src="/logo.png"
      alt={alt}
      className={`${sizeClasses[size]} object-contain rounded-xl shadow-sm transition-transform duration-200 select-none ${className}`}
      loading="eager"
    />
  );
};
