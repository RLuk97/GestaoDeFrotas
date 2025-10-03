import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

const VehicleForm = ({ vehicle, onSubmit, onCancel }) => {
  const { state } = useApp();
  const [formData, setFormData] = useState({
    license_plate: '',
    brand: '',
    model: '',
    customModel: '',
    year: '',
    mileage: '',
    color: '',
    fuel_type: 'Gasolina',
    client_id: '',
    renavam: '',
    licensing_status: '',
    insurance_status: '',
    ipva_status: ''
  });
  const [errors, setErrors] = useState({});
  const [showCustomModel, setShowCustomModel] = useState(false);

  // Dados de marcas e modelos
  const vehicleBrands = {
    'Audi': ['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT'],
    'BMW': ['Série 1', 'Série 2', 'Série 3', 'Série 4', 'Série 5', 'Série 6', 'Série 7', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4'],
    'Chevrolet': ['Onix', 'Prisma', 'Cruze', 'Equinox', 'Tracker', 'Trailblazer', 'S10', 'Montana', 'Spin', 'Cobalt'],
    'Fiat': ['Argo', 'Cronos', 'Mobi', 'Uno', 'Palio', 'Siena', 'Strada', 'Toro', 'Fiorino', 'Ducato'],
    'Ford': ['Ka', 'Fiesta', 'Focus', 'Fusion', 'EcoSport', 'Edge', 'Explorer', 'Ranger', 'Transit'],
    'Honda': ['Fit', 'City', 'Civic', 'Accord', 'HR-V', 'CR-V', 'Pilot', 'Ridgeline'],
    'Hyundai': ['HB20', 'HB20S', 'Elantra', 'Sonata', 'Azera', 'Creta', 'Tucson', 'Santa Fe', 'Veloster'],
    'Jeep': ['Renegade', 'Compass', 'Cherokee', 'Grand Cherokee', 'Wrangler', 'Commander'],
    'Kia': ['Picanto', 'Rio', 'Cerato', 'Optima', 'Stinger', 'Sportage', 'Sorento', 'Mohave'],
    'Mercedes-Benz': ['Classe A', 'Classe B', 'Classe C', 'Classe E', 'Classe S', 'CLA', 'CLS', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS'],
    'Mitsubishi': ['Mirage', 'Lancer', 'Eclipse Cross', 'Outlander', 'Pajero', 'L200'],
    'Nissan': ['March', 'Versa', 'Sentra', 'Altima', 'Maxima', 'Kicks', 'X-Trail', 'Pathfinder', 'Frontier'],
    'Peugeot': ['208', '2008', '308', '3008', '408', '508', '5008', 'Partner', 'Expert'],
    'Renault': ['Kwid', 'Sandero', 'Logan', 'Duster', 'Captur', 'Koleos', 'Oroch', 'Master'],
    'Toyota': ['Etios', 'Yaris', 'Corolla', 'Camry', 'Prius', 'RAV4', 'Highlander', 'Land Cruiser', 'Hilux', 'SW4'],
    'Volkswagen': ['Up!', 'Gol', 'Voyage', 'Polo', 'Virtus', 'Jetta', 'Passat', 'T-Cross', 'Tiguan', 'Touareg', 'Amarok'],
    'Volvo': ['XC40', 'XC60', 'XC90', 'S60', 'S90', 'V40', 'V60', 'V90']
  };

  const [availableModels, setAvailableModels] = useState([]);

  useEffect(() => {
    if (vehicle) {
      // Garantir que TODOS os campos existam (nunca undefined) para inputs controlados
      setFormData(prev => ({
        ...prev,
        license_plate: vehicle.license_plate ?? '',
        brand: vehicle.brand ?? '',
        model: vehicle.model ?? '',
        customModel: '',
        year: vehicle.year ?? '',
        mileage: vehicle.mileage ?? '',
        color: vehicle.color ?? '',
        fuel_type: vehicle.fuel_type ?? 'Gasolina',
        client_id: vehicle.client_id ?? '',
        renavam: vehicle.renavam ?? '',
        licensing_status: vehicle.licensing_status ?? '',
        insurance_status: vehicle.insurance_status ?? '',
        ipva_status: vehicle.ipva_status ?? ''
      }));

      // Atualizar modelos disponíveis se a marca estiver definida
      if (vehicle.brand && vehicleBrands[vehicle.brand]) {
        const modelsWithOther = [...vehicleBrands[vehicle.brand], 'Outro'];
        setAvailableModels(modelsWithOther);
      } else {
        setAvailableModels([]);
      }

      // Exibir campo de modelo personalizado quando necessário
      setShowCustomModel(vehicle.model === 'Outro');
    }
  }, [vehicle]);

  // Função para lidar com mudança de marca
  const handleBrandChange = (e) => {
    const selectedBrand = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      brand: selectedBrand,
      model: '' // Limpar modelo quando marca mudar
    }));
    
    // Atualizar modelos disponíveis
    if (selectedBrand && vehicleBrands[selectedBrand]) {
      // Adicionar "Outro" como opção para todos os modelos
      const modelsWithOther = [...vehicleBrands[selectedBrand], 'Outro'];
      setAvailableModels(modelsWithOther);
    } else {
      setAvailableModels([]);
    }
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors.brand) {
      setErrors(prev => ({ ...prev, brand: '' }));
    }
    if (errors.model) {
      setErrors(prev => ({ ...prev, model: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.license_plate.trim()) {
      newErrors.license_plate = 'Placa é obrigatória';
    } else if (!/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/.test(formData.license_plate.replace(/[-\s]/g, '').toUpperCase())) {
      newErrors.license_plate = 'Formato de placa inválido (ex: ABC1234 ou ABC1D23)';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Marca é obrigatória';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Modelo é obrigatório';
    } else if (formData.model === 'Outro' && !formData.customModel.trim()) {
      newErrors.customModel = 'Especifique o modelo personalizado';
    }

    if (!formData.year) {
      newErrors.year = 'Ano é obrigatório';
    } else if (isNaN(formData.year) || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Ano deve ser válido';
    }

    if (formData.mileage && (isNaN(formData.mileage) || formData.mileage < 0)) {
      newErrors.mileage = 'Quilometragem deve ser um número válido';
    }

    // Cliente é opcional no cadastro de veículo

    // Removendo validações de campos que não existem no backend
    // if (!formData.renavam.trim()) {
    //   newErrors.renavam = 'RENAVAM é obrigatório';
    // }

    // if (!formData.licensing_status.trim()) {
    //   newErrors.licensing_status = 'Status do licenciamento é obrigatório';
    // }

    // if (!formData.insurance_status.trim()) {
    //   newErrors.insurance_status = 'Status do seguro é obrigatório';
    // }

    // if (!formData.ipva_status.trim()) {
    //   newErrors.ipva_status = 'Status do IPVA é obrigatório';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const vehicleData = {
          ...formData,
          // Se selecionou "Outro", usar o modelo personalizado
          model: formData.model === 'Outro' ? formData.customModel : formData.model,
          license_plate: formData.license_plate.toUpperCase().replace(/[-\s]/g, ''),
          year: parseInt(formData.year),
          mileage: formData.mileage ? parseInt(formData.mileage) : 0
        };

        // Remover client_id se não selecionado (evita falha na validação de UUID)
        if (!vehicleData.client_id || String(vehicleData.client_id).trim() === '') {
          delete vehicleData.client_id;
        }

        // Remover o campo customModel antes de enviar
        delete vehicleData.customModel;

        await onSubmit(vehicleData);
        
        // Reset form
        setFormData({
          license_plate: '',
          brand: '',
          model: '',
          customModel: '',
          year: '',
          mileage: '',
          color: '',
          fuel_type: 'Gasolina',
          client_id: '',
          renavam: '',
          licensing_status: '',
          insurance_status: '',
          ipva_status: ''
        });
        setShowCustomModel(false);
        setErrors({});
      } catch (error) {
        console.error('Erro ao salvar veículo:', error);
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'model') {
      // Se selecionou "Outro", mostrar campo personalizado
      if (value === 'Outro') {
        setShowCustomModel(true);
        setFormData(prev => ({ ...prev, [name]: value, customModel: '' }));
      } else {
        setShowCustomModel(false);
        setFormData(prev => ({ ...prev, [name]: value, customModel: '' }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const formatPlate = (value) => {
    // Remove caracteres não alfanuméricos e converte para maiúsculo
    const cleaned = value.replace(/[^A-Z0-9]/gi, '').toUpperCase();
    
    // Aplica a máscara ABC1234 ou ABC1D23
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 7) {
      return cleaned.slice(0, 3) + cleaned.slice(3);
    }
    return cleaned.slice(0, 7);
  };

  const handlePlateChange = (e) => {
    const formatted = formatPlate(e.target.value);
    setFormData(prev => ({ ...prev, license_plate: formatted }));
    
    if (errors.license_plate) {
      setErrors(prev => ({ ...prev, license_plate: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Placa */}
        <div>
          <label htmlFor="license_plate" className="block text-sm font-medium text-gray-700 mb-2">
            Placa *
          </label>
          <input
            type="text"
            id="license_plate"
            name="license_plate"
            value={formData.license_plate}
            onChange={handlePlateChange}
            placeholder="XYZ5678"
            maxLength={7}
            className={`input-field ${errors.license_plate ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          {errors.license_plate && (
            <p className="mt-1 text-sm text-red-600">{errors.license_plate}</p>
          )}
        </div>

        {/* Cliente */}
        <div>
          <label htmlFor="client_id" className="block text-sm font-medium text-gray-700 mb-2">
            Cliente (Opcional)
          </label>
          <select
            id="client_id"
            name="client_id"
            value={formData.client_id}
            onChange={handleChange}
            className={`input-field ${errors.client_id ? 'border-red-500 focus:ring-red-500' : ''}`}
          >
            <option value="">Nenhum cliente (veículo da frota)</option>
            {state.clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
          {errors.client_id && (
            <p className="mt-1 text-sm text-red-600">{errors.client_id}</p>
          )}
        </div>

        {/* Marca */}
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
            Marca *
          </label>
          <select
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleBrandChange}
            className={`input-field ${errors.brand ? 'border-red-500 focus:ring-red-500' : ''}`}
          >
            <option value="">Selecione uma marca</option>
            {Object.keys(vehicleBrands).sort().map(brand => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
          {errors.brand && (
            <p className="mt-1 text-sm text-red-600">{errors.brand}</p>
          )}
        </div>

        {/* Modelo */}
        <div>
          <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-2">
            Modelo *
          </label>
          <select
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            disabled={!formData.brand || availableModels.length === 0}
            className={`input-field ${errors.model ? 'border-red-500 focus:ring-red-500' : ''} ${!formData.brand ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="">
              {!formData.brand ? 'Selecione uma marca primeiro' : 'Selecione um modelo'}
            </option>
            {availableModels.map(model => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          {errors.model && (
            <p className="mt-1 text-sm text-red-600">{errors.model}</p>
          )}
        </div>

        {/* Campo personalizado para modelo "Outro" */}
        {showCustomModel && (
          <div>
            <label htmlFor="customModel" className="block text-sm font-medium text-gray-700 mb-2">
              Especifique o Modelo *
            </label>
            <input
              type="text"
              id="customModel"
              name="customModel"
              value={formData.customModel}
              onChange={handleChange}
              placeholder="Digite o modelo do veículo"
              className={`input-field ${errors.customModel ? 'border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.customModel && (
              <p className="mt-1 text-sm text-red-600">{errors.customModel}</p>
            )}
          </div>
        )}

        {/* Ano */}
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-2">
            Ano *
          </label>
          <input
            type="number"
            id="year"
            name="year"
            value={formData.year}
            onChange={handleChange}
            placeholder="2020"
            min="1900"
            max={new Date().getFullYear() + 1}
            className={`input-field ${errors.year ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          {errors.year && (
            <p className="mt-1 text-sm text-red-600">{errors.year}</p>
          )}
        </div>

        {/* Quilometragem */}
        <div>
          <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-2">
            Quilometragem Atual (km)
          </label>
          <input
            type="number"
            id="mileage"
            name="mileage"
            value={formData.mileage}
            onChange={handleChange}
            placeholder="55000"
            min="0"
            className={`input-field ${errors.mileage ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          {errors.mileage && (
            <p className="mt-1 text-sm text-red-600">{errors.mileage}</p>
          )}
        </div>

        {/* Cor */}
        <div>
          <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
            Cor
          </label>
          <input
            type="text"
            id="color"
            name="color"
            value={formData.color}
            onChange={handleChange}
            placeholder="Branco"
            className="input-field"
          />
        </div>

        {/* Tipo de Combustível */}
        <div>
          <label htmlFor="fuel_type" className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Combustível
          </label>
          <select
            id="fuel_type"
            name="fuel_type"
            value={formData.fuel_type}
            onChange={handleChange}
            className="input-field"
          >
            <option value="Gasolina">Gasolina</option>
            <option value="Etanol">Etanol</option>
            <option value="Flex">Flex</option>
            <option value="Diesel">Diesel</option>
            <option value="GNV">GNV</option>
            <option value="Elétrico">Elétrico</option>
            <option value="Híbrido">Híbrido</option>
          </select>
        </div>

        {/* RENAVAM - Campo opcional */}
        <div>
          <label htmlFor="renavam" className="block text-sm font-medium text-gray-700 mb-2">
            RENAVAM
          </label>
          <input
            type="text"
            id="renavam"
            name="renavam"
            value={formData.renavam}
            onChange={handleChange}
            placeholder="12345678901"
            className={`input-field ${errors.renavam ? 'border-red-500 focus:ring-red-500' : ''}`}
          />
          {errors.renavam && (
            <p className="mt-1 text-sm text-red-600">{errors.renavam}</p>
          )}
        </div>

        {/* Status do Licenciamento - Campo opcional */}
        <div>
          <label htmlFor="licensing_status" className="block text-sm font-medium text-gray-700 mb-2">
            Licenciamento
          </label>
          <select
            id="licensing_status"
            name="licensing_status"
            value={formData.licensing_status}
            onChange={handleChange}
            className={`input-field ${errors.licensing_status ? 'border-red-500 focus:ring-red-500' : ''}`}
          >
            <option value="">Selecione o status</option>
            <option value="Em dia">Em dia</option>
            <option value="Vencido">Vencido</option>
            <option value="Pendente">Pendente</option>
          </select>
          {errors.licensing_status && (
            <p className="mt-1 text-sm text-red-600">{errors.licensing_status}</p>
          )}
        </div>

        {/* Status do Seguro - Campo opcional */}
        <div>
          <label htmlFor="insurance_status" className="block text-sm font-medium text-gray-700 mb-2">
            Seguro
          </label>
          <select
            id="insurance_status"
            name="insurance_status"
            value={formData.insurance_status}
            onChange={handleChange}
            className={`input-field ${errors.insurance_status ? 'border-red-500 focus:ring-red-500' : ''}`}
          >
            <option value="">Selecione o status</option>
            <option value="Ativo">Ativo</option>
            <option value="Vencido">Vencido</option>
            <option value="Cancelado">Cancelado</option>
            <option value="Pendente">Pendente</option>
          </select>
          {errors.insurance_status && (
            <p className="mt-1 text-sm text-red-600">{errors.insurance_status}</p>
          )}
        </div>

        {/* Status do IPVA - Campo opcional */}
        <div>
          <label htmlFor="ipva_status" className="block text-sm font-medium text-gray-700 mb-2">
            IPVA
          </label>
          <select
            id="ipva_status"
            name="ipva_status"
            value={formData.ipva_status}
            onChange={handleChange}
            className={`input-field ${errors.ipva_status ? 'border-red-500 focus:ring-red-500' : ''}`}
          >
            <option value="">Selecione o status</option>
            <option value="Pago">Pago</option>
            <option value="Em atraso">Em atraso</option>
            <option value="Isento">Isento</option>
            <option value="Parcelado">Parcelado</option>
          </select>
          {errors.ipva_status && (
            <p className="mt-1 text-sm text-red-600">{errors.ipva_status}</p>
          )}
        </div>
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