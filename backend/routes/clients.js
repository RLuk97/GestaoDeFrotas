const express = require('express');
const { body, validationResult } = require('express-validator');
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

// Validações para cliente
const clientValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Nome deve ter entre 2 e 255 caracteres'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email deve ser válido'),
  body('phone')
    .optional()
    .isMobilePhone('pt-BR')
    .withMessage('Telefone deve ser válido'),
  body('document')
    .notEmpty()
    .withMessage('CPF/CNPJ é obrigatório')
    .custom((value) => {
      const digits = String(value).replace(/\D/g, '');
      if (digits.length !== 11 && digits.length !== 14) {
        throw new Error('Documento deve conter CPF (11 dígitos) ou CNPJ (14 dígitos)');
      }
      return true;
    })
    .isLength({ max: 20 })
    .withMessage('Documento deve ter no máximo 20 caracteres'),
  body('address')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Endereço deve ter no máximo 500 caracteres'),
  body('city')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Cidade deve ter no máximo 100 caracteres'),
  body('state')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Estado deve ter no máximo 50 caracteres'),
  body('zipCode')
    .optional()
    .isLength({ max: 10 })
    .withMessage('CEP deve ter no máximo 10 caracteres'),
  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status deve ser active ou inactive'),
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Observações devem ter no máximo 1000 caracteres')
];

// GET /api/clients - Listar todos os clientes
router.get('/', async (req, res) => {
  try {
    const { with_vehicles } = req.query;
    
    let clients;
    if (with_vehicles === 'true') {
      clients = await Client.findWithVehicles();
    } else {
      clients = await Client.findAll();
    }
    
    res.json({
      success: true,
      data: clients,
      count: clients.length
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar os clientes'
    });
  }
});

// Utilitário: normalizar CPF/CNPJ para apenas dígitos
const normalizeDocument = (value) => (value || '').toString().replace(/\D/g, '');

// Utilitário: checar se string parece UUID v4
const isUuid = (value) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value || '');

// Resolver cliente por UUID ou CPF/CNPJ
const resolveClient = async (idOrDoc) => {
  const raw = (idOrDoc || '').toString().trim();
  const digits = normalizeDocument(raw);
  if (isUuid(raw)) {
    return await Client.findById(raw);
  }
  if (digits.length === 11 || digits.length === 14) {
    return await Client.findByDocument(digits);
  }
  // fallback: tentar como ID padrão
  return await Client.findById(raw);
};

// GET /api/clients/:id - Buscar cliente por ID (UUID) ou CPF/CNPJ
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const client = await resolveClient(id);
    
    if (!client) {
      return res.status(404).json({
        error: 'Cliente não encontrado'
      });
    }
    
    res.json({
      success: true,
      data: client
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível buscar o cliente'
    });
  }
});

// POST /api/clients - Criar novo cliente
router.post('/', clientValidation, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, phone, document, address, city, state, zipCode, status, notes } = req.body;
    const normalizedDoc = normalizeDocument(document);
    
    // Verificar se email já existe
    const existingClient = await Client.findByEmail(email);
    if (existingClient) {
      return res.status(409).json({
        error: 'Email já cadastrado',
        message: 'Já existe um cliente com este email'
      });
    }
    
    // Verificar se CPF/CNPJ já existe (documento obrigatório)
    if (!normalizedDoc || (normalizedDoc.length !== 11 && normalizedDoc.length !== 14)) {
      return res.status(400).json({
        error: 'Dados inválidos',
        message: 'CPF/CNPJ é obrigatório e deve conter 11 ou 14 dígitos'
      });
    }
    const existingDocument = await Client.findByDocument(normalizedDoc);
    if (existingDocument) {
      return res.status(409).json({
        error: 'CPF/CNPJ já cadastrado',
        message: 'Já existe um cliente com este CPF/CNPJ'
      });
    }
    
    const client = await Client.create({
      name,
      email,
      phone,
      document: normalizedDoc,
      address,
      city,
      state,
      zipCode,
      status,
      notes
    });
    
    // Registrar atividade: cliente criado
    try {
      await ActivityLog.create({
        entity_type: 'client',
        action: 'created',
        entity_id: client.id,
        title: `Cliente criado: ${client.name}`,
        description: client.email ? `Email: ${client.email}` : undefined,
        amount: 0,
        status: 'created'
      });
    } catch (e) {
      console.warn('Falha ao registrar ActivityLog (create client):', e.message);
    }

    res.status(201).json({
      success: true,
      message: 'Cliente criado com sucesso',
      data: client
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível criar o cliente'
    });
  }
});

