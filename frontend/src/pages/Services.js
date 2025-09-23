import React, { useState, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
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
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [vehicleFilter, setVehicleFilter] = useState(searchParams.get('vehicle') || 'all');
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Detectar parâmetro openModal na URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('openModal') === 'true') {
      handleAddService();
    }
  }, [location]);

  // Filtrar e ordenar serviços
  const filteredServices = state.services
    .filter(service => {
      const vehicle = getVehicleById(service.vehicleId);
      const matchesSearch = 
        service.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vehicle?.plate.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || service.paymentStatus === statusFilter;
      const matchesVehicle = vehicleFilter === 'all' || service.vehicleId === parseInt(vehicleFilter);
      
      return matchesSearch && matchesStatus && matchesVehicle;
    })
    .sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate)); // Ordenar por data mais recente

  // Lógica de paginação
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  // Reset página quando filtros mudam
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, vehicleFilter]);

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
    
    // Reset filtros para mostrar todos os serviços após adicionar/editar
    setVehicleFilter('all');
    setStatusFilter('all');
    setSearchTerm('');
    
    // Limpar parâmetros da URL
    window.history.replaceState({}, document.title, window.location.pathname);
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
    totalRevenue: filteredServices.reduce((sum, s) => sum + (s.totalValue || 0), 0),
    paidRevenue: filteredServices.filter(s => s.paymentStatus === 'paid').reduce((sum, s) => sum + (s.totalValue || 0), 0)
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Serviços</h1>
          <p className="text-gray-600">Controle de manutenções</p>
        </div>
        <button
          onClick={handleAddService}
          className="inline-flex items-center px-4 py-2 bg-brand-primary hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Serviço
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 mr-3">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-0.5">Total de Serviços</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 mr-3">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-0.5">Pagos</p>
              <p className="text-xl font-bold text-gray-900">{stats.paid}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 mr-3">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-0.5">Pendentes</p>
              <p className="text-xl font-bold text-gray-900">{stats.pending + stats.partial}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2.5 rounded-lg bg-gradient-to-r from-green-500 to-green-600 mr-3">
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-0.5">Receita Total</p>
              <p className="text-xl font-bold text-gray-900">R$ {stats.totalRevenue.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa e Filtros */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por tipo de serviço, descrição ou placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          
          {/* Filtros */}
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-w-[140px] px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            >
              <option value="all">Todos Status</option>
              <option value="paid">Pagos</option>
              <option value="pending">Pendentes</option>
              <option value="partial">Parciais</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Serviços */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {filteredServices.length === 0 ? (
          <div className="p-12 text-center">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg w-fit mx-auto mb-4">
              <Wrench className="h-8 w-8 text-white" />
            </div>
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
              <button onClick={handleAddService} className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200">
                <Plus className="h-4 w-4 mr-2" />
                Registrar Primeiro Serviço
              </button>
            )}
          </div>
        ) : (
          <>
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
                {paginatedServices
                  .sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate))
                  .map((service) => {
                    const vehicle = getVehicleById(service.vehicleId);
                    return (
                      <tr key={service.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mr-3">
                              <Car className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{vehicle?.plate}</p>
                              <p className="text-sm text-gray-500">{vehicle?.brand} {vehicle?.model}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{service.type}</p>
                            <p className="text-xs text-gray-500">{service.mileage?.toLocaleString()} km</p>
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
                              className="text-sm border-0 bg-transparent focus:ring-0 font-medium text-gray-900 cursor-pointer"
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
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                              title="Ver detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleEditService(service)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
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

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                    disabled={currentPage === 1}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Próxima
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                      <span className="font-medium">{Math.min(endIndex, filteredServices.length)}</span> de{' '}
                      <span className="font-medium">{filteredServices.length}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-lg shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(Math.max(currentPage - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors duration-200 ${
                            page === currentPage
                              ? 'z-10 bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                          style={{ minWidth: '40px' }}
                        >
                          {page}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(currentPage + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-lg border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
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
          preselectedVehicleId={
            vehicleFilter !== 'all' ? parseInt(vehicleFilter) : 
            (searchParams.get('vehicle') ? parseInt(searchParams.get('vehicle')) : null)
          }
        />
      </Modal>
    </div>
  );
};

export default Services;