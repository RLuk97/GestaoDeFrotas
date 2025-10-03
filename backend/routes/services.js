const express = require('express');
const { body, validationResult } = require('express-validator');
const { query } = require('../config/database');
const Service = require('../models/Service');
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

// Validações para serviço
const serviceValidation = [
  body('vehicle_id')
    .isUUID()
    .withMessage('ID do veículo deve ser um UUID válido'),
  body('client_id')
    .isUUID()
    .withMessage('ID do cliente deve ser um UUID válido'),
  body('service_type')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Tipo de serviço deve ter entre 2 e 100 caracteres'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Descrição deve ter no máximo 1000 caracteres'),
  body('cost')
    .isFloat({ min: 0 })
    .withMessage('Custo deve ser um valor positivo'),
  body('service_date')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Data do serviço deve estar no formato YYYY-MM-DD'),
  body('exit_date')
    .optional()
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Data de saída deve estar no formato YYYY-MM-DD'),
  body('mileage')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quilometragem deve ser um número inteiro positivo'),
  body('status')
    .optional()
    .isIn(['Pendente', 'Em Andamento', 'Concluído', 'Cancelado'])
    .withMessage('Status inválido'),
  body('mechanic')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Nome do mecânico deve ter no máximo 255 caracteres'),
  body('parts_used')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Peças utilizadas deve ter no máximo 1000 caracteres'),
  body('labor_hours')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Horas de trabalho deve ser um valor positivo')
];

// GET /api/services - Listar todos os serviços
router.get('/', async (req, res) => {
  try {
    const { vehicle_id, client_id, status, start_date, end_date } = req.query;
    
    let services;
    if (vehicle_id) {
      services = await Service.findByVehicleId(vehicle_id);
    } else if (client_id) {
      services = await Service.findByClientId(client_id);
    } else if (start_date && end_date) {
      services = await Service.findByDateRange(start_date, end_date);
    } else {
      services = await Service.findAll();
    }
    
    // Filtrar por status se especificado
    if (status) {
      services = services.filter(service => service.status === status);
    }
    
    res.json({
      success: true,
      data: services,
      count: services.length
    });
  } catch (error) {
    console.error('Erro ao buscar serviços:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar os serviços'
    });
  }
});

// GET /api/services/:id - Buscar serviço por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const service = await Service.findById(id);
    
    if (!service) {
      return res.status(404).json({
        error: 'Serviço não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Erro ao buscar serviço:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar o serviço'
    });
  }
});

// POST /api/services - Criar novo serviço
router.post('/', serviceValidation, handleValidationErrors, async (req, res) => {
  try {
    const { 
      vehicle_id, 
      client_id, 
      service_type, 
      description, 
      cost, 
      service_date, 
      exit_date,
      mileage,
      status, 
      mechanic, 
      parts_used, 
      labor_hours 
    } = req.body;
    
    // Verificar se veículo existe
    const vehicle = await Vehicle.findById(vehicle_id);
    if (!vehicle) {
      return res.status(404).json({
        error: 'Veículo não encontrado'
      });
    }
    
    // Verificar se cliente existe
    const client = await Client.findById(client_id);
    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado'
      });
    }
    
    // Verificar se o veículo pertence ao cliente
    if (vehicle.client_id !== client_id) {
      return res.status(400).json({
        error: 'Veículo não pertence ao cliente especificado'
      });
    }
    
    const service = await Service.create({
      vehicle_id,
      client_id,
      service_type,
      description,
      cost,
      service_date,
      exit_date,
      mileage,
      status: status || 'Pendente',
      mechanic,
      parts_used,
      labor_hours: labor_hours || 0
    });

    // Garantir que o retorno inclua dados do veículo (placa/marca/modelo)
    const fullService = await Service.findById(service.id);

    // Atualizar a quilometragem e status do veículo
    if (mileage && mileage > 0) {
      // Atualizar a quilometragem primeiro
      await Vehicle.updateMileage(vehicle_id, mileage);
      
      // Buscar os dados atualizados do veículo
      const updatedVehicle = await Vehicle.findById(vehicle_id);
      
      // Atualizar apenas o status, preservando a quilometragem atualizada
      await Vehicle.update(vehicle_id, { 
        ...updatedVehicle, 
        status: 'maintenance' 
      });
    } else {
      // Se não há quilometragem para atualizar, apenas atualizar o status
      await Vehicle.update(vehicle_id, { ...vehicle, status: 'maintenance' });
    }

    // Registrar atividade: serviço criado
    try {
      await ActivityLog.create({
        entity_type: 'service',
        action: 'created',
        entity_id: fullService.id,
        title: `Serviço criado: ${fullService.serviceType || service_type}`,
        description: `Veículo ${fullService.vehicleLicensePlate || vehicle.license_plate}`,
        amount: Number(fullService.cost || cost || 0),
        status: (fullService.status || status || 'Pendente')
      });
    } catch (e) { console.warn('Falha ao registrar ActivityLog (create service):', e.message); }

    res.status(201).json({
      success: true,
      message: 'Serviço criado com sucesso',
      data: fullService || service
    });
  } catch (error) {
    console.error('Erro ao criar serviço:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível criar o serviço'
    });
  }
});