// PUT /api/clients/:id - Atualizar cliente
router.put('/:id', clientValidation, handleValidationErrors, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, document, address, city, state, zipCode, status, notes } = req.body;
    const normalizedDoc = document ? normalizeDocument(document) : '';
    
    // Verificar se cliente existe
    const existingClient = await resolveClient(id);
    if (!existingClient) {
      return res.status(404).json({
        error: 'Cliente não encontrado'
      });
    }
    
    // Verificar se email já existe em outro cliente
    const emailClient = await Client.findByEmail(email);
    if (emailClient && emailClient.id !== existingClient.id) {
      return res.status(409).json({
        error: 'Email já cadastrado',
        message: 'Já existe outro cliente com este email'
      });
    }
    
    // Verificar se CPF/CNPJ já existe em outro cliente (apenas se foi fornecido)
    if (normalizedDoc) {
      if (normalizedDoc.length !== 11 && normalizedDoc.length !== 14) {
        return res.status(400).json({
          error: 'Dados inválidos',
          message: 'CPF/CNPJ deve conter 11 ou 14 dígitos'
        });
      }
      const documentClient = await Client.findByDocument(normalizedDoc);
      if (documentClient && documentClient.id !== existingClient.id) {
        return res.status(409).json({
          error: 'CPF/CNPJ já cadastrado',
          message: 'Já existe outro cliente com este CPF/CNPJ'
        });
      }
    }
    
    const client = await Client.update(existingClient.id, {
      name,
      email,
      phone,
      document: normalizedDoc || existingClient.document,
      address,
      city,
      state,
      zipCode,
      status,
      notes
    });
    
    // Registrar atividade: cliente atualizado
    try {
      await ActivityLog.create({
        entity_type: 'client',
        action: 'updated',
        entity_id: client.id,
        title: `Cliente atualizado: ${client.name}`,
        description: client.email ? `Email: ${client.email}` : undefined,
        amount: 0,
        status: 'updated'
      });
    } catch (e) {
      console.warn('Falha ao registrar ActivityLog (update client):', e.message);
    }

    res.json({
      success: true,
      message: 'Cliente atualizado com sucesso',
      data: client
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível atualizar o cliente'
    });
  }
});

// DELETE /api/clients/:id - Deletar cliente
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar se cliente existe (UUID ou CPF/CNPJ)
    const existingClient = await resolveClient(id);
    if (!existingClient) {
      return res.status(404).json({
        error: 'Cliente não encontrado'
      });
    }
    
    const deleted = await Client.delete(existingClient.id);
    
    if (deleted) {
      // Registrar atividade: cliente excluído
      try {
        await ActivityLog.create({
          entity_type: 'client',
          action: 'deleted',
          entity_id: existingClient.id,
          title: `Cliente excluído: ${existingClient.name}`,
          description: existingClient.email ? `Email: ${existingClient.email}` : undefined,
          amount: 0,
          status: 'deleted'
        });
      } catch (e) {
        console.warn('Falha ao registrar ActivityLog (delete client):', e.message);
      }

      res.json({
        success: true,
        message: 'Cliente deletado com sucesso'
      });
    } else {
      res.status(500).json({
        error: 'Erro ao deletar cliente'
      });
    }
  } catch (error) {
    console.error('Erro ao deletar cliente:', error);
    
    // Verificar se é erro de constraint (cliente tem veículos)
    if (error.code === '23503') {
      return res.status(409).json({
        error: 'Não é possível deletar cliente',
        message: 'Cliente possui veículos cadastrados'
      });
    }
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Não foi possível deletar o cliente'
    });
  }
});

// GET /api/clients/stats/count - Contar clientes
router.get('/stats/count', async (req, res) => {
  try {
    const count = await Client.count();
    res.json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.error('Erro ao contar clientes:', error);
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;