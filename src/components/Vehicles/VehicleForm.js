import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const VehicleForm = ({ vehicle, onSubmit, onCancel }) => {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    plate: '',
    brand: '',
    model: '',
    currentMileage: '',
    observations: '',
    clientId: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (vehicle) {
      setFormData({
        plate: vehicle.plate || '',
        brand: vehicle.brand || '',
        model: vehicle.model || '',
        currentMileage: vehicle.currentMileage || '',
        observations: vehicle.observations || '',
        clientId: vehicle.clientId || ''
      });
    }
  }, [vehicle]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.plate.trim()) {
      newErrors.plate = 'Placa é obrigatória';
    } else if (!/^[A-Z]{3}-?\d{4}$/.test(formData.plate.replace(/\s/g, '').toUpperCase())) {
      newErrors.plate = 'Formato de placa inválido (ex: ABC-1234)';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Marca é obrigatória';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Modelo é obrigatório';
    }

    if (!formData.currentMileage) {
      newErrors.currentMileage = 'Quilometragem é obrigatória';
    } else if (isNaN(formData.currentMileage) || formData.currentMileage < 0) {
      newErrors.currentMileage = 'Quilometragem deve ser um número válido';
    }

    if (!formData.clientId) {
      newErrors.clientId = 'Cliente é obrigatório';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const vehicleData = {
        ...formData,
        plate: formData.plate.toUpperCase().replace(/\s/g, ''),
        currentMileage: parseInt(formData.currentMileage),
        clientId: parseInt(formData.clientId)
      };
      onSubmit(vehicleData);
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

  const formatPlate = (value) => {
    // Remove caracteres não alfanuméricos e converte para maiúsculo
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Aplica a máscara ABC-1234
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return cleaned.slice(0, 3) + '-' + cleaned.slice(3);
    }
    return cleaned.slice(0, 3) + '-' + cleaned.slice(3, 7);
  };

  const handlePlateChange = (e) => {
    const formatted = formatPlate(e.target.value);
    setFormData(prev => ({ ...prev, plate: formatted }));
    
    if (errors.plate) {
      setErrors(prev => ({ ...prev, plate: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Placa */}
        <div>
          <label htmlFor="plate" className="block text-sm font-medium text-gray-700 mb-2">
            Placa *
          </label>
          <input
            type="text"
            id="plate"
            name="plate"
            value={formData.plate}
            onChange={handlePlateChange}
            placeholder="ABC-1234"
            maxLength={8}
            className={`input-field ${errors.plate ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          {errors.plate && (
            <p className="mt-1 text-sm text-red-600">{errors.plate}</p>
          )}
        </div>

        {/* Cliente */}
        <div>
          <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
            Cliente *
          </label>
          <select
            id="clientId"
            name="clientId"
            value={formData.clientId}
            onChange={handleChange}
            className={`input-field ${errors.clientId ? 'border-red-500 focus:ring-red-500' : ''}`}
          >
            <option value="">Selecione um cliente</option>
            {state.clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          {errors.clientId && (
            <p className="mt-1 text-sm text-red-600">{errors.clientId}</p>
          )}
        </div>

        {/* Marca */}
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
            Marca *
          </label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            placeholder="Toyota, Honda, Volkswagen..."
            className={`input-field ${errors.brand ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          {errors.brand && (
            <p className="mt-1 text-sm text-red-600">{errors.brand}</p>
          )}
        </div>

        {/* Modelo */}
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
            Modelo *
          </label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="Corolla, Civic, Golf..."
            className={`input-field ${errors.model ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          {errors.model && (
            <p className="mt-1 text-sm text-red-600">{errors.model}</p>
          )}
        </div>

        {/* Quilometragem */}
        <div className="md:col-span-2">
          <label htmlFor="currentMileage" className="block text-sm font-medium text-gray-700 mb-2">
            Quilometragem Atual (km) *
          </label>
          <input
            type="number"
            id="currentMileage"
            name="currentMileage"
            value={formData.currentMileage}
            onChange={handleChange}
            placeholder="45000"
            min="0"
            className={`input-field ${errors.currentMileage ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          {errors.currentMileage && (
            <p className="mt-1 text-sm text-red-600">{errors.currentMileage}</p>
          )}
        </div>
      </div>

      {/* Observações */}
      <div>
        <label htmlFor="observations" className="block text-sm font-medium text-gray-700 mb-2">
          Observações Técnicas
        </label>
        <textarea
          id="observations"
          name="observations"
          value={formData.observations}
          onChange={handleChange}
          rows={4}
          placeholder="Informações adicionais sobre o veículo, estado geral, pendências..."
          className="input-field resize-none"
        />
        <p className="mt-1 text-sm text-gray-500">
          Informações técnicas relevantes sobre o veículo
        </p>
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
          {vehicle ? 'Atualizar Veículo' : 'Cadastrar Veículo'}
        </button>
      </div>
    </form>
  );
};

export default VehicleForm;