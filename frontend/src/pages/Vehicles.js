import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useNotifications } from '../context/NotificationContext';
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
import VehicleForm from '../components/Vehicles/VehicleForm';
import Modal from '../components/Common/Modal';
import ApiService from '../services/api';

const Vehicles = () => {
  const { state, dispatch, getClientById } = useApp();
  const { addVehicleNotification, addVehicleDeleteNotification } = useNotifications();
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
    const matchesSearch = (vehicle.license_plate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.model || '').toLowerCase().includes(searchTerm.toLowerCase());
    
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

  const handleFormSubmit = async (vehicleData) => {
    try {
      if (editingVehicle) {
        // Atualizar veículo existente
        const response = await ApiService.updateVehicle(editingVehicle.id, vehicleData);
        dispatch({
          type: 'UPDATE_VEHICLE',
          payload: { ...response.data, id: editingVehicle.id }
        });
        // Adicionar notificação de edição
        addVehicleNotification(vehicleData, true); // true para indicar edição
      } else {
        // Criar novo veículo
        const response = await ApiService.createVehicle(vehicleData);
        dispatch({ type: 'ADD_VEHICLE', payload: response.data });
        // Adicionar notificação de novo veículo
        addVehicleNotification(vehicleData, false); // false para indicar criação
      }
      setShowForm(false);
      setEditingVehicle(null);
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
      alert('Erro ao salvar veículo: ' + error.message);
    }
  };

  const confirmDelete = async () => {
    if (!vehicleToDelete) return;
    
    try {
      await ApiService.deleteVehicle(vehicleToDelete.id);
      dispatch({ type: 'DELETE_VEHICLE', payload: vehicleToDelete.id });
      
      // Adicionar notificação de exclusão
      addVehicleDeleteNotification(vehicleToDelete);
      
      setShowDeleteModal(false);
      setVehicleToDelete(null);
      alert('Veículo excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir veículo:', error);
      if (error.message.includes('constraint') || error.message.includes('serviços')) {
        alert('Não é possível excluir este veículo pois ele possui serviços cadastrados. Remova os serviços primeiro.');
      } else {
        alert('Erro ao excluir veículo: ' + error.message);
      }
    }
  };

  const handleStatusChange = async (vehicle, newStatus) => {
    try {
      const updatedVehicle = { ...vehicle, status: newStatus };
      await ApiService.updateVehicle(vehicle.id, updatedVehicle);
      dispatch({
        type: 'UPDATE_VEHICLE',
        payload: updatedVehicle
      });
    } catch (error) {
      console.error('Erro ao atualizar status do veículo:', error);
      alert('Erro ao atualizar status: ' + error.message);
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Veículos</h1>
          <p className="text-gray-600">Cadastro e controle da frota de veículos</p>
        </div>
        <button
          onClick={handleAddVehicle}
          className="inline-flex items-center px-4 py-2 bg-brand-primary hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm transition-colors duration-200 mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Veículo
        </button>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 mr-3">
              <Car className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-0.5">Total de Veículos</p>
              <p className="text-xl font-bold text-gray-900">{vehicles.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2.5 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 mr-3">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-0.5">Ativos</p>
              <p className="text-xl font-bold text-gray-900">{vehicles.filter(v => v.status === 'active').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 mr-3">
              <Wrench className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-0.5">Em Manutenção</p>
              <p className="text-xl font-bold text-gray-900">{vehicles.filter(v => v.status === 'maintenance').length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-all duration-200">
          <div className="flex items-center">
            <div className="p-2.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 mr-3">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-0.5">Inativos</p>
              <p className="text-xl font-bold text-gray-900">{vehicles.filter(v => v.status === 'inactive').length}</p>
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
              placeholder="Buscar por placa, modelo ou marca..."
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
              <option value="active">Ativos</option>
              <option value="maintenance">Em Manutenção</option>
              <option value="inactive">Inativos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Veículos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 scrollbar-hide">
        {filteredVehicles.map((vehicle) => {
          const client = getClientById(vehicle.client_id);
          return (
            <div key={vehicle.id} className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
              <div className="p-6">
                {/* Header do Card */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="p-2.5 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                      <Car className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{vehicle.license_plate}</h3>
                      <p className="text-sm text-gray-600">{vehicle.brand} {vehicle.model}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/vehicles/${vehicle.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleEditVehicle(vehicle)}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteVehicle(vehicle)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50"
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
                    <span>Quilometragem: {vehicle.mileage?.toLocaleString()} km</span>
                  </div>
                  
                  {client ? (
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span>Cliente: {client.name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2" />
                      <span className="italic">Veículo da frota (sem cliente)</span>
                    </div>
                  )}
                  
                  {vehicle.lastService && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>
                        Último serviço: {vehicle.lastService.date ? vehicle.lastService.date.split('-').reverse().join('/') : 'Data inválida'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Observações */}
                {vehicle.observations && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">{vehicle.observations}</p>
                  </div>
                )}

                {/* Último Serviço */}
                {vehicle.lastService && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {Array.isArray(vehicle.lastService.type) ? (
                            <div className="flex flex-wrap gap-1">
                              {vehicle.lastService.type.slice(0, 2).map((type, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {type}
                                </span>
                              ))}
                              {vehicle.lastService.type.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{vehicle.lastService.type.length - 2} mais
                                </span>
                              )}
                            </div>
                          ) : (
                            <span>{vehicle.lastService.type}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{vehicle.lastService.mileage?.toLocaleString()} km</p>
                      </div>
                      <span className="text-xs text-gray-600">
                        {vehicle.lastService.date ? vehicle.lastService.date.split('-').slice(1).reverse().join('/') : 'Data inválida'}
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
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
            <button onClick={handleAddVehicle} className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-colors duration-200">
              <Plus className="h-4 w-4 mr-2" />
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
          <p className="text-brand-muted">
            Tem certeza que deseja excluir o veículo <strong>{vehicleToDelete?.plate}</strong>?
          </p>
          <p className="text-sm text-red-500">
            Esta ação não pode ser desfeita e todos os serviços associados serão mantidos.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={confirmDelete}
              className="btn-danger"
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