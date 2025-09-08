import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Car,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const Dashboard = () => {
  const { state, getServicesInProgress, getPendingPayments } = useApp();
  
  const servicesInProgress = getServicesInProgress();
  const pendingPayments = getPendingPayments();
  const totalRevenue = state.services
    .filter(s => s.paymentStatus === 'paid')
    .reduce((sum, s) => sum + s.totalValue, 0);
  const pendingRevenue = pendingPayments.reduce((sum, s) => sum + s.totalValue, 0);

  const stats = [
    {
      name: 'Total de Veículos',
      value: state.vehicles.length,
      icon: Car,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      name: 'Serviços em Andamento',
      value: servicesInProgress.length,
      icon: Wrench,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      name: 'Pagamentos Pendentes',
      value: pendingPayments.length,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      name: 'Receita do Mês',
      value: `R$ ${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    }
  ];

  const recentServices = state.services
    .sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate))
    .slice(0, 5);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <span className="status-paid">✅ Pago</span>;
      case 'pending':
        return <span className="status-pending">⚠️ Pendente</span>;
      case 'partial':
        return <span className="status-partial">💸 Parcial</span>;
      default:
        return <span className="status-pending">⚠️ Pendente</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Visão geral do sistema de gestão de frota</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="card p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Serviços em Andamento */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Serviços em Andamento</h2>
              <Link
                to="/services"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Ver todos
              </Link>
            </div>
          </div>
          <div className="p-6">
            {servicesInProgress.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-500">Nenhum serviço em andamento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {servicesInProgress.slice(0, 3).map((service) => {
                  const vehicle = state.vehicles.find(v => v.id === service.vehicleId);
                  return (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{vehicle?.plate}</p>
                        <p className="text-sm text-gray-600">{service.type}</p>
                        <p className="text-xs text-gray-500">
                          Entrada: {format(new Date(service.entryDate), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">R$ {service.totalValue.toFixed(2)}</p>
                        {getStatusBadge(service.paymentStatus)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Pagamentos Pendentes */}
        <div className="card">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Pagamentos Pendentes</h2>
              <span className="text-sm text-red-600 font-medium">
                R$ {pendingRevenue.toFixed(2)}
              </span>
            </div>
          </div>
          <div className="p-6">
            {pendingPayments.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <p className="text-gray-500">Todos os pagamentos em dia</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPayments.slice(0, 3).map((service) => {
                  const vehicle = state.vehicles.find(v => v.id === service.vehicleId);
                  return (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{vehicle?.plate}</p>
                        <p className="text-sm text-gray-600">{service.type}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(service.entryDate), 'dd/MM/yyyy', { locale: ptBR })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-600">R$ {service.totalValue.toFixed(2)}</p>
                        {getStatusBadge(service.paymentStatus)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Serviços Recentes */}
      <div className="card">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Serviços Recentes</h2>
            <Link
              to="/services"
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              Ver histórico completo
            </Link>
          </div>
        </div>
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Veículo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serviço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentServices.map((service) => {
                const vehicle = state.vehicles.find(v => v.id === service.vehicleId);
                return (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{vehicle?.plate}</p>
                        <p className="text-sm text-gray-500">{vehicle?.brand} {vehicle?.model}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-900">{service.type}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(service.entryDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      R$ {service.totalValue.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(service.paymentStatus)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;