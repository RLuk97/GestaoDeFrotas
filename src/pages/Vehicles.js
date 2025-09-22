import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Plus,
  Search,
  Car,
  User,
  Calendar,
  Gauge,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  Wrench,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import VehicleForm from '../components/Vehicles/VehicleForm';
import Modal from '../components/Common/Modal';

const Vehicles = () => {
  const { state, dispatch, getClientById } = useApp();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  const vehicles = state.vehicles;

  // Verificar se deve abrir o modal automaticamente
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('openModal') === 'true') {
      handleAddVehicle();
    }
  }, [location]);

  // Filtrar veículos
  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || vehicle.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setShowForm(true);
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowForm(true);
  };

  const handleDeleteVehicle = (vehicle) => {
    setVehicleToDelete(vehicle);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (vehicleToDelete) {
      dispatch({ type: 'DELETE_VEHICLE', payload: vehicleToDelete.id });
      setShowDeleteModal(false);
      setVehicleToDelete(null);
    }
  };

  const handleFormSubmit = (vehicleData) => {
    if (editingVehicle) {
      dispatch({
        type: 'UPDATE_VEHICLE',
        payload: { ...vehicleData, id: editingVehicle.id }
      });
    } else {
      dispatch({ type: 'ADD_VEHICLE', payload: vehicleData });
    }
    setShowForm(false);
    setEditingVehicle(null);
  };

  const handleStatusChange = (vehicle, newStatus) => {
    dispatch({
      type: 'UPDATE_VEHICLE',
      payload: { ...vehicle, status: newStatus }
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Wrench className="h-3 w-3 mr-1" />
            Em Manutenção
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Inativo
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Indefinido
          </span>
        );
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Gestão de Veículos</h1>
          <p className="text-gray-600">Cadastro e controle da frota de veículos</p>
        </div>
        <button
          onClick={handleAddVehicle}
          className="bg-brand-blue hover:bg-brand-navy text-brand-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4" />
          Novo Veículo
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <Car className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Total de Veículos</p>
              <p className="text-xl font-bold text-gray-900">{vehicles.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Ativos</p>
              <p className="text-xl font-bold text-green-600">{vehicles.filter(v => v.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <Wrench className="h-8 w-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Em Manutenção</p>
              <p className="text-xl font-bold text-yellow-600">{vehicles.filter(v => v.status === 'maintenance').length}</p>
            </div>
          </div>
        </div>
        <div className="card p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm text-gray-600">Inativos</p>
              <p className="text-xl font-bold text-red-600">{vehicles.filter(v => v.status === 'inactive').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card p-6 hover:shadow-lg transition-shadow mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Busca */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Buscar por placa, modelo ou marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              />
            </div>
          </div>

          {/* Filtros */}
          <div className="flex space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent min-w-[120px]"
            >
              <option value="all">Todos Status</option>
              <option value="active">Ativos</option>
              <option value="maintenance">Em Manutenção</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Veículos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => {
          const client = getClientById(vehicle.clientId);
          return (
            <div key={vehicle.id} className="card hover:shadow-lg transition-shadow">
              <div className="p-6">
                {/* Header do Card */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Car className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{vehicle.plate}</h3>
                      <p className="text-sm text-gray-600">{vehicle.brand} {vehicle.model}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/vehicles/${vehicle.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleEditVehicle(vehicle)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVehicle(vehicle)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  {getStatusBadge(vehicle.status)}
                </div>

                {/* Botões de Status */}
                <div className="mb-4 flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusChange(vehicle, 'active')}
                    disabled={vehicle.status === 'active'}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      vehicle.status === 'active'
                        ? 'bg-green-100 text-green-800 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-800'
                    }`}
                    title="Marcar como ativo"
                  >
                    Ativar
                  </button>
                  <button
                    onClick={() => handleStatusChange(vehicle, 'maintenance')}
                    disabled={vehicle.status === 'maintenance'}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      vehicle.status === 'maintenance'
                        ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-800'
                    }`}
                    title="Marcar como em manutenção"
                  >
                    Manutenção
                  </button>
                  <button
                    onClick={() => handleStatusChange(vehicle, 'inactive')}
                    disabled={vehicle.status === 'inactive'}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      vehicle.status === 'inactive'
                        ? 'bg-red-100 text-red-800 cursor-not-allowed'
                        : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-800'
                    }`}
                    title="Marcar como inativo"
                  >
                    Inativar
                  </button>
                </div>

                {/* Informações do Veículo */}
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Gauge className="h-4 w-4 mr-2" />
                    <span>Quilometragem: {vehicle.currentMileage?.toLocaleString()} km</span>
                  </div>
                  
                  {client && (
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>Cliente: {client.name}</span>
                    </div>
                  )}
                  
                  {vehicle.lastService && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        Último serviço: {format(new Date(vehicle.lastService.date), 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Observações */}
                {vehicle.observations && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">{vehicle.observations}</p>
                  </div>
                )}

                {/* Último Serviço */}
                {vehicle.lastService && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{vehicle.lastService.type}</p>
                        <p className="text-xs text-gray-500">{vehicle.lastService.mileage?.toLocaleString()} km</p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {format(new Date(vehicle.lastService.date), 'dd/MM', { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Mensagem quando não há veículos */}
      {filteredVehicles.length === 0 && (
        <div className="card p-12 text-center">
          <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || statusFilter !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Comece cadastrando o primeiro veículo da frota'
            }
          </p>
          {!searchTerm && statusFilter === 'all' && (
            <button onClick={handleAddVehicle} className="bg-brand-blue hover:bg-brand-navy text-brand-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mx-auto">
              <Plus className="h-4 w-4" />
              Cadastrar Primeiro Veículo
            </button>
          )}
        </div>
      )}

      {/* Modal de Formulário */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingVehicle(null);
        }}
        title={editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}
      >
        <VehicleForm
          vehicle={editingVehicle}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingVehicle(null);
          }}
        />
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirmar Exclusão"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Tem certeza que deseja excluir o veículo <strong>{vehicleToDelete?.plate}</strong>?
          </p>
          <p className="text-sm text-red-600">
            Esta ação não pode ser desfeita e todos os serviços associados serão mantidos.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Excluir Veículo
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Vehicles;