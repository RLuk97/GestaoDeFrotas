import React, { createContext, useContext, useReducer, useEffect } from 'react';
import ApiService from '../services/api';
import { useNotifications } from './NotificationContext';

// Estado inicial - apenas estrutura vazia, dados serão carregados do backend
const initialState = {
  vehicles: [],
  clients: [],
  services: [],
  parts: []
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case 'SET_CLIENTS':
      return {
        ...state,
        clients: action.payload
      };
    
    case 'SET_VEHICLES':
      return {
        ...state,
        vehicles: action.payload
      };
    
    case 'SET_SERVICES':
      return {
        ...state,
        services: action.payload
      };
    
    case 'ADD_VEHICLE':
      return {
        ...state,
        vehicles: [...state.vehicles, action.payload] // Remover o Date.now() pois o ID vem do backend
      };
    
    case 'UPDATE_VEHICLE':
      return {
        ...state,
        vehicles: state.vehicles.map(vehicle =>
          vehicle.id === action.payload.id ? action.payload : vehicle
        )
      };
    
    case 'DELETE_VEHICLE':
      return {
        ...state,
        vehicles: state.vehicles.filter(vehicle => vehicle.id !== action.payload)
      };
    
    case 'ADD_CLIENT':
      return {
        ...state,
        clients: [...state.clients, action.payload] // Remover o Date.now() pois o ID vem do backend
      };
    
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(client =>
          client.id === action.payload.id ? action.payload : client
        )
      };
    
    case 'DELETE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter(client => client.id !== action.payload)
      };
    
    case 'ADD_SERVICE':
      // Apenas adiciona o serviço, não altera status do veículo
      return {
        ...state,
        services: [...state.services, action.payload]
      };
    
    case 'UPDATE_SERVICE':
      return {
        ...state,
        services: state.services.map(service =>
          service.id === action.payload.id ? action.payload : service
        )
      };
    
    case 'DELETE_SERVICE':
      return {
        ...state,
        services: state.services.filter(service => service.id !== action.payload)
      };
    
    case 'ADD_PART':
      return {
        ...state,
        parts: [...state.parts, action.payload] // Remover o Date.now() pois o ID vem do backend
      };
    
    case 'UPDATE_PART':
      return {
        ...state,
        parts: state.parts.map(part =>
          part.id === action.payload.id ? action.payload : part
        )
      };
    
    case 'DELETE_PART':
      return {
        ...state,
        parts: state.parts.filter(part => part.id !== action.payload)
      };
    
    default:
      return state;
  }
}

// Context
const AppContext = createContext();

// Provider
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Carregar dados do backend quando o componente for montado
  useEffect(() => {
    const loadData = async () => {
      console.log('=== AppContext Debug - Iniciando carregamento ===');
      try {
        // Carregar clientes
        console.log('Carregando clientes...');
        const clients = await ApiService.getClients();
        console.log('Clientes carregados:', clients);
        dispatch({ type: 'SET_CLIENTS', payload: Array.isArray(clients) ? clients : [] });

        // Carregar veículos
        console.log('Carregando veículos...');
        const vehicles = await ApiService.getVehicles();
        console.log('Veículos carregados:', vehicles);
        dispatch({ type: 'SET_VEHICLES', payload: Array.isArray(vehicles) ? vehicles : [] });

        // Carregar serviços
        console.log('Carregando serviços...');
        const services = await ApiService.getServices();
        console.log('Serviços carregados:', services);
        dispatch({ type: 'SET_SERVICES', payload: Array.isArray(services) ? services : [] });
        
        console.log('=== AppContext Debug - Carregamento concluído ===');
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        // Em caso de erro, garantir que os arrays estejam vazios
        dispatch({ type: 'SET_CLIENTS', payload: [] });
        dispatch({ type: 'SET_VEHICLES', payload: [] });
        dispatch({ type: 'SET_SERVICES', payload: [] });
      }
    };

    loadData();
  }, []);

  // Funções auxiliares
  const getVehicleById = (id) => state.vehicles.find(v => v.id === id);
  const getClientById = (id) => state.clients.find(c => c.id === id);
  const getServiceById = (id) => state.services.find(s => s.id === id);
  const getPartById = (id) => state.parts.find(p => p.id === id);
  
  const getVehiclesByClient = (clientId) => 
    state.vehicles.filter(v => v.clientId === clientId);
  
  const getServicesByVehicle = (vehicleId) => 
    state.services.filter(s => s.vehicleId === vehicleId);
  
  const getServicesInProgress = () => 
    state.services.filter(s => 
      s.paymentStatus === 'pending' || 
      s.paymentStatus === 'in_progress'
    );
  
  const getPendingPayments = () => 
    state.services.filter(s => s.paymentStatus === 'pending' || s.paymentStatus === 'partial');

  // Função para recarregar dados de veículos
  const refreshVehicles = async () => {
    try {
      console.log('Recarregando dados de veículos...');
      const vehicles = await ApiService.getVehicles();
      console.log('Veículos recarregados:', vehicles);
      dispatch({ type: 'SET_VEHICLES', payload: Array.isArray(vehicles) ? vehicles : [] });
    } catch (error) {
      console.error('Erro ao recarregar veículos:', error);
    }
  };

  const value = {
    state,
    dispatch,
    // Funções auxiliares
    getVehicleById,
    getClientById,
    getServiceById,
    getPartById,
    getVehiclesByClient,
    getServicesByVehicle,
    getServicesInProgress,
    getPendingPayments,
    // Função para refresh
    refreshVehicles
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

// Hook personalizado
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp deve ser usado dentro de um AppProvider');
  }
  return context;
}

export default AppContext;