// PATCH /api/services/:id/status - Atualizar apenas o status do serviço
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    
    // Verificar se serviço existe
    const existingService = await Service.findById(id);
    if (!existingService) {
      return res.status(404).json({
        error: 'Serviço não encontrado'
      });
    }
    
    // Mapear paymentStatus do frontend para status do backend
    let backendStatus;
    switch (paymentStatus) {
      case 'completed':
        backendStatus = 'Concluído';
        break;
      case 'in_progress':
        backendStatus = 'Em Andamento';
        break;
      case 'pending':
        backendStatus = 'Pendente';
        break;
      case 'cancelled':
        backendStatus = 'Cancelado';
        break;
      default:
        backendStatus = 'Pendente';
    }
    
    // Atualizar apenas o status usando query direta
    const result = await query(
      'UPDATE services SET status = $1 WHERE id = $2 RETURNING *',
      [backendStatus, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        error: 'Serviço não encontrado'
      });
    }
    
    // Verificar se TODOS os serviços do veículo estão pagos
    const allVehicleServices = await query(
      'SELECT status FROM services WHERE vehicle_id = $1',
      [existingService.vehicleId]
    );
    
    // Verificar se todos os serviços estão concluídos
    // Aceitar 'Concluído' (PT), variações sem acento, e sinônimos como 'Processado', 'Faturado', 'Pago'
    const allServicesCompleted = allVehicleServices.rows.every(s => {
      const raw = (s.status || '').toString().trim();
      const stLower = raw.toLowerCase();
      const stNorm = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      return (
        stLower === 'concluído' ||
        stNorm === 'concluido' ||
        stLower === 'completed' ||
        stLower === 'processado' ||
        stLower === 'faturado' ||
        stLower === 'pago' ||
        stLower === 'paid'
      );
    });
    
    if (allServicesCompleted) {
      // Se todos os serviços estão concluídos, mudar o veículo para ativo
      await query(
        'UPDATE vehicles SET status = $1 WHERE id = $2',
        ['active', existingService.vehicleId]
      );
    } else {
      // Se ainda há serviços não concluídos, manter o veículo em manutenção
      await query(
        'UPDATE vehicles SET status = $1 WHERE id = $2',
        ['maintenance', existingService.vehicleId]
      );
    }
    
    // Buscar o serviço completo com dados relacionados
    const service = await Service.findById(id);
    
    // Registrar atividade: status de serviço atualizado
    try {
      await ActivityLog.create({
        entity_type: 'service',
        action: 'updated',
        entity_id: service.id,
        title: `Status do serviço atualizado: ${service.serviceType}`,
        description: `Veículo ${service.vehicleLicensePlate}`,
        amount: Number(service.cost || 0),
        status: backendStatus
      });
    } catch (e) { console.warn('Falha ao registrar ActivityLog (update service status):', e.message); }

    res.json({
      success: true,
      message: 'Status atualizado com sucesso',
      data: service
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível atualizar o status'
    });
  }
});

