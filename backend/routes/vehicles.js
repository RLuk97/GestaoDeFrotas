const express = require('express');
const { body, validationResult } = require('express-validator');
const Vehicle = require('../models/Vehicle');
const Client = require('../models/Client');
const ActivityLog = require('../models/ActivityLog');
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
    .withMessage('Quilometragem deve ser um número positivo'),
  // RENAVAM opcional no backend; se enviado, precisa ter 11 dígitos
  body('renavam')
    .optional({ nullable: true })
    .matches(/^\d{11}$/)
    .withMessage('RENAVAM deve conter exatamente 11 dígitos'),
  // Status de documentação (opcionais)
  body('licensing_status')
    .optional({ nullable: true })
    .isIn(['Em dia', 'Vencido', 'Pendente', ''])
    .withMessage('Status de licenciamento inválido'),
  body('insurance_status')
    .optional({ nullable: true })
    .isIn(['Ativo', 'Vencido', 'Cancelado', 'Pendente', ''])
    .withMessage('Status de seguro inválido'),
  body('ipva_status')
    .optional({ nullable: true })
    .isIn(['Pago', 'Em atraso', 'Isento', 'Parcelado', ''])
    .withMessage('Status de IPVA inválido')
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
    const { client_id, brand, model, year, license_plate, color, fuel_type, mileage, renavam, licensing_status, insurance_status, ipva_status } = req.body;
    
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
      mileage: mileage || 0,
      renavam: renavam || null,
      licensing_status: licensing_status || null,
      insurance_status: insurance_status || null,
      ipva_status: ipva_status || null
    });
    
    // Log de atividade: veículo criado
    try {
      const title = `Veículo criado: ${brand} ${model}`;
      const desc = `Placa ${vehicle.license_plate}${client_id ? ` — Cliente ${client_id}` : ''}`;
      await ActivityLog.create({
        entity_type: 'vehicle',
        action: 'created',
        entity_id: vehicle.id,
        title,
        description: desc,
        amount: 0,
        status: 'created',
        metadata: client_id ? { client_id } : null
      });
    } catch (e) { console.warn('Falha ao registrar ActivityLog (create vehicle):', e.message); }

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
    const { client_id, brand, model, year, license_plate, color, fuel_type, mileage, status, renavam, licensing_status, insurance_status, ipva_status } = req.body;
    
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
      
      // Log de atividade: status de veículo atualizado
      try {
        await ActivityLog.create({
          entity_type: 'vehicle',
          action: 'updated',
          entity_id: vehicle.id,
          title: `Status do veículo atualizado: ${vehicle.license_plate}`,
          description: `Status: ${status}`,
          amount: 0,
          status: 'updated'
        });
      } catch (e) { console.warn('Falha ao registrar ActivityLog (update vehicle status):', e.message); }

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
      status: status || existingVehicle.status,
      renavam: renavam !== undefined ? renavam : existingVehicle.renavam,
      licensing_status: licensing_status !== undefined ? licensing_status : existingVehicle.licensing_status,
      insurance_status: insurance_status !== undefined ? insurance_status : existingVehicle.insurance_status,
      ipva_status: ipva_status !== undefined ? ipva_status : existingVehicle.ipva_status
    });
    
    // Log de atividade: veículo atualizado
    try {
      const title = `Veículo atualizado: ${vehicle.brand} ${vehicle.model}`;
      const desc = `Placa ${vehicle.license_plate}`;
      await ActivityLog.create({
        entity_type: 'vehicle',
        action: 'updated',
        entity_id: vehicle.id,
        title,
        description: desc,
        amount: 0,
        status: 'updated'
      });
    } catch (e) { console.warn('Falha ao registrar ActivityLog (update vehicle):', e.message); }

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
      // Log de atividade: veículo excluído
      try {
        await ActivityLog.create({
          entity_type: 'vehicle',
          action: 'deleted',
          entity_id: existingVehicle.id,
          title: `Veículo excluído: ${existingVehicle.brand} ${existingVehicle.model}`,
          description: `Placa ${existingVehicle.license_plate}`,
          amount: 0,
          status: 'deleted'
        });
      } catch (e) { console.warn('Falha ao registrar ActivityLog (delete vehicle):', e.message); }

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