const express = require('express');
const { body, validationResult } = require('express-validator');
const Vehicle = require('../models/Vehicle');
const Client = require('../models/Client');
const router = express.Router();

// Middleware para validação de erros
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Dados inválidos',
      details: errors.array()
    });
  }
  next();
};

// Validações para veículo
const vehicleValidation = [
  body('client_id')
    .optional()
    .isUUID()
    .withMessage('ID do cliente deve ser um UUID válido'),
  body('brand')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Marca deve ter entre 2 e 100 caracteres'),
  body('model')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Modelo deve ter entre 2 e 100 caracteres'),
  body('year')
    .isInt({ min: 1900, max: new Date().getFullYear() + 1 })
    .withMessage('Ano deve ser válido'),
  body('license_plate')
    .trim()
    .isLength({ min: 7, max: 8 })
    .matches(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/)
    .withMessage('Placa deve estar no formato brasileiro (ABC1234 ou ABC1D23)'),
  body('color')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Cor deve ter no máximo 50 caracteres'),
  body('fuel_type')
    .optional()
    .isIn(['Gasolina', 'Etanol', 'Flex', 'Diesel', 'GNV', 'Elétrico', 'Híbrido'])
    .withMessage('Tipo de combustível inválido'),
  body('mileage')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quilometragem deve ser um número positivo')
];

// GET /api/vehicles - Listar todos os veículos
router.get('/', async (req, res) => {
  try {
    const { client_id, with_services } = req.query;
    
    let vehicles;
    if (client_id) {
      vehicles = await Vehicle.findByClientId(client_id);
    } else if (with_services === 'true') {
      vehicles = await Vehicle.findWithServices();
    } else {
      vehicles = await Vehicle.findAll();
    }
    
    res.json({
      success: true,
      data: vehicles,
      count: vehicles.length
    });
  } catch (error) {
    console.error('Erro ao buscar veículos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar os veículos'
    });
  }
});

// GET /api/vehicles/:id - Buscar veículo por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);
    
    if (!vehicle) {
      return res.status(404).json({
        error: 'Veículo não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: vehicle
    });
  } catch (error) {
    console.error('Erro ao buscar veículo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar o veículo'
    });
  }
});

// POST /api/vehicles - Criar novo veículo
router.post('/', vehicleValidation, handleValidationErrors, async (req, res) => {
  try {
    const { client_id, brand, model, year, license_plate, color, fuel_type, mileage } = req.body;
    
    // Verificar cliente apenas se fornecido
    if (client_id) {
      const client = await Client.findById(client_id);
      if (!client) {
        return res.status(404).json({
          error: 'Cliente não encontrado'
        });
      }
    }
    
    // Verificar se placa já existe
    const existingVehicle = await Vehicle.findByLicensePlate(license_plate);
    if (existingVehicle) {
      return res.status(409).json({
        error: 'Placa já cadastrada',
        message: 'Já existe um veículo com esta placa'
      });
    }
    
    const vehicle = await Vehicle.create({
      client_id: client_id || null,
      brand,
      model,
      year,
      license_plate: license_plate.toUpperCase(),
      color,
      fuel_type: fuel_type || 'Gasolina',
      mileage: mileage || 0
    });
    
    res.status(201).json({
      success: true,
      message: 'Veículo criado com sucesso',
      data: vehicle
    });
  } catch (error) {
    console.error('Erro ao criar veículo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível criar o veículo'
    });
  }
});

// PUT /api/vehicles/:id - Atualizar veículo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { client_id, brand, model, year, license_plate, color, fuel_type, mileage, status } = req.body;
    
    // Verificar se veículo existe
    const existingVehicle = await Vehicle.findById(id);
    if (!existingVehicle) {
      return res.status(404).json({
        error: 'Veículo não encontrado'
      });
    }
    
    // Se apenas o status está sendo atualizado, não validar outros campos
    if (status && Object.keys(req.body).length === 1) {
      // Validar status
      if (!['active', 'inactive', 'maintenance'].includes(status)) {
        return res.status(400).json({
          error: 'Status inválido',
          message: 'Status deve ser: active, inactive ou maintenance'
        });
      }
      
      const vehicle = await Vehicle.update(id, { ...existingVehicle, status });
      
      return res.json({
        success: true,
        message: 'Status do veículo atualizado com sucesso',
        data: vehicle
      });
    }
    
    // Validação completa para outros campos
    if (client_id) {
      const client = await Client.findById(client_id);
      if (!client) {
        return res.status(404).json({
          error: 'Cliente não encontrado'
        });
      }
    }
    
    // Verificar se placa já existe em outro veículo
    if (license_plate) {
      const plateVehicle = await Vehicle.findByLicensePlate(license_plate);
      if (plateVehicle && plateVehicle.id !== id) {
        return res.status(409).json({
          error: 'Placa já cadastrada',
          message: 'Já existe outro veículo com esta placa'
        });
      }
    }
    
    const vehicle = await Vehicle.update(id, {
      client_id: client_id || existingVehicle.client_id,
      brand: brand || existingVehicle.brand,
      model: model || existingVehicle.model,
      year: year || existingVehicle.year,
      license_plate: license_plate ? license_plate.toUpperCase() : existingVehicle.license_plate,
      color: color || existingVehicle.color,
      fuel_type: fuel_type || existingVehicle.fuel_type,
      mileage: mileage !== undefined ? mileage : existingVehicle.mileage,
      status: status || existingVehicle.status
    });
    
    res.json({
      success: true,
      message: 'Veículo atualizado com sucesso',
      data: vehicle
    });
  } catch (error) {
    console.error('Erro ao atualizar veículo:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível atualizar o veículo'
    });
  }
});

// DELETE /api/vehicles/:id - Deletar veículo
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se veículo existe
    const existingVehicle = await Vehicle.findById(id);
    if (!existingVehicle) {
      return res.status(404).json({
        error: 'Veículo não encontrado'
      });
    }
    
    const deleted = await Vehicle.delete(id);
    
    if (deleted) {
      res.json({
        success: true,
        message: 'Veículo deletado com sucesso'
      });
    } else {
      res.status(500).json({
        error: 'Erro ao deletar veículo'
      });
    }
  } catch (error) {
    console.error('Erro ao deletar veículo:', error);
    
    // Verificar se é erro de constraint (veículo tem serviços)
    if (error.code === '23503') {
      return res.status(409).json({
        error: 'Não é possível deletar veículo',
        message: 'Veículo possui serviços cadastrados'
      });
    }
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível deletar o veículo'
    });
  }
});

// GET /api/vehicles/stats/count - Contar veículos
router.get('/stats/count', async (req, res) => {
  try {
    const count = await Vehicle.count();
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Erro ao contar veículos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/vehicles/stats/brands - Estatísticas por marca
router.get('/stats/brands', async (req, res) => {
  try {
    const stats = await Vehicle.getStatsByBrand();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;