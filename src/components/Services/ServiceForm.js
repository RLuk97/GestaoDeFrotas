import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Plus, Trash2 } from 'lucide-react';

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
    paymentStatus: 'pending',
    parts: []
  });
  const [errors, setErrors] = useState({});
  const [newPart, setNewPart] = useState({
    name: '',
    quantity: 1,
    unitPrice: ''
  });

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
        paymentStatus: service.paymentStatus || 'pending',
        parts: service.parts || []
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
        totalValue: parseFloat(formData.totalValue),
        parts: formData.parts.map(part => ({
          ...part,
          quantity: parseInt(part.quantity),
          unitPrice: parseFloat(part.unitPrice)
        }))
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

  const handleAddPart = () => {
    if (newPart.name && newPart.quantity && newPart.unitPrice) {
      const part = {
        id: Date.now(),
        name: newPart.name,
        quantity: parseInt(newPart.quantity),
        unitPrice: parseFloat(newPart.unitPrice)
      };
      setFormData(prev => ({
        ...prev,
        parts: [...prev.parts, part]
      }));
      setNewPart({ name: '', quantity: 1, unitPrice: '' });
    }
  };

  const handleRemovePart = (partId) => {
    setFormData(prev => ({
      ...prev,
      parts: prev.parts.filter(part => part.id !== partId)
    }));
  };

  const handleNewPartChange = (e) => {
    const { name, value } = e.target;
    setNewPart(prev => ({ ...prev, [name]: value }));
  };

  const partsTotal = formData.parts.reduce((sum, part) => sum + (part.quantity * part.unitPrice), 0);

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

      {/* Peças Utilizadas */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Peças Utilizadas</h3>
        
        {/* Lista de Peças */}
        {formData.parts.length > 0 && (
          <div className="mb-4">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Peça
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Qtd
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Valor Unit.
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Total
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Ação
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.parts.map((part) => (
                    <tr key={part.id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{part.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{part.quantity}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">R$ {part.unitPrice.toFixed(2)}</td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">
                        R$ {(part.quantity * part.unitPrice).toFixed(2)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemovePart(part.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td colSpan="3" className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                      Total das Peças:
                    </td>
                    <td className="px-4 py-2 text-sm font-bold text-gray-900">
                      R$ {partsTotal.toFixed(2)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Adicionar Nova Peça */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Adicionar Peça</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <input
                type="text"
                name="name"
                value={newPart.name}
                onChange={handleNewPartChange}
                placeholder="Nome da peça"
                className="input-field"
              />
            </div>
            <div>
              <input
                type="number"
                name="quantity"
                value={newPart.quantity}
                onChange={handleNewPartChange}
                placeholder="Qtd"
                min="1"
                className="input-field"
              />
            </div>
            <div>
              <input
                type="number"
                name="unitPrice"
                value={newPart.unitPrice}
                onChange={handleNewPartChange}
                placeholder="Valor unitário"
                min="0"
                step="0.01"
                className="input-field"
              />
            </div>
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={handleAddPart}
              disabled={!newPart.name || !newPart.quantity || !newPart.unitPrice}
              className="btn-secondary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Peça
            </button>
          </div>
        </div>
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
        {partsTotal > 0 && (
          <p className="mt-1 text-sm text-gray-500">
            Valor das peças: R$ {partsTotal.toFixed(2)}
          </p>
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