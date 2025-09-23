import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Calendar,
  Car,
  Wrench,
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import Modal from '../components/Common/Modal';
import ServiceForm from '../components/Services/ServiceForm';

const ServiceDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { state, dispatch } = useApp();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const service = state.services.find(s => s.id === parseInt(id));
  const vehicle = service ? state.vehicles.find(v => v.id === service.vehicleId) : null;

  if (!service) {
    return (
      <div className="min-h-screen bg-brand-surface flex items-center justify-center">
      <div className="text-center">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-brand-primary mb-2">Serviço não encontrado</h2>
        <p className="text-brand-muted mb-4">O serviço solicitado não existe ou foi removido.</p>
          <button
            onClick={() => navigate('/services')}
            className="btn-primary"
          >
            Voltar para Serviços
          </button>
        </div>
      </div>
    );
  }

  const handleEditService = (serviceData) => {
    dispatch({
      type: 'UPDATE_SERVICE',
      payload: { id: service.id, ...serviceData }
    });
    setShowEditModal(false);
  };

  const handleDeleteService = () => {
    dispatch({ type: 'DELETE_SERVICE', payload: service.id });
    navigate('/services');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'partial':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid':
        return '✅ Pago';
      case 'partial':
        return '💸 Parcialmente Pago';
      case 'pending':
        return '⚠️ Pendente';
      default:
        return 'Indefinido';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      case 'pending':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const partsTotal = service.parts?.reduce((sum, part) => sum + (part.quantity * part.unitPrice), 0) || 0;
  const laborCost = service.totalValue - partsTotal;

  return (
    <div className="min-h-screen bg-brand-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <button
            onClick={() => navigate('/services')}
            className="flex items-center text-brand-muted hover:text-brand-primary transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Serviços
          </button>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-brand-primary">
            Detalhes do Serviço #{service.id}
          </h1>
          <p className="text-brand-muted mt-1">
            Informações completas sobre o serviço realizado
          </p>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {service.type}
                </h2>
                <p className="text-gray-600 mt-1">
                  {service.type} - {vehicle?.plate}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
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
            {/* Informações do Serviço */}
            <div className="card">
              <div className="card-header">
                <h2 className="card-title flex items-center">
                  <Wrench className="h-5 w-5 mr-2" />
                  Informações do Serviço
                </h2>
              </div>
              <div className="card-content">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-brand-muted mb-1">
                      Tipo de Serviço
                    </label>
                    <p className="text-brand-primary font-medium">{service.type}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-muted mb-1">
                      Status do Pagamento
                    </label>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(service.paymentStatus)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.paymentStatus)}`}>
                        {getStatusText(service.paymentStatus)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-muted mb-1">
                      Data de Entrada
                    </label>
                    <p className="text-brand-primary flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-brand-muted" />
                      {format(new Date(service.entryDate), 'dd/MM/yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-muted mb-1">
                      Data de Saída
                    </label>
                    <p className="text-brand-primary flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-brand-muted" />
                      {service.exitDate 
                        ? format(new Date(service.exitDate), 'dd/MM/yyyy', { locale: ptBR })
                        : 'Não definida'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-muted mb-1">
                      Quilometragem
                    </label>
                    <p className="text-brand-primary">{service.mileage?.toLocaleString()} km</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brand-muted mb-1">
                      Valor Total
                    </label>
                    <p className="text-brand-primary font-bold text-lg flex items-center">
                      <DollarSign className="h-4 w-4 mr-1 text-brand-muted" />
                      R$ {service.totalValue?.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="mt-6">
                  <label className="block text-sm font-medium text-brand-muted mb-2">
                    Descrição do Serviço
                  </label>
                  <p className="text-brand-primary bg-brand-surface p-3 rounded-lg">
                    {service.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Peças Utilizadas */}
            {service.parts && service.parts.length > 0 && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title flex items-center">
                    <Package className="h-5 w-5 mr-2" />
                    Peças Utilizadas
                  </h2>
                </div>
                <div className="card-content">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-brand-surface">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">
                            Peça
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">
                            Quantidade
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">
                            Valor Unitário
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-brand-muted uppercase tracking-wider">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-brand-border">
                        {service.parts.map((part, index) => (
                          <tr key={index}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-brand-primary">
                              {part.name}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-brand-primary">
                              {part.quantity}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-brand-primary">
                              R$ {part.unitPrice?.toFixed(2)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-brand-primary">
                              R$ {(part.quantity * part.unitPrice)?.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-brand-surface">
                        <tr>
                          <td colSpan="3" className="px-4 py-3 text-sm font-medium text-brand-primary text-right">
                            Total das Peças:
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-brand-primary">
                            R$ {partsTotal.toFixed(2)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Informações do Veículo */}
            {vehicle && (
              <div className="card">
                <div className="card-header">
                  <h2 className="card-title flex items-center">
                    <Car className="h-5 w-5 mr-2" />
                    Veículo
                  </h2>
                </div>
                <div className="card-content">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-brand-muted">
                        Placa
                      </label>
                      <p className="text-brand-primary font-mono font-bold">{vehicle.plate}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-muted">
                        Marca/Modelo
                      </label>
                      <p className="text-brand-primary">{vehicle.brand} {vehicle.model}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-brand-muted">
                        Quilometragem Atual
                      </label>
                      <p className="text-brand-primary">{vehicle.mileage?.toLocaleString()} km</p>
                    </div>
                    {vehicle.owner && (
                      <div>
                        <label className="block text-sm font-medium text-brand-muted">
                          Proprietário
                        </label>
                        <p className="text-brand-primary">{vehicle.owner}</p>
                      </div>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                      className="btn-secondary w-full"
                    >
                      Ver Detalhes do Veículo
                    </button>
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
                    <span className="text-brand-muted">Peças:</span>
                    <span className="font-medium">R$ {partsTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-brand-muted">Mão de obra:</span>
                    <span className="font-medium">R$ {laborCost.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-brand-border pt-3">
                    <div className="flex justify-between">
                      <span className="text-lg font-medium text-brand-primary">Total:</span>
                      <span className="text-lg font-bold text-brand-primary">R$ {service.totalValue?.toFixed(2)}</span>
                    </div>
                  </div>
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
        title="Editar Serviço"
        size="xl"
      >
        <ServiceForm
          service={service}
          onSubmit={handleEditService}
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
          <p className="text-brand-muted">
            Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 mr-3" />
              <div>
                <h4 className="text-sm font-medium text-amber-800">Atenção</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Ao excluir este serviço, todas as informações relacionadas serão perdidas permanentemente.
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
              onClick={handleDeleteService}
              className="btn-danger"
            >
              Excluir Serviço
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ServiceDetails;