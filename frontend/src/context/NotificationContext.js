import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, Car, Settings, AlertTriangle } from 'lucide-react';
import { useApp } from './AppContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { state } = useApp();

  // Hidratar do localStorage ao montar
  useEffect(() => {
    try {
      const raw = localStorage.getItem('notifications');
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved)) {
          setNotifications(saved);
        }
      }
    } catch (e) {
      console.warn('Falha ao carregar notificações do storage:', e);
    }
  }, []);

  // Persistir no localStorage sempre que mudar
  useEffect(() => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (e) {
      console.warn('Falha ao salvar notificações no storage:', e);
    }
  }, [notifications]);

  // Função para adicionar nova notificação
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(), // Garantir ID único
      timestamp: Date.now(),
      time: 'Agora',
      unread: true,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  // Função para marcar notificação como lida
  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, unread: false }
          : notification
      )
    );
  }, []);

  // Função para marcar todas como lidas
  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, unread: false }))
    );
  }, []);

  // Função para remover notificação
  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId));
  }, []);

  // Função para limpar todas as notificações
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Função para adicionar notificação de novo serviço
  const addServiceNotification = useCallback((serviceData, isEdit = false) => {
    const action = isEdit ? 'atualizado' : 'criado';
    const actionTitle = isEdit ? 'Serviço Atualizado' : 'Novo Serviço Criado';
    
    addNotification({
      type: 'service',
      title: actionTitle,
      message: `Serviço ${serviceData.description || `#${serviceData.id}`} foi ${action} com sucesso`,
      icon: Settings,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    });
  }, [addNotification]);

  // Função para adicionar notificação de exclusão de serviço
  const addServiceDeleteNotification = useCallback((serviceData) => {
    addNotification({
      type: 'service_delete',
      title: 'Serviço Excluído',
      message: `Serviço ${serviceData.description || `#${serviceData.id}`} foi excluído com sucesso`,
      icon: Settings,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    });
  }, [addNotification]);

  // Função para adicionar notificação de novo cliente
  const addClientNotification = useCallback((clientData, isEdit = false) => {
    const action = isEdit ? 'atualizado' : 'cadastrado';
    const actionTitle = isEdit ? 'Cliente Atualizado' : 'Novo Cliente Cadastrado';
    
    addNotification({
      type: 'client',
      title: actionTitle,
      message: `Cliente ${clientData.name} foi ${action} com sucesso`,
      icon: User,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    });
  }, [addNotification]);

  // Função para adicionar notificação de exclusão de cliente
  const addClientDeleteNotification = useCallback((clientData) => {
    addNotification({
      type: 'client_delete',
      title: 'Cliente Excluído',
      message: `Cliente ${clientData.name} foi excluído com sucesso`,
      icon: User,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    });
  }, [addNotification]);

  // Função para adicionar notificação de novo veículo
  const addVehicleNotification = useCallback((vehicleData, isEdit = false) => {
    const action = isEdit ? 'atualizado' : 'cadastrado';
    const actionTitle = isEdit ? 'Veículo Atualizado' : 'Novo Veículo Cadastrado';
    
    addNotification({
      type: 'vehicle',
      title: actionTitle,
      message: `Veículo ${vehicleData.plate || vehicleData.model} foi ${action} com sucesso`,
      icon: Car,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    });
  }, [addNotification]);

  // Função para adicionar notificação de exclusão de veículo
  const addVehicleDeleteNotification = useCallback((vehicleData) => {
    addNotification({
      type: 'vehicle_delete',
      title: 'Veículo Excluído',
      message: `Veículo ${vehicleData.plate || vehicleData.model} foi excluído com sucesso`,
      icon: Car,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    });
  }, [addNotification]);

  // Função para adicionar notificação de serviço com data de saída ultrapassada
  const addOverdueServiceNotification = useCallback((serviceData) => {
    const exitDate = new Date(serviceData.exitDate);
    const today = new Date();
    const daysOverdue = Math.ceil((today - exitDate) / (1000 * 60 * 60 * 24));
    
    addNotification({
      type: 'overdue_service',
      title: 'Serviço com Data Ultrapassada',
      message: `Serviço ${serviceData.description || `#${serviceData.id}`} deveria ter saído há ${daysOverdue} dia(s)`,
      icon: AlertTriangle,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50'
    });
  }, [addNotification]);

  // Função para verificar serviços com data de saída ultrapassada
  const checkOverdueServices = useCallback((services) => {
    // Não fazer nada se não há serviços
    if (!services || services.length === 0) {
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    services.forEach(service => {
      if (service.exitDate && service.paymentStatus !== 'paid') {
        const exitDate = new Date(service.exitDate);
        exitDate.setHours(0, 0, 0, 0);
        
        if (exitDate < today) {
          // Verificar se já existe notificação para este serviço usando uma função que não depende do estado atual
          setNotifications(currentNotifications => {
            const existingNotification = currentNotifications.find(
              n => n.type === 'overdue_service' && n.message.includes(`#${service.id}`)
            );
            
            if (!existingNotification) {
              // Criar nova notificação diretamente
              const newNotification = {
                id: Date.now() + Math.random(),
                timestamp: Date.now(),
                time: 'Agora',
                unread: true,
                type: 'overdue_service',
                title: 'Serviço em Atraso',
                message: `Serviço #${service.id} está com a data de saída ultrapassada`,
                icon: AlertTriangle,
                color: 'text-amber-500',
                bgColor: 'bg-amber-50'
              };
              
              return [newNotification, ...currentNotifications];
            }
            
            return currentNotifications;
          });
        }
      }
    });
  }, []);

  // Calcular contador de não lidas
  const unreadCount = notifications.filter(n => n.unread).length;

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    addServiceNotification,
    addServiceDeleteNotification,
    addClientNotification,
    addClientDeleteNotification,
    addVehicleNotification,
    addVehicleDeleteNotification,
    addOverdueServiceNotification,
    checkOverdueServices
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};