// PUT /api/services/:id - Atualizar serviço
router.put('/:id', serviceValidation, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('=== INÍCIO EDIÇÃO SERVIÇO ===');
    console.log('ID do serviço:', id);
    console.log('Dados recebidos:', req.body);
    
    const { 
      vehicle_id, 
      client_id, 
      service_type, 
      description, 
      cost, 
      service_date, 
      exit_date,
      mileage,
      status, 
      mechanic, 
      parts_used, 
      labor_hours 
    } = req.body;
    
    // Verificar se serviço existe
    const existingService = await Service.findById(id);
    console.log('Serviço existente encontrado:', existingService ? 'SIM' : 'NÃO');
    if (!existingService) {
      return res.status(404).json({
        error: 'Serviço não encontrado'
      });
    }
    
    // Verificar se veículo existe
    const vehicle = await Vehicle.findById(vehicle_id);
    console.log('Veículo encontrado:', vehicle ? 'SIM' : 'NÃO');
    if (!vehicle) {
      return res.status(404).json({
        error: 'Veículo não encontrado'
      });
    }
    
    // Verificar se cliente existe
    const client = await Client.findById(client_id);
    console.log('Cliente encontrado:', client ? 'SIM' : 'NÃO');
    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado'
      });
    }
    
    // Verificar se o veículo pertence ao cliente
    console.log('Verificando se veículo pertence ao cliente...');
    console.log('vehicle.client_id:', vehicle.client_id);
    console.log('client_id:', client_id);
    if (vehicle.client_id !== client_id) {
      return res.status(400).json({
        error: 'Veículo não pertence ao cliente especificado'
      });
    }
    
    console.log('Chamando Service.update...');
  const service = await Service.update(id, {
      vehicle_id,
      client_id,
      service_type,
      description,
      cost,
      service_date,
      exit_date,
      mileage,
      status,
      mechanic,
      parts_used,
      labor_hours
    });

    console.log('Serviço atualizado:', service);

    // Após atualizar o serviço, sincronizar o status do veículo (ativo/manutenção)
    // Buscar todos os serviços do veículo
    const allVehicleServices = await query(
      'SELECT status FROM services WHERE vehicle_id = $1',
      [vehicle_id]
    );

    // Verificar se todos os serviços estão concluídos (compatível PT/EN e sinônimos)
    const allServicesCompleted = allVehicleServices.rows.every(s => {
      const raw = (s.status || '').toString().trim();
      const stLower = raw.toLowerCase();
      const stNorm = raw.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      return (
        stLower === 'concluído' ||
        stNorm === 'concluido' ||
        stLower === 'completed' ||
        stLower === 'processado' ||
        stLower === 'faturado' ||
        stLower === 'pago' ||
        stLower === 'paid'
      );
    });

    // Atualizar status do veículo conforme resultado
    await query(
      'UPDATE vehicles SET status = $1 WHERE id = $2',
      [allServicesCompleted ? 'active' : 'maintenance', vehicle_id]
    );

    console.log('=== FIM EDIÇÃO SERVIÇO ===');
    
    // Registrar atividade: serviço atualizado
    try {
      await ActivityLog.create({
        entity_type: 'service',
        action: 'updated',
        entity_id: service.id,
        title: `Serviço atualizado: ${service.serviceType || service_type}`,
        description: `Veículo ${vehicle.license_plate}`,
        amount: Number(service.cost || cost || 0),
        status: (service.status || status)
      });
    } catch (e) { console.warn('Falha ao registrar ActivityLog (update service):', e.message); }

    res.json({
      success: true,
      message: 'Serviço atualizado com sucesso',
      data: service
    });
  } catch (error) {
    console.error('Erro ao atualizar serviço:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível atualizar o serviço'
    });
  }
});

// DELETE /api/services/:id - Deletar serviço
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se serviço existe
    const existingService = await Service.findById(id);
    if (!existingService) {
      return res.status(404).json({
        error: 'Serviço não encontrado'
      });
    }
    
    const deleted = await Service.delete(id);
    
    if (deleted) {
      // Registrar atividade: serviço excluído
      try {
        await ActivityLog.create({
          entity_type: 'service',
          action: 'deleted',
          entity_id: existingService.id,
          title: `Serviço excluído: ${existingService.serviceType || 'Serviço'}`,
          description: `Veículo ${existingService.vehicleLicensePlate || existingService.vehicleId}`,
          amount: Number(existingService.cost || 0),
          status: 'deleted'
        });
      } catch (e) { console.warn('Falha ao registrar ActivityLog (delete service):', e.message); }

      res.json({
        success: true,
        message: 'Serviço deletado com sucesso'
      });
    } else {
      res.status(500).json({
        error: 'Erro ao deletar serviço'
      });
    }
  } catch (error) {
    console.error('Erro ao deletar serviço:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível deletar o serviço'
    });
  }
});

// GET /api/services/stats/financial - Estatísticas financeiras
router.get('/stats/financial', async (req, res) => {
  try {
    const stats = await Service.getFinancialStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas financeiras:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/services/stats/status - Serviços por status
router.get('/stats/status', async (req, res) => {
  try {
    const stats = await Service.getByStatus();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas por status:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/services/stats/count - Contar serviços
router.get('/stats/count', async (req, res) => {
  try {
    const count = await Service.count();
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Erro ao contar serviços:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;