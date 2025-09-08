import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft,
  Car,
  User,
  Gauge,
  Calendar,
  Wrench,
  Edit,
  Plus,
  FileText,
  DollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import VehicleForm from '../components/Vehicles/VehicleForm';
import Modal from '../components/Common/Modal';

const VehicleDetails = () => {
  const { id } = useParams();
  const { dispatch, getVehicleById, getClientById, getServicesByVehicle } = useApp();
  const [showEditForm, setShowEditForm] = useState(false);

  const vehicle = getVehicleById(parseInt(id));
  const client = vehicle ? getClientById(vehicle.clientId) : null;
  const services = vehicle ? getServicesByVehicle(vehicle.id) : [];

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <Car className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Veículo não encontrado</h2>
        <p className="text-gray-600 mb-6">O veículo solicitado não existe ou foi removido.</p>
        <Link to="/vehicles" className="btn-primary">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar para Veículos
        </Link>
      </div>
    );
  }

  const handleUpdateVehicle = (vehicleData) => {
    dispatch({
      type: 'UPDATE_VEHICLE',
      payload: { ...vehicleData, id: vehicle.id }
    });
    setShowEditForm(false);
  };

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

  const totalSpent = services
    .filter(s => s.paymentStatus === 'paid')
    .reduce((sum, s) => sum + s.totalValue, 0);

  const pendingAmount = services
    .filter(s => s.paymentStatus === 'pending' || s.paymentStatus === 'partial')
    .reduce((sum, s) => sum + s.totalValue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/vehicles"
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{vehicle.plate}</h1>
            <p className="text-gray-600">{vehicle.brand} {vehicle.model}</p>
          </div>
        </div>
        <button
          onClick={() => setShowEditForm(true)}
          className="btn-primary flex items-center"
        >
          <Edit className="h-4 w-4 mr-2" />
          Editar Veículo
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informações do Veículo */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card Principal */}
          <div className="card p-6">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-primary-100 rounded-lg">
                <Car className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold text-gray-900">{vehicle.plate}</h2>
                <p className="text-gray-600">{vehicle.brand} {vehicle.model}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Gauge className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Quilometragem Atual</p>
                    <p className="font-semibold text-gray-900">{vehicle.currentMileage?.toLocaleString()} km</p>
                  </div>
                </div>

                {client && (
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Cliente</p>
                      <p className="font-semibold text-gray-900">{client.name}</p>
                      <p className="text-sm text-gray-500">{client.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                {vehicle.lastService && (
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">Último Serviço</p>
                      <p className="font-semibold text-gray-900">{vehicle.lastService.type}</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(vehicle.lastService.date), 'dd/MM/yyyy', { locale: ptBR })}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <Wrench className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Total de Serviços</p>
                    <p className="font-semibold text-gray-900">{services.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {vehicle.observations && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-start">
                  <FileText className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Observações Técnicas</p>
                    <p className="text-gray-900">{vehicle.observations}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Histórico de Serviços */}
          <div className="card">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Histórico de Serviços</h3>
                <Link
                  to={`/services?vehicle=${vehicle.id}`}
                  className="btn-primary flex items-center text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Serviço
                </Link>
              </div>
            </div>

            <div className="divide-y divide-gray-200">
              {services.length === 0 ? (
                <div className="p-8 text-center">
                  <Wrench className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum serviço registrado para este veículo</p>
                </div>
              ) : (
                services
                  .sort((a, b) => new Date(b.entryDate) - new Date(a.entryDate))
                  .map((service) => (
                    <div key={service.id} className="p-6 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900">{service.type}</h4>
                            {getStatusBadge(service.paymentStatus)}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>Entrada: {format(new Date(service.entryDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
                            {service.exitDate && (
                              <span>Saída: {format(new Date(service.exitDate), 'dd/MM/yyyy', { locale: ptBR })}</span>
                            )}
                            <span>{service.mileage?.toLocaleString()} km</span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-semibold text-gray-900">R$ {service.totalValue.toFixed(2)}</p>
                          <Link
                            to={`/services/${service.id}`}
                            className="text-sm text-primary-600 hover:text-primary-700"
                          >
                            Ver detalhes
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar com Resumo Financeiro */}
        <div className="space-y-6">
          {/* Resumo Financeiro */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Financeiro</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm text-gray-600">Total Pago</span>
                </div>
                <span className="font-semibold text-green-600">R$ {totalSpent.toFixed(2)}</span>
              </div>
              
              {pendingAmount > 0 && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-sm text-gray-600">Pendente</span>
                  </div>
                  <span className="font-semibold text-red-600">R$ {pendingAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900">Total Geral</span>
                  <span className="font-bold text-gray-900">R$ {(totalSpent + pendingAmount).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total de Serviços</span>
                <span className="font-medium text-gray-900">{services.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Serviços Pagos</span>
                <span className="font-medium text-gray-900">
                  {services.filter(s => s.paymentStatus === 'paid').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Serviços Pendentes</span>
                <span className="font-medium text-gray-900">
                  {services.filter(s => s.paymentStatus === 'pending' || s.paymentStatus === 'partial').length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Edição */}
      <Modal
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        title="Editar Veículo"
      >
        <VehicleForm
          vehicle={vehicle}
          onSubmit={handleUpdateVehicle}
          onCancel={() => setShowEditForm(false)}
        />
      </Modal>
    </div>
  );
};

export default VehicleDetails;