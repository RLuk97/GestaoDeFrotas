import React, { createContext, useContext, useReducer } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Estado inicial
const initialState = {
  vehicles: [
    {
      id: 1,
      plate: 'ABC-1234',
      brand: 'Toyota',
      model: 'Corolla',
      currentMileage: 45000,
      observations: 'Veículo em bom estado geral',
      clientId: 1,
      lastService: {
        date: '2024-01-15',
        type: 'Revisão preventiva',
        mileage: 44500
      }
    },
    {
      id: 2,
      plate: 'XYZ-5678',
      brand: 'Honda',
      model: 'Civic',
      currentMileage: 32000,
      observations: 'Necessita troca de pneus em breve',
      clientId: 2,
      lastService: {
        date: '2024-01-10',
        type: 'Troca de óleo',
        mileage: 31800
      }
    },
    {
      id: 3,
      plate: 'DEF-9012',
      brand: 'Volkswagen',
      model: 'Gol',
      currentMileage: 68000,
      observations: 'Ar condicionado com problema',
      clientId: 3,
      lastService: {
        date: '2024-01-08',
        type: 'Manutenção ar condicionado',
        mileage: 67500
      }
    },
    {
      id: 4,
      plate: 'GHI-3456',
      brand: 'Ford',
      model: 'Ka',
      currentMileage: 25000,
      observations: 'Veículo novo, primeira revisão',
      clientId: 4,
      lastService: {
        date: '2024-01-12',
        type: 'Primeira revisão',
        mileage: 25000
      }
    },
    {
      id: 5,
      plate: 'JKL-7890',
      brand: 'Chevrolet',
      model: 'Onix',
      currentMileage: 38000,
      observations: 'Pneus precisam ser trocados',
      clientId: 5,
      lastService: {
        date: '2024-01-05',
        type: 'Balanceamento',
        mileage: 37800
      }
    }
  ],
  clients: [
    {
      id: 1,
      name: 'João Silva',
      phone: '(11) 99999-9999',
      email: 'joao@email.com',
      document: '123.456.789-00',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      status: 'active',
      notes: 'Cliente desde 2020, sempre pontual nos pagamentos',
      createdAt: '2020-03-15T10:00:00.000Z'
    },
    {
      id: 2,
      name: 'Maria Santos',
      phone: '(11) 88888-8888',
      email: 'maria@email.com',
      document: '987.654.321-00',
      address: 'Av. Paulista, 456',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      status: 'active',
      notes: 'Possui frota de 3 veículos',
      createdAt: '2021-07-22T14:30:00.000Z'
    },
    {
      id: 3,
      name: 'Carlos Oliveira',
      phone: '(11) 77777-7777',
      email: 'carlos@email.com',
      document: '456.789.123-00',
      address: 'Rua Augusta, 789',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01305-000',
      status: 'active',
      notes: 'Prefere agendamentos pela manhã',
      createdAt: '2022-01-10T09:15:00.000Z'
    },
    {
      id: 4,
      name: 'Ana Costa',
      phone: '(11) 66666-6666',
      email: 'ana@email.com',
      document: '321.654.987-00',
      address: 'Rua Oscar Freire, 321',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01426-001',
      status: 'active',
      notes: 'Cliente VIP, desconto especial',
      createdAt: '2023-05-18T16:45:00.000Z'
    },
    {
      id: 5,
      name: 'Roberto Lima',
      phone: '(11) 55555-5555',
      email: 'roberto@email.com',
      document: '789.123.456-00',
      address: 'Rua Consolação, 654',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01302-907',
      status: 'inactive',
      notes: 'Cliente inativo desde dezembro/2023',
      createdAt: '2019-11-03T11:20:00.000Z'
    }
  ],
  services: [
    {
      id: 1,
      vehicleId: 1,
      type: 'Revisão Geral',
      description: 'Revisão completa dos 45.000km incluindo troca de óleo, filtros e verificação geral',
      entryDate: '2024-01-15',
      exitDate: '2024-01-16',
      mileage: 45000,
      totalValue: 450.00,
      paymentStatus: 'paid',
      parts: [
        { id: 1, name: 'Óleo do motor', quantity: 4, unitPrice: 25.00 },
        { id: 2, name: 'Filtro de óleo', quantity: 1, unitPrice: 15.00 },
        { id: 3, name: 'Filtro de ar', quantity: 1, unitPrice: 20.00 }
      ]
    },
    {
      id: 2,
      vehicleId: 2,
      type: 'Troca de Pastilhas de Freio',
      description: 'Substituição das pastilhas de freio dianteiras e verificação do sistema',
      entryDate: '2024-01-20',
      exitDate: '',
      mileage: 52000,
      totalValue: 280.00,
      paymentStatus: 'pending',
      parts: [
        { id: 4, name: 'Pastilhas de freio dianteiras', quantity: 1, unitPrice: 120.00 }
      ]
    },
    {
      id: 3,
      vehicleId: 3,
      type: 'Reparo Ar Condicionado',
      description: 'Diagnóstico e reparo do sistema de ar condicionado, troca do compressor',
      entryDate: '2024-01-18',
      exitDate: '2024-01-22',
      mileage: 68000,
      totalValue: 850.00,
      paymentStatus: 'partial',
      parts: [
        { id: 5, name: 'Compressor de ar condicionado', quantity: 1, unitPrice: 450.00 },
        { id: 6, name: 'Gás refrigerante', quantity: 2, unitPrice: 35.00 }
      ]
    },
    {
      id: 4,
      vehicleId: 4,
      type: 'Primeira Revisão',
      description: 'Primeira revisão programada aos 25.000km conforme manual do fabricante',
      entryDate: '2024-01-25',
      exitDate: '2024-01-25',
      mileage: 25000,
      totalValue: 320.00,
      paymentStatus: 'paid',
      parts: [
        { id: 7, name: 'Óleo sintético', quantity: 3, unitPrice: 35.00 },
        { id: 8, name: 'Filtro de óleo premium', quantity: 1, unitPrice: 25.00 }
      ]
    },
    {
      id: 5,
      vehicleId: 5,
      type: 'Troca de Pneus',
      description: 'Substituição dos 4 pneus e alinhamento/balanceamento',
      entryDate: '2024-01-28',
      exitDate: '',
      mileage: 38000,
      totalValue: 1200.00,
      paymentStatus: 'pending',
      parts: [
        { id: 9, name: 'Pneu 185/65 R15', quantity: 4, unitPrice: 180.00 }
      ]
    },
    {
      id: 6,
      vehicleId: 1,
      type: 'Troca de Bateria',
      description: 'Substituição da bateria original por uma de maior capacidade',
      entryDate: '2024-01-30',
      exitDate: '2024-01-30',
      mileage: 45200,
      totalValue: 350.00,
      paymentStatus: 'paid',
      parts: [
        { id: 10, name: 'Bateria 60Ah', quantity: 1, unitPrice: 280.00 }
      ]
    },
    {
      id: 7,
      vehicleId: 2,
      type: 'Alinhamento e Balanceamento',
      description: 'Serviço de alinhamento e balanceamento das rodas',
      entryDate: '2024-02-01',
      exitDate: '2024-02-01',
      mileage: 52500,
      totalValue: 120.00,
      paymentStatus: 'paid',
      parts: []
    }
  ],
  parts: [
    {
      id: 1,
      name: 'Filtro de óleo',
      purchasePrice: 20.00,
      salePrice: 25.00,
      stock: 15,
      category: 'Filtros'
    },
    {
      id: 2,
      name: 'Óleo motor 5W30',
      purchasePrice: 28.00,
      salePrice: 35.00,
      stock: 20,
      category: 'Lubrificantes'
    },
    {
      id: 3,
      name: 'Pastilha de freio',
      purchasePrice: 45.00,
      salePrice: 65.00,
      stock: 8,
      category: 'Freios'
    }
  ]
};

// Reducer
function appReducer(state, action) {
  switch (action.type) {
    case 'ADD_VEHICLE':
      return {
        ...state,
        vehicles: [...state.vehicles, { ...action.payload, id: Date.now() }]
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
        clients: [...state.clients, { ...action.payload, id: Date.now() }]
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
      return {
        ...state,
        services: [...state.services, { ...action.payload, id: Date.now() }]
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
        parts: [...state.parts, { ...action.payload, id: Date.now() }]
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
    state.services.filter(s => !s.exitDate || s.exitDate === '');
  
  const getPendingPayments = () => 
    state.services.filter(s => s.paymentStatus === 'pending' || s.paymentStatus === 'partial');

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
    getPendingPayments
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