import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const ServiceForm = ({ service, onSubmit, onCancel, preselectedVehicleId }) => {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    vehicleId: preselectedVehicleId || '',
    type: '',
    description: '',
    entryDate: '',
    exitDate: '',
    mileage: '',
    totalValue: '',
    paymentStatus: 'pending'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (service) {
      setFormData({
        vehicleId: service.vehicleId || '',
        type: service.type || '',
        description: service.description || '',
        entryDate: service.entryDate || '',
        exitDate: service.exitDate || '',
        mileage: service.mileage || '',
        totalValue: service.totalValue || '',
        paymentStatus: service.paymentStatus || 'pending'
      });
    } else if (preselectedVehicleId) {
      setFormData(prev => ({ ...prev, vehicleId: preselectedVehicleId }));
    }
  }, [service, preselectedVehicleId]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.vehicleId) {
      newErrors.vehicleId = 'Veículo é obrigatório';
    }

    if (!formData.type.trim()) {
      newErrors.type = 'Tipo de serviço é obrigatório';
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
      const serviceData = {
        ...formData,
        vehicleId: parseInt(formData.vehicleId),
        mileage: parseInt(formData.mileage),
        totalValue: parseFloat(formData.totalValue)
      };
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Veículo */}
        <div>
          <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700 mb-2">
            Veículo *
          </label>
          <select
            id="vehicleId"
            name="vehicleId"
            value={formData.vehicleId}
            onChange={handleChange}
            className={`input-field ${errors.vehicleId ? 'border-red-500 focus:ring-red-500' : ''}`}
          >
            <option value="">Selecione um veículo</option>
            {state.vehicles.map(vehicle => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.plate} - {vehicle.brand} {vehicle.model}
              </option>
            ))}
          </select>
          {errors.vehicleId && (
            <p className="mt-1 text-sm text-red-600">{errors.vehicleId}</p>
          )}
        </div>

        {/* Tipo de Serviço */}
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Serviço *
          </label>
          <input
            type="text"
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            placeholder="Revisão, Conserto, Troca de peças..."
            className={`input-field ${errors.type ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          {errors.type && (
            <p className="mt-1 text-sm text-red-600">{errors.type}</p>
          )}
        </div>

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
            className={`input-field ${errors.entryDate ? 'border-red-500 focus:ring-red-500' : ''}`}
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
            className={`input-field ${errors.exitDate ? 'border-red-500 focus:ring-red-500' : ''}`}
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
            className={`input-field ${errors.mileage ? 'border-red-500 focus:ring-red-500' : ''}`}
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
            className="input-field"
          >
            <option value="pending">⚠️ Pendente</option>
            <option value="partial">💸 Parcialmente Pago</option>
            <option value="paid">✅ Pago</option>
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
          className={`input-field resize-none ${errors.description ? 'border-red-500 focus:ring-red-500' : ''}`}
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
          className={`input-field ${errors.totalValue ? 'border-red-500 focus:ring-red-500' : ''}`}
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