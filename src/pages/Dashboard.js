import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Car,
  Wrench,
  AlertTriangle,
  DollarSign,
  Calendar,
  BarChart3,
  Users
} from 'lucide-react';

const Dashboard = () => {
  const { state, getServicesInProgress, getPendingPayments } = useApp();
  const navigate = useNavigate();

  const handleAddVehicle = () => {
    navigate('/vehicles?openModal=true');
  };

  const handleAddService = () => {
    navigate('/services?openModal=true');
  };

  // Cálculos para métricas
  const servicesInProgress = getServicesInProgress();
  const pendingPayments = getPendingPayments();
  const totalRevenue = state.services
    .filter(s => s.paymentStatus === 'paid')
    .reduce((sum, s) => sum + s.totalValue, 0);

  const maintenanceAlerts = state.vehicles.filter(v => {
    if (!v.nextMaintenance) return false;
    const nextMaintenance = new Date(v.nextMaintenance);
    const today = new Date();
    const diffDays = Math.ceil((nextMaintenance - today) / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  }).length;

  const recentServices = state.services
    .sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate))
    .slice(0, 5);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">PAGO</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">PENDENTE</span>;
      case 'partial':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">PARCIAL</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">PENDENTE</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de estatísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total de Veículos */}
          <div className="bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-blue-50 cursor-pointer group">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Car className="h-8 w-8 text-blue-600 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-700" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate transition-colors duration-300 group-hover:text-blue-700">
                    Total de Veículos
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 transition-colors duration-300 group-hover:text-blue-800">
                    {state.vehicles.length}
                  </dd>
                  <dd className="text-sm text-gray-500 transition-colors duration-300 group-hover:text-blue-600">
                    {state.vehicles.filter(v => v.status === 'active').length} ativos
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Serviços em Andamento */}
          <div className="bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-yellow-50 cursor-pointer group">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Wrench className="h-8 w-8 text-yellow-600 transition-all duration-300 group-hover:scale-110 group-hover:text-yellow-700" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate transition-colors duration-300 group-hover:text-yellow-700">
                    Serviços em Andamento
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 transition-colors duration-300 group-hover:text-yellow-800">
                    {servicesInProgress.length}
                  </dd>
                  <dd className="text-sm text-gray-500 transition-colors duration-300 group-hover:text-yellow-600">
                    Em execução
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Alertas de Manutenção */}
          <div className="bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-red-50 cursor-pointer group">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-8 w-8 text-red-600 transition-all duration-300 group-hover:scale-110 group-hover:text-red-700" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate transition-colors duration-300 group-hover:text-red-700">
                    Alertas de Manutenção
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 transition-colors duration-300 group-hover:text-red-800">
                    {maintenanceAlerts}
                  </dd>
                  <dd className="text-sm text-gray-500 transition-colors duration-300 group-hover:text-red-600">
                    Próximos 30 dias
                  </dd>
                </dl>
              </div>
            </div>
          </div>

          {/* Receita do Mês */}
          <div className="bg-white rounded-lg shadow p-6 transform transition-all duration-300 hover:scale-105 hover:shadow-xl hover:bg-green-50 cursor-pointer group">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-8 w-8 text-green-600 transition-all duration-300 group-hover:scale-110 group-hover:text-green-700" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate transition-colors duration-300 group-hover:text-green-700">
                    Receita do Mês
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 transition-colors duration-300 group-hover:text-green-800">
                    R$ 1240,00
                  </dd>
                  <dd className="text-sm text-gray-500 transition-colors duration-300 group-hover:text-green-600">
                    3 pendentes
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Layout em duas colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ações Rápidas */}
          <div>
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Ações Rápidas</h3>
              </div>
              <div className="p-6 space-y-4">
                <button
                  onClick={handleAddVehicle}
                  className="w-full flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <Car className="h-6 w-6 text-blue-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-blue-900">Cadastrar Veículo</div>
                      <div className="text-xs text-blue-700">Adicionar novo veículo</div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={handleAddService}
                  className="w-full flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg hover:bg-yellow-100 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <Wrench className="h-6 w-6 text-yellow-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-yellow-900">Agendar Manutenção</div>
                      <div className="text-xs text-yellow-700">Nova manutenção</div>
                    </div>
                  </div>
                </button>

                <Link
                  to="/history"
                  className="w-full flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-left"
                >
                  <div className="flex items-center">
                    <BarChart3 className="h-6 w-6 text-purple-600 mr-3" />
                    <div>
                      <div className="text-sm font-medium text-purple-900">Relatórios</div>
                      <div className="text-xs text-purple-700">Análises e dados</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          {/* Atividades Recentes */}
          <div>
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Atividades Recentes</h3>
                <Link to="/services" className="text-sm text-blue-600 hover:text-blue-800">
                  Ver todas
                </Link>
              </div>
              <div className="p-6">
                {recentServices.length > 0 ? (
                  <div className="space-y-4">
                    {recentServices.map((service, index) => (
                      <div key={service.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Wrench className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {service.description || `${service.type} - ${service.vehicleId}`}
                            </div>
                            <div className="text-xs text-gray-500">
                              {service.clientName || 'Cliente'} • R$ {service.totalValue?.toFixed(2) || '0,00'}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {new Date(service.entryDate).toLocaleDateString('pt-BR')}
                          </span>
                          {getStatusBadge(service.paymentStatus)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Wrench className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhum serviço encontrado</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;