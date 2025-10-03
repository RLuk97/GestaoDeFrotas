import React, { useEffect } from 'react';
import { AppProvider, useApp } from './AppContext';
import { NotificationProvider, useNotifications } from './NotificationContext';

// Componente interno que usa ambos os contextos
function AppWithNotificationsInner({ children }) {
  const { state } = useApp();
  const { checkOverdueServices } = useNotifications();

  // Verificar serviços com data de saída ultrapassada sempre que os serviços mudarem
  useEffect(() => {
    // Só executar se há serviços cadastrados
    if (state.services && state.services.length > 0) {
      checkOverdueServices(state.services);
    }
  }, [state.services, checkOverdueServices]);

  // Verificação periódica a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(() => {
      // Só executar se há serviços cadastrados
      if (state.services && state.services.length > 0) {
        checkOverdueServices(state.services);
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [state.services, checkOverdueServices]);

  return children;
}

// Componente wrapper principal
export function AppWithNotifications({ children }) {
  return (
    <AppProvider>
      <NotificationProvider>
        <AppWithNotificationsInner>
          {children}
        </AppWithNotificationsInner>
      </NotificationProvider>
    </AppProvider>
  );
}

export default AppWithNotifications;