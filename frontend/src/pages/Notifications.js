import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, X, CheckCircle } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, clearAllNotifications } = useNotifications();

  // Ao abrir a página de notificações, marcar todas como lidas
  useEffect(() => {
    if (notifications?.some(n => n.unread)) {
      markAllAsRead();
    }
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Notificações</h1>
        <button
          className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          onClick={() => navigate('/dashboard')}
        >
          <Bell className="h-4 w-4" />
          Voltar ao Dashboard
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            <span className="font-medium text-gray-900">Todas as Notificações</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={markAllAsRead}
            >
              Marcar todas como lidas
            </button>
            <span className="text-gray-300">|</span>
            <button
              className="text-sm text-red-600 hover:text-red-800"
              onClick={clearAllNotifications}
            >
              Limpar todas
            </button>
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p>Nenhuma notificação</p>
          </div>
        ) : (
          <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
            {notifications.map((notification) => {
              const IconComponent = notification.icon;
              return (
                <div
                  key={notification.id}
                  className={`flex items-start p-3 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors ${notification.unread ? 'bg-blue-50' : ''}`}
                >
                  <div className={`p-2 rounded-full ${notification.bgColor} mr-3`}>
                    {IconComponent ? <IconComponent className={`h-5 w-5 ${notification.color}`} /> : <Bell className="h-5 w-5 text-blue-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium ${notification.unread ? 'text-gray-900' : 'text-gray-700'}`}>{notification.title}</p>
                      {!notification.unread && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      className="text-xs text-blue-600 hover:text-blue-800"
                      onClick={() => markAsRead(notification.id)}
                    >
                      Marcar como lida
                    </button>
                    <X className="h-4 w-4 text-gray-300" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;