import React from 'react';

const Logo = ({ size = 'default', className = '', showText = true, isExpanded = true }) => {
  const sizeClasses = {
    small: 'h-8 w-8',
    default: 'h-10 w-10',
    large: 'h-12 w-12'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={process.env.PUBLIC_URL + '/images/logo-gestfrota.svg'} 
        alt="GestFrota Logo" 
        className={`${sizeClasses[size]}`}
        onError={(e) => { e.currentTarget.src = process.env.PUBLIC_URL + '/favicon.svg'; }}
      />
      {showText && isExpanded && (
        <span className="ml-3 text-xl font-bold">
          <span className="text-gray-800">Gest</span>
          <span className="text-red-600">Frota</span>
        </span>
      )}
    </div>
  );
};

export default Logo;