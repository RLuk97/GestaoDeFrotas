import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, User, Settings, X, AlertTriangle, Wrench, DollarSign, FileText, Clock } from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';

const PageHeader = ({ title, subtitle, showSearch = false, showNotifications = true, showUserMenu = true }) => {
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const navigate = useNavigate();
  
  // Usar o contexto de notificações
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
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
              <div className="relative">
                <button 
                  className="p-2 text-primary-100 hover:text-white hover:bg-primary-700 rounded-full transition-colors relative"
                  onClick={() => {
                    setShowNotificationDropdown(!showNotificationDropdown);
                    // Marcar todas as notificações como lidas quando abrir o dropdown
                    if (!showNotificationDropdown && unreadCount > 0) {
                      markAllAsRead();
                    }
                  }}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Dropdown de Notificações */}
                {showNotificationDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Notificações</h3>
                        <button
                          onClick={() => setShowNotificationDropdown(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500">
                          <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                          <p>Nenhuma notificação</p>
                        </div>
                      ) : (
                        notifications.map((notification) => {
                          const IconComponent = notification.icon;
                          return (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                                notification.unread ? 'bg-blue-50' : ''
                              }`}
                              onClick={() => markAsRead(notification.id)}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`p-2 rounded-full ${notification.bgColor}`}>
                                  <IconComponent className={`h-4 w-4 ${notification.color}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className={`text-sm font-medium ${
                                      notification.unread ? 'text-gray-900' : 'text-gray-700'
                                    }`}>
                                      {notification.title}
                                    </p>
                                    {notification.unread && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {notification.time}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    
                    {notifications.length > 0 && (
                      <div className="p-3 border-t border-gray-200">
                        <button
                          className="w-full text-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                          onClick={() => {
                            setShowNotificationDropdown(false);
                            navigate('/notifications');
                          }}
                        >
                          Ver todas as notificações
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
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