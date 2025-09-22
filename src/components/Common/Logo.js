import React from 'react';

const Logo = ({ size = 'default', className = '', showText = true, isExpanded = true }) => {
  const sizeClasses = {
    small: 'h-8',
    default: 'h-10',
    large: 'h-14'
  };

  return (
    <div className={`flex items-center ${className}`}>
      {/* Ícone de Localização GPS com Veículo */}
      <div className={`${sizeClasses[size]} flex-shrink-0`}>
        <svg width="60" height="60" viewBox="0 0 100 100" className={`${sizeClasses[size]} ${className}`}>
          <defs>
            {/* Gradientes para efeitos realistas */}
            <linearGradient id="pinGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="50%" stopColor="#3730a3" />
              <stop offset="100%" stopColor="#1e1b4b" />
            </linearGradient>
            
            <linearGradient id="vehicleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="50%" stopColor="#f3f4f6" />
              <stop offset="100%" stopColor="#d1d5db" />
            </linearGradient>
            
            <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#4f46e5" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
            </radialGradient>
            
            <filter id="dropShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="2" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.2"/>
            </filter>
            
            <filter id="innerGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          {/* Glow effect de fundo */}
          <circle cx="50" cy="45" r="35" fill="url(#glowGradient)" />
          
          {/* Pin de localização principal */}
          <path 
            d="M 50 15 C 40 15 32 23 32 33 C 32 45 50 65 50 65 C 50 65 68 45 68 33 C 68 23 60 15 50 15 Z" 
            fill="url(#pinGradient)" 
            filter="url(#dropShadow)"
          />
          
          {/* Círculo interno do pin */}
          <circle 
            cx="50" 
            cy="33" 
            r="12" 
            fill="#ffffff" 
            opacity="0.9"
          />
          
          {/* Veículo integrado no pin */}
          <g transform="translate(50, 33) scale(0.8)">
            {/* Carroceria do veículo */}
            <rect 
              x="-8" 
              y="-4" 
              width="16" 
              height="8" 
              rx="2" 
              fill="url(#vehicleGradient)" 
              stroke="#6b7280" 
              strokeWidth="0.5"
            />
            
            {/* Cabine */}
            <rect 
              x="-6" 
              y="-6" 
              width="8" 
              height="4" 
              rx="1" 
              fill="url(#vehicleGradient)" 
              stroke="#6b7280" 
              strokeWidth="0.5"
            />
            
            {/* Para-brisa */}
            <rect 
              x="-5" 
              y="-5.5" 
              width="6" 
              height="2" 
              rx="0.5" 
              fill="#e5e7eb" 
              opacity="0.8"
            />
            
            {/* Rodas */}
            <circle cx="-5" cy="3" r="1.5" fill="#374151" />
            <circle cx="5" cy="3" r="1.5" fill="#374151" />
            <circle cx="-5" cy="3" r="1" fill="#6b7280" />
            <circle cx="5" cy="3" r="1" fill="#6b7280" />
            
            {/* Detalhes do veículo */}
            <rect x="-7" y="-1" width="2" height="1" fill="#fbbf24" opacity="0.8" />
            <rect x="5" y="-1" width="2" height="1" fill="#ef4444" opacity="0.8" />
          </g>
          
          {/* Brilho no pin */}
          <ellipse 
            cx="45" 
            cy="25" 
            rx="3" 
            ry="6" 
            fill="#ffffff" 
            opacity="0.4" 
            transform="rotate(-20 45 25)"
          />
          
          {/* Indicadores de sinal GPS */}
          <g opacity="0.6">
            <circle cx="25" cy="25" r="2" fill="#4f46e5" opacity="0.3">
              <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="75" cy="25" r="2" fill="#4f46e5" opacity="0.3">
              <animate attributeName="r" values="2;4;2" dur="2s" begin="0.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" begin="0.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="30" cy="70" r="2" fill="#4f46e5" opacity="0.3">
              <animate attributeName="r" values="2;4;2" dur="2s" begin="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" begin="1s" repeatCount="indefinite" />
            </circle>
          </g>
          
          {/* Ondas de sinal */}
          <g opacity="0.4" transform="translate(50, 80)">
            <path d="M -10 0 Q 0 -5 10 0" stroke="#4f46e5" strokeWidth="1" fill="none" opacity="0.6" />
            <path d="M -15 3 Q 0 -8 15 3" stroke="#4f46e5" strokeWidth="1" fill="none" opacity="0.4" />
            <path d="M -20 6 Q 0 -12 20 6" stroke="#4f46e5" strokeWidth="1" fill="none" opacity="0.2" />
          </g>
        </svg>
      </div>
      
      {/* Texto GestFrota */}
      {showText && (
        <div className="ml-1">
          <span className="text-xl font-bold tracking-tight">
            <span className={isExpanded ? "text-gray-800" : "text-white"}>Gest</span>
            <span className="text-red-600">Frota</span>
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;