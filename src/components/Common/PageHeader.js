import React from 'react';
import { Bell, Search, User, Settings } from 'lucide-react';

const PageHeader = ({ title, subtitle, showSearch = true, showNotifications = true, showUserMenu = true }) => {
  return (
    <div className="sticky top-0 z-30 bg-brand-primary border-b border-primary-700 shadow-sm h-16">
      <div className="px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Título da página */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-semibold text-white truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-primary-100 mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>

          {/* Ações do header */}
          <div className="flex items-center space-x-4">
            
            {/* Barra de pesquisa */}
            {showSearch && (
              <div className="hidden md:block">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-primary-300" />
                  </div>
                  <input
                    type="text"
                    placeholder="Pesquisar..."
                    className="block w-full pl-10 pr-3 py-2 border border-primary-400 rounded-md leading-5 bg-white/10 backdrop-blur-sm placeholder-primary-200 text-white focus:outline-none focus:placeholder-primary-100 focus:ring-1 focus:ring-white focus:border-white text-sm"
                  />
                </div>
              </div>
            )}

            {/* Notificações */}
            {showNotifications && (
              <button className="p-2 text-primary-100 hover:text-white hover:bg-primary-700 rounded-full transition-colors">
                <Bell className="h-5 w-5" />
              </button>
            )}

            {/* Menu do usuário */}
            {showUserMenu && (
              <div className="flex items-center space-x-3">
                <button className="p-2 text-primary-100 hover:text-white hover:bg-primary-700 rounded-full transition-colors">
                  <Settings className="h-5 w-5" />
                </button>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-white">Administrador</p>
                    <p className="text-xs text-primary-100">Sistema</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;