import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay com gradiente moderno */}
        <div 
          className="fixed inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/70 to-slate-900/80 backdrop-blur-sm transition-all duration-300"
          onClick={onClose}
        />
        
        {/* Modal com design moderno */}
        <div className={`relative w-full ${sizeClasses[size]} transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all duration-300 scale-100 animate-in fade-in-0 zoom-in-95`}>
          {/* Header com a mesma cor do header principal */}
          <div className="relative bg-brand-primary px-6 py-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white drop-shadow-sm">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="group relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-sm"
              >
                <X className="h-5 w-5 text-white group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>
            {/* Decoração gradiente */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          </div>
          
          {/* Content com padding moderno */}
          <div className="p-6 bg-gradient-to-br from-slate-50/50 to-white">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;