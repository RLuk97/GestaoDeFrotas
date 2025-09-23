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
  Plus,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';

// Componente para Card de Estatística
const StatCard = ({ icon: Icon, title, value, subtitle, color, trend }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
    <div className="flex flex-col items-center text-center">
      <div className={`p-3 rounded-xl ${color} mb-4`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        {trend && (
          <div className="flex items-center justify-center text-green-600 mt-2">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span className="text-sm font-medium">{trend}</span>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Componente para Botão de Ação
const ActionButton = ({ icon: Icon, title, subtitle, onClick, color }) => (
    <button
      onClick={onClick}
      className={`${color} text-white py-5 px-4 rounded-md shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-105 w-full max-w-xs`}
    >
      <div className="flex items-center space-x-2">
        <div className="flex-shrink-0">
          <Icon className="h-4 w-4" />
        </div>
        <div className="text-left">
          <h3 className="text-xs font-medium mb-0">{title}</h3>
          <p className="text-xs opacity-90">{subtitle}</p>
        </div>
        <div className="flex-shrink-0">
          <Plus className="h-3 w-3" />
        </div>
      </div>
    </button>
  );

// Componente para Item de Atividade
const ActivityItem = ({ service, index }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'PAGO';
      case 'pending': return 'PENDENTE';
      default: return 'DESCONHECIDO';
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <Wrench className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h4 className="font-medium text-gray-900">{service.description}</h4>
          <p className="text-sm text-gray-600">{service.clientName} • R$ {service.totalValue.toFixed(2)}</p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(service.paymentStatus)}`}>
          {getStatusText(service.paymentStatus)}
        </span>
        <span className="text-xs text-gray-500">
          {new Date(service.entryDate).toLocaleDateString('pt-BR')}
        </span>
      </div>
    </div>
  );
};

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

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Visão geral do seu sistema de gestão de frotas</p>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Car}
            title="Total de Veículos"
            value={state.vehicles.length}
            subtitle={`${state.vehicles.filter(v => v.status === 'active').length} ativos`}
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            trend="+12%"
          />
          <StatCard
            icon={Wrench}
            title="Serviços em Andamento"
            value={servicesInProgress.length}
            subtitle="Em execução"
            color="bg-gradient-to-r from-orange-500 to-orange-600"
          />
          <StatCard
            icon={AlertTriangle}
            title="Alertas de Manutenção"
            value={maintenanceAlerts}
            subtitle="Próximos 30 dias"
            color="bg-gradient-to-r from-red-500 to-red-600"
          />
          <StatCard
            icon={DollarSign}
            title="Receita do Mês"
            value={`R$ ${totalRevenue.toFixed(2)}`}
            subtitle={`${pendingPayments.length} pendentes`}
            color="bg-gradient-to-r from-green-500 to-green-600"
            trend="+8%"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Ações Rápidas */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-80">
              <h2 className="text-base font-semibold text-gray-900 mb-3 text-center">Ações Rápidas</h2>
              <div className="space-y-2 flex flex-col items-center">
                <ActionButton
                  icon={Car}
                  title="Cadastrar Veículo"
                  subtitle="Adicionar novo veículo à frota"
                  onClick={handleAddVehicle}
                  color="bg-gradient-to-r from-blue-500 to-blue-600"
                />
                <ActionButton
                  icon={Wrench}
                  title="Agendar Manutenção"
                  subtitle="Criar nova ordem de serviço"
                  onClick={handleAddService}
                  color="bg-gradient-to-r from-orange-500 to-orange-600"
                />
                <Link to="/history" className="w-full max-w-xs">
                  <ActionButton
                    icon={BarChart3}
                    title="Relatórios"
                    subtitle="Visualizar análises e dados"
                    color="bg-gradient-to-r from-purple-500 to-purple-600"
                  />
                </Link>
              </div>
            </div>
          </div>

          {/* Atividades Recentes */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 h-80 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-900">Atividades Recentes</h2>
                <Link 
                  to="/services" 
                  className="text-blue-600 hover:text-blue-700 font-medium text-xs transition-colors"
                >
                  Ver todas →
                </Link>
              </div>
              
              <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hide">
                {recentServices.length > 0 ? (
                  recentServices.map((service, index) => (
                    <ActivityItem key={service.id} service={service} index={index} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-medium">Nenhum serviço encontrado</p>
                    <p className="text-gray-400 text-sm mt-1">
                      Os serviços aparecerão aqui quando forem criados
                    </p>
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