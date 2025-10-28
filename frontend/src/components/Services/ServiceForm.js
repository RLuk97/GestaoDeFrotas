import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const ServiceForm = ({ service, onSubmit, onCancel, preselectedVehicleId }) => {
  const { state } = useApp();
  

  
  const [formData, setFormData] = useState({
    vehicleId: service?.vehicleId || (preselectedVehicleId ? String(preselectedVehicleId) : ''),
    clientId: service?.clientId || '',
    type: service?.type || [],
    customType: service?.customType || '',
    description: service?.description || '',
    totalValue: service?.totalValue || '',
    entryDate: service?.entryDate || new Date().toISOString().split('T')[0],
    exitDate: service?.exitDate || '',
    mileage: service?.mileage || '',
    status: service?.status || 'Em Andamento',
    technician: service?.technician || '',
    parts: service?.parts || '',
    laborHours: service?.laborHours || '',
    paymentStatus: service?.paymentStatus || 'pending'
  });

  // Lista de tipos de serviço disponíveis
  const serviceTypes = [
    'Revisão Geral',
    'Troca de Óleo',
    'Troca de Filtros',
    'Alinhamento e Balanceamento',
    'Troca de Pneus',
    'Freios',
    'Suspensão',
    'Sistema Elétrico',
    'Ar Condicionado',
    'Bateria',
    'Embreagem',
    'Radiador',
    'Escapamento',
    'Injeção Eletrônica',
    'Cambio',
    'Motor',
    'Pintura',
    'Funilaria',
    'Lavagem e Enceramento',
    'Inspeção Veicular'
  ];

  // Atualizar veículo quando preselectedVehicleId mudar
  useEffect(() => {
    if (preselectedVehicleId && !service) {
      setFormData(prev => ({
        ...prev,
        vehicleId: String(preselectedVehicleId)
      }));
    }
  }, [preselectedVehicleId, service]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (service) {
      // Processar tipos de serviço para array se necessário
      let serviceTypes = [];
      if (service.type) {
        if (Array.isArray(service.type)) {
          serviceTypes = service.type;
        } else if (typeof service.type === 'string') {
          serviceTypes = service.type.includes(',') 
            ? service.type.split(',').map(t => t.trim()) 
            : [service.type];
        }
      }
      
      setFormData({
        vehicleId: service.vehicleId ? String(service.vehicleId) : '',
        type: serviceTypes,
        customType: service.customType || '',
        description: service.description || '',
        entryDate: service.entryDate || '',
        exitDate: service.exitDate || '',
        mileage: service.mileage || '',
        totalValue: service.totalValue || '',
        paymentStatus: service.paymentStatus || 'pending'
      });
    } else if (preselectedVehicleId) {
      setFormData(prev => ({ 
        ...prev, 
        vehicleId: String(preselectedVehicleId) 
      }));
    }
  }, [service, preselectedVehicleId]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.vehicleId) {
      newErrors.vehicleId = 'Veículo é obrigatório';
    }

    if (!formData.type || formData.type.length === 0) {
      newErrors.type = 'Pelo menos um tipo de serviço é obrigatório';
    } else if (formData.type.includes('Outro') && !formData.customType.trim()) {
      newErrors.customType = 'Especifique o tipo de serviço personalizado';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    }

    if (!formData.entryDate) {
      newErrors.entryDate = 'Data de entrada é obrigatória';
    }

    if (!formData.mileage) {
      newErrors.mileage = 'Quilometragem é obrigatória';
    } else if (isNaN(formData.mileage) || formData.mileage < 0) {
      newErrors.mileage = 'Quilometragem deve ser um número válido';
    }

    if (!formData.totalValue) {
      newErrors.totalValue = 'Valor total é obrigatório';
    } else if (isNaN(formData.totalValue) || formData.totalValue < 0) {
      newErrors.totalValue = 'Valor deve ser um número válido';
    }

    if (formData.exitDate && formData.exitDate < formData.entryDate) {
      newErrors.exitDate = 'Data de saída deve ser posterior à data de entrada';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Buscar o veículo selecionado para obter o client_id
      const selectedVehicle = state.vehicles.find(v => v.id === formData.vehicleId);

      // Bloquear envio se o veículo não tiver cliente associado
      if (!selectedVehicle || !selectedVehicle.client_id) {
        setErrors(prev => ({
          ...prev,
          vehicleId: 'Veículo selecionado não possui cliente associado. Associe um cliente ao veículo antes de abrir o serviço.'
        }));
        return;
      }
      
      // Processar tipos de serviço
      let serviceTypes = [...formData.type];
      if (formData.type.includes('Outro') && formData.customType.trim()) {
        // Substituir "Outro" pelo tipo personalizado
        serviceTypes = serviceTypes.filter(type => type !== 'Outro');
        serviceTypes.push(formData.customType.trim());
      }
      
      // Mapear status de pagamento (frontend) para status aceito pelo backend
      const statusMap = {
        pending: 'Pendente',
        in_progress: 'Em Andamento',
        completed: 'Concluído',
        cancelled: 'Cancelado'
      };

      // Montar payload conforme validações do backend
      const serviceData = {
        vehicle_id: formData.vehicleId,
        client_id: selectedVehicle.client_id,
        // Backend espera string; enviar tipos como string separada por vírgula
        service_type: Array.isArray(serviceTypes) ? serviceTypes.join(', ') : String(serviceTypes || ''),
        cost: parseFloat(formData.totalValue),
        service_date: formData.entryDate,
        status: statusMap[formData.paymentStatus] || 'Pendente'
      };

      // Campos opcionais somente quando preenchidos (evitar validação em null)
      if (formData.description && formData.description.trim()) {
        serviceData.description = formData.description.trim();
      }
      if (formData.exitDate) {
        serviceData.exit_date = formData.exitDate;
      }
      if (formData.mileage) {
        serviceData.mileage = parseInt(formData.mileage, 10);
      }

      onSubmit(serviceData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Função para lidar com seleção múltipla de tipos de serviço
  const handleServiceTypeChange = (serviceType) => {
    setFormData(prev => {
      const currentTypes = [...prev.type];
      const typeIndex = currentTypes.indexOf(serviceType);
      
      if (typeIndex > -1) {
        // Se já está selecionado, remove
        currentTypes.splice(typeIndex, 1);
      } else {
        // Se não está selecionado, adiciona
        currentTypes.push(serviceType);
      }
      
      return { ...prev, type: currentTypes };
    });
    
    // Limpar erro do campo quando o usuário fizer uma seleção
    if (errors.type) {
      setErrors(prev => ({ ...prev, type: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Campo de Veículo */}
        <div>
          <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700 mb-1">
            Veículo *
          </label>
          <select
            id="vehicleId"
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            className={`select-light w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 ${
              errors.vehicleId ? 'border-red-500' : 'border-gray-300'
            }`}
            required
          >
            <option value="">Selecione um veículo</option>
            {state.vehicles.map((vehicle) => {
              const vehicleIdString = String(vehicle.id);
              const isSelected = vehicleIdString === formData.vehicleId;
              
              return (
                <option key={vehicle.id} value={vehicleIdString}>
                  {vehicle.license_plate} - {vehicle.brand} {vehicle.model}
                </option>
              );
            })}
          </select>
          {errors.vehicleId && (
            <p className="mt-1 text-sm text-red-600">{errors.vehicleId}</p>
          )}
        </div>

        {/* Tipo de Serviço */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipos de Serviço *
          </label>
          <div className={`grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border rounded-md ${
            errors.type ? 'border-red-500' : 'border-gray-300'
          }`}>
            {serviceTypes.map((serviceType) => (
              <label key={serviceType} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.type.includes(serviceType)}
                  onChange={() => handleServiceTypeChange(serviceType)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{serviceType}</span>
              </label>
            ))}
            
            {/* Opção "Outro" */}
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.type.includes('Outro')}
                onChange={() => handleServiceTypeChange('Outro')}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Outro</span>
            </label>
          </div>
          
          {/* Mostrar tipos selecionados */}
          {formData.type.length > 0 && (
            <div className="mt-2">
              <p className="text-sm text-gray-600">Selecionados:</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {formData.type.map((type, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {type}
                    <button
                      type="button"
                      onClick={() => handleServiceTypeChange(type)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type}</p>
          )}
        </div>

        {/* Campo Personalizado - aparece apenas quando "Outro" é selecionado */}
        {formData.type.includes('Outro') && (
          <div className="md:col-span-2">
            <label htmlFor="customType" className="block text-sm font-medium text-gray-700 mb-2">
              Especifique o Tipo de Serviço *
            </label>
            <input
              type="text"
              id="customType"
              name="customType"
              value={formData.customType}
              onChange={handleChange}
              placeholder="Digite o tipo de serviço personalizado..."
              className={`input-field input-light ${errors.customType ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.customType && (
              <p className="mt-1 text-sm text-red-600">{errors.customType}</p>
            )}
          </div>
        )}

        {/* Data de Entrada */}
        <div>
          <label htmlFor="entryDate" className="block text-sm font-medium text-gray-700 mb-2">
            Data de Entrada *
          </label>
          <input
            type="date"
            id="entryDate"
            name="entryDate"
            value={formData.entryDate}
            onChange={handleChange}
            className={`input-field input-light ${errors.entryDate ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          {errors.entryDate && (
            <p className="mt-1 text-sm text-red-600">{errors.entryDate}</p>
          )}
        </div>

        {/* Data de Saída */}
        <div>
          <label htmlFor="exitDate" className="block text-sm font-medium text-gray-700 mb-2">
            Data de Saída
          </label>
          <input
            type="date"
            id="exitDate"
            name="exitDate"
            value={formData.exitDate}
            onChange={handleChange}
            className={`input-field input-light ${errors.exitDate ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          {errors.exitDate && (
            <p className="mt-1 text-sm text-red-600">{errors.exitDate}</p>
          )}
        </div>

        {/* Quilometragem */}
        <div>
          <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-2">
            Quilometragem (km) *
          </label>
          <input
            type="number"
            id="mileage"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            placeholder="45000"
            min="0"
            className={`input-field input-light ${errors.mileage ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          {errors.mileage && (
            <p className="mt-1 text-sm text-red-600">{errors.mileage}</p>
          )}
        </div>

        {/* Status de Pagamento */}
        <div>
          <label htmlFor="paymentStatus" className="block text-sm font-medium text-gray-700 mb-2">
            Status de Pagamento
          </label>
          <select
            id="paymentStatus"
            name="paymentStatus"
            value={formData.paymentStatus}
            onChange={handleChange}
            className="input-field select-light bg-white text-gray-900"
          >
          <option value="pending">📋 Em Análise</option>
            <option value="in_progress">🔧 Em Andamento</option>
            <option value="completed">✅ Concluído</option>
            <option value="cancelled">❌ Cancelado</option>
          </select>
        </div>
      </div>

      {/* Descrição */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
          Descrição do Serviço *
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          placeholder="Descreva detalhadamente o serviço realizado..."
          className={`input-field input-light resize-none ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">{errors.description}</p>
        )}
      </div>

      {/* Valor Total */}
      <div>
        <label htmlFor="totalValue" className="block text-sm font-medium text-gray-700 mb-2">
          Valor Total do Serviço (R$) *
        </label>
        <input
          type="number"
          id="totalValue"
          name="totalValue"
          value={formData.totalValue}
          onChange={handleChange}
          placeholder="350.00"
          min="0"
          step="0.01"
            className={`input-field input-light ${errors.totalValue ? 'border-red-500 focus:ring-red-500' : ''}`}
        />
        {errors.totalValue && (
          <p className="mt-1 text-sm text-red-600">{errors.totalValue}</p>
        )}
      </div>

      {/* Botões */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn-primary"
        >
          {service ? 'Atualizar Serviço' : 'Registrar Serviço'}
        </button>
      </div>
    </form>
  );
};

export default ServiceForm;