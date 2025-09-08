import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Plus,
  Search,
  Filter,
  Wrench,
  Car,
  Calendar,
  DollarSign,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ServiceForm from '../components/Services/ServiceForm';
import Modal from '../components/Common/Modal';

const Services = () => {
  const { state, dispatch, getVehicleById } = useApp();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState(searchParams.get('vehicle') || 'all');
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filtrar serviços
  const filteredServices = state.services.filter(service => {
    const vehicle = getVehicleById(service.vehicleId);
    const matchesSearch = 
      service.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle?.plate.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || service.paymentStatus === statusFilter;
    const matchesVehicle = vehicleFilter === 'all' || service.vehicleId === parseInt(vehicleFilter);
    
    return matchesSearch && matchesStatus && matchesVehicle;
  });

  const handleAddService = () => {
    setEditingService(null);
    setShowForm(true);
  };

  const handleEditService = (service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleFormSubmit = (serviceData) => {
    if (editingService) {
      dispatch({
        type: 'UPDATE_SERVICE',
        payload: { ...serviceData, id: editingService.id }
      });
    } else {
      dispatch({ type: 'ADD_SERVICE', payload: serviceData });
    }
    setShowForm(false);
    setEditingService(null);
  };

  const handlePaymentStatusChange = (serviceId, newStatus) => {
    const service = state.services.find(s => s.id === serviceId);
    if (service) {
      dispatch({
        type: 'UPDATE_SERVICE',
        payload: { ...service, paymentStatus: newStatus }
      });
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return (
          <span className="status-paid flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Pago
          </span>
        );
      case 'pending':
        return (
          <span className="status-pending flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </span>
        );
      case 'partial':
        return (
          <span className="status-partial flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Parcial
          </span>
        );
      default:
        return (
          <span className="status-pending flex items-center">
            <Clock className="h-3 w-3 mr-1" />
            Pendente
          </span>
        );
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'partial':
        return <AlertTriangle className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const stats = {
    total: filteredServices.length,
    paid: filteredServices.filter(s => s.paymentStatus === 'paid').length,
    pending: filteredServices.filter(s => s.paymentStatus === 'pending').length,
    partial: filteredServices.filter(s => s.paymentStatus === 'partial').length,
    totalRevenue: filteredServices.reduce((sum, s) => sum + s.totalValue, 0),
    paidRevenue: filteredServices.filter(s => s.paymentStatus === 'paid').reduce((sum, s) => sum + s.totalValue, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Serviços</h1>
          <p className="text-gray-600">Controle de serviços e pagamentos</p>
        </div>
        <button
          onClick={handleAddService}
          className="btn-primary flex items-center mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </button>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center">
            <Wrench className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total de Serviços</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Pagos</p>
              <p className="text-xl font-bold text-green-600">{stats.paid}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Pendentes</p>
              <p className="text-xl font-bold text-yellow-600">{stats.pending + stats.partial}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Receita Total</p>
              <p className="text-xl font-bold text-green-600">R$ {stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por tipo de serviço, descrição ou placa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field min-w-[120px]"
            >
              <option value="all">Todos Status</option>
              <option value="paid">Pagos</option>
              <option value="pending">Pendentes</option>
              <option value="partial">Parciais</option>
            </select>

            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="input-field min-w-[150px]"
            >
              <option value="all">Todos Veículos</option>
              {state.vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.plate} - {vehicle.brand} {vehicle.model}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Serviços */}
      <div className="card overflow-hidden">
        {filteredServices.length === 0 ? (
          <div className="p-12 text-center">
            <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchTerm || statusFilter !== 'all' || vehicleFilter !== 'all'
                ? 'Nenhum serviço encontrado'
                : 'Nenhum serviço cadastrado'
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== 'all' || vehicleFilter !== 'all'
                ? 'Tente ajustar os filtros de busca'
                : 'Comece registrando o primeiro serviço'
              }
            </p>
            {!searchTerm && statusFilter === 'all' && vehicleFilter === 'all' && (
              <button onClick={handleAddService} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Registrar Primeiro Serviço
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
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
                    Datas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredServices
                  .sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate))
                  .map((service) => {
                    const vehicle = getVehicleById(service.vehicleId);
                    return (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Car className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{vehicle?.plate}</p>
                              <p className="text-sm text-gray-500">{vehicle?.brand} {vehicle?.model}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{service.type}</p>
                            <p className="text-sm text-gray-500">{service.description}</p>
                            <p className="text-xs text-gray-400">{service.mileage?.toLocaleString()} km</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="flex items-center mb-1">
                              <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                              <span>Entrada: {format(new Date(service.entryDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
                            </div>
                            {service.exitDate && (
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                                <span>Saída: {format(new Date(service.exitDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <p className="text-sm font-medium text-gray-900">R$ {service.totalValue.toFixed(2)}</p>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(service.paymentStatus)}
                            <select
                              value={service.paymentStatus}
                              onChange={(e) => handlePaymentStatusChange(service.id, e.target.value)}
                              className="text-sm border-0 bg-transparent focus:ring-0 font-medium"
                            >
                              <option value="pending">Pendente</option>
                              <option value="partial">Parcial</option>
                              <option value="paid">Pago</option>
                            </select>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <Link
                              to={`/services/${service.id}`}
                              className="text-primary-600 hover:text-primary-900"
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleEditService(service)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Formulário */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingService(null);
        }}
        title={editingService ? 'Editar Serviço' : 'Novo Serviço'}
        size="lg"
      >
        <ServiceForm
          service={editingService}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingService(null);
          }}
          preselectedVehicleId={vehicleFilter !== 'all' ? parseInt(vehicleFilter) : null}
        />
      </Modal>
    </div>
  );
};

export default Services;