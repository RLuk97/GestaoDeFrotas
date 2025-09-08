import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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
  Eye
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import VehicleForm from '../components/Vehicles/VehicleForm';
import Modal from '../components/Common/Modal';

const Vehicles = () => {
  const { state, dispatch, getClientById } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState(null);

  // Filtrar veículos por placa
  const filteredVehicles = state.vehicles.filter(vehicle =>
    vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Veículos</h1>
          <p className="text-gray-600">Cadastro e controle da frota de veículos</p>
        </div>
        <button
          onClick={handleAddVehicle}
          className="btn-primary flex items-center mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Veículo
        </button>
      </div>

      {/* Busca */}
      <div className="card p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Buscar por placa, marca ou modelo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
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
                    <div className="p-2 bg-primary-100 rounded-lg">
                      <Car className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-semibold text-gray-900">{vehicle.plate}</h3>
                      <p className="text-sm text-gray-600">{vehicle.brand} {vehicle.model}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link
                      to={`/vehicles/${vehicle.id}`}
                      className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
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
            {searchTerm ? 'Nenhum veículo encontrado' : 'Nenhum veículo cadastrado'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? 'Tente ajustar os termos de busca'
              : 'Comece cadastrando o primeiro veículo da frota'
            }
          </p>
          {!searchTerm && (
            <button onClick={handleAddVehicle} className="btn-primary">
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
          <p className="text-gray-600">
            Tem certeza que deseja excluir o veículo <strong>{vehicleToDelete?.plate}</strong>?
          </p>
          <p className="text-sm text-red-600">
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