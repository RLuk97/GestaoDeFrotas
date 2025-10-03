import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Car,
  Wrench,
  DollarSign,
  FileText,
  Fuel,
  Gauge,
  User,
  Phone,
  Mail,
  AlertCircle,
  XCircle,
  Plus
} from 'lucide-react';
import Modal from '../components/Common/Modal';
import VehicleForm from '../components/Vehicles/VehicleForm';

const VehicleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const vehicle = state.vehicles.find(v => v.id === id);
  const vehicleServices = state.services.filter(s => s.vehicleId === id);

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center">
      <div className="text-center">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-brand-primary mb-2">Veículo não encontrado</h2>
        <p className="text-brand-muted mb-4">O veículo solicitado não existe ou foi removido.</p>
          <button
            onClick={() => navigate('/vehicles')}
            className="btn-primary"
          >
            Voltar para Veículos
          </button>
        </div>
      </div>
    );
  }

  const handleEditVehicle = (vehicleData) => {
    dispatch({
      type: 'UPDATE_VEHICLE',
      payload: { id: vehicle.id, ...vehicleData }
    });
    setShowEditModal(false);
  };

  const handleDeleteVehicle = () => {
    dispatch({ type: 'DELETE_VEHICLE', payload: vehicle.id });
    navigate('/vehicles');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return '✅ Ativo';
      case 'maintenance':
        return '🔧 Em Manutenção';
      case 'inactive':
        return '❌ Inativo';
      default:
        return 'Indefinido';
    }
  };

  const totalServiceCost = vehicleServices.reduce((sum, service) => sum + (parseFloat(service.totalValue) || 0), 0);

  return (
    <div className="min-h-screen bg-brand-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <button
            onClick={() => navigate('/vehicles')}
            className="flex items-center text-brand-muted hover:text-brand-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Veículos
          </button>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-primary">
            Detalhes do Veículo
          </h1>
          <p className="text-brand-muted mt-1">
            Informações completas sobre o veículo {vehicle.license_plate}
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {vehicle.brand} {vehicle.model}
                </h2>
                <p className="text-gray-600 mt-1">
                  Placa: {vehicle.license_plate} • Ano: {vehicle.year}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vehicle.status)}`}>
                {getStatusText(vehicle.status)}
              </span>
              <button
                onClick={() => setShowEditModal(true)}
                className="btn-secondary flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="btn-danger flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações Principais */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações do Veículo */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center">
                  <Car className="h-5 w-5 mr-2" />
                  Informações do Veículo
                </h2>
              </div>
              <div className="card-content">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-brand-muted mb-1">
                      Marca
                    </label>
                    <p className="text-brand-primary font-medium">{vehicle.brand}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-muted mb-1">
                      Modelo
                    </label>
                    <p className="text-brand-primary font-medium">{vehicle.model}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-muted mb-1">
                      Placa
                    </label>
                    <p className="text-brand-primary font-mono font-bold text-lg">{vehicle.license_plate}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-muted mb-1">
                      Ano
                    </label>
                    <p className="text-brand-primary">{vehicle.year}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-muted mb-1">
                      Cor
                    </label>
                    <p className="text-brand-primary">{vehicle.color}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-muted mb-1">
                      Combustível
                    </label>
                    <p className="text-brand-primary flex items-center">
                      <Fuel className="h-4 w-4 mr-2 text-brand-muted" />
                      {vehicle.fuel_type}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-muted mb-1">
                      Quilometragem
                    </label>
                    <p className="text-brand-primary flex items-center">
                      <Gauge className="h-4 w-4 mr-2 text-brand-muted" />
                      {vehicle.mileage?.toLocaleString()} km
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-muted mb-1">
                      Chassi
                    </label>
                    <p className="text-brand-primary font-mono text-sm">{vehicle.chassis}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Documentação */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Documentação
                </h2>
              </div>
              <div className="card-content">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-brand-muted mb-1">
                      RENAVAM
                    </label>
                    <p className="text-brand-primary font-mono">{vehicle.renavam}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-muted mb-1">
                      Licenciamento
                    </label>
                    <p className="text-brand-primary">
                      {vehicle.licensing ? vehicle.licensing.split('-').reverse().join('/') : 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-muted mb-1">
                      Seguro
                    </label>
                    <p className="text-brand-primary">
                      {vehicle.insurance ? vehicle.insurance.split('-').reverse().join('/') : 'Não informado'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-muted mb-1">
                      IPVA
                    </label>
                    <p className="text-brand-primary">
                      {vehicle.ipva ? vehicle.ipva.split('-').reverse().join('/') : 'Não informado'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Histórico de Serviços */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center">
                  <Wrench className="h-5 w-5 mr-2" />
                  Histórico de Serviços
                </h2>
              </div>
              <div className="card-content">
                {vehicleServices.length > 0 ? (
                  <div className="space-y-4">
                    {vehicleServices.map((service) => (
                      <div key={service.id} className="border border-brand-border rounded-lg p-4 hover:bg-brand-hover transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-brand-primary">
                              {Array.isArray(service.type) ? (
                                <div className="flex flex-wrap gap-1">
                                  {service.type.map((type, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                    >
                                      {type}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span>{service.type}</span>
                              )}
                            </div>
                            <p className="text-sm text-brand-muted mt-1">
                              {service.entryDate ? service.entryDate.split('-').reverse().join('/') : 'Data inválida'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-brand-primary">R$ {(parseFloat(service.totalValue) || 0).toFixed(2)}</p>
                            <Link
                              to={`/services/${service.id}`}
                              className="text-sm text-brand-secondary hover:text-brand-primary"
                            >
                              Ver detalhes
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-brand-surface p-4 rounded-lg text-center">
                    <Wrench className="h-12 w-12 text-brand-muted mx-auto mb-2" />
                    <p className="text-brand-muted">Nenhum serviço registrado</p>
                    <p className="text-sm text-brand-muted mt-1">
                      Os serviços realizados neste veículo aparecerão aqui
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informações do Proprietário */}
            {vehicle.owner && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Proprietário
                  </h2>
                </div>
                <div className="card-content">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-brand-muted">
                        Nome
                      </label>
                      <p className="text-brand-primary font-medium">{vehicle.owner}</p>
                    </div>
                    {vehicle.ownerPhone && (
                      <div>
                        <label className="block text-sm font-medium text-brand-muted">
                          Telefone
                        </label>
                        <p className="text-brand-primary flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-brand-muted" />
                          {vehicle.ownerPhone}
                        </p>
                      </div>
                    )}
                    {vehicle.ownerEmail && (
                      <div>
                        <label className="block text-sm font-medium text-brand-muted">
                          E-mail
                        </label>
                        <p className="text-brand-primary flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-brand-muted" />
                          {vehicle.ownerEmail}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Resumo Financeiro */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Resumo Financeiro
                </h2>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total em Serviços:</span>
                    <span className="font-medium">R$ {totalServiceCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Número de Serviços:</span>
                    <span className="font-medium">{vehicleServices.length}</span>
                  </div>
                  {vehicleServices.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Média por Serviço:</span>
                      <span className="font-medium">R$ {(totalServiceCost / vehicleServices.length).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Próximas Manutenções */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Próximas Manutenções
                </h2>
              </div>
              <div className="card-content">
                {/* Aqui você pode adicionar lógica para manutenções programadas */}
                <div className="bg-gray-50 p-4 rounded-lg text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Nenhuma manutenção agendada</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Agende manutenções preventivas para manter o veículo em bom estado
                  </p>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Ações Rápidas</h2>
              </div>
              <div className="card-content">
                <div className="space-y-3">
                  <Link
                    to={`/services?vehicle=${vehicle.id}&openModal=true`}
                    className="btn-primary w-full flex items-center justify-center"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Serviço
                  </Link>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="btn-secondary w-full flex items-center justify-center"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar Veículo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Editar Veículo"
        size="xl"
      >
        <VehicleForm
          vehicle={vehicle}
          onSubmit={handleEditVehicle}
          onCancel={() => setShowEditModal(false)}
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
            Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">Atenção</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Ao excluir este veículo, todos os serviços relacionados também serão removidos.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              onClick={handleDeleteVehicle}
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

export default VehicleDetails;