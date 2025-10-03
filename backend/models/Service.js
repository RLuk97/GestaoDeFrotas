const { query } = require('../config/database');

class Service {
  constructor(data) {
    this.id = data.id;
    this.vehicleId = data.vehicle_id; // Mapeamento para o frontend
    this.clientId = data.client_id; // Mapeamento para o frontend
    this.type = this.parseServiceTypes(data.service_type); // Mapeamento para o frontend - pode ser array
    this.description = data.description;
    this.totalValue = data.cost; // Mapeamento para o frontend
    this.entryDate = data.service_date ? this.formatDateForFrontend(data.service_date) : null; // Formatação para o frontend
    this.exitDate = data.exit_date ? this.formatDateForFrontend(data.exit_date) : null; // Formatação para o frontend
    this.mileage = data.mileage; // Novo campo para quilometragem
    this.paymentStatus = this.mapStatusToPaymentStatus(data.status); // Mapeamento para o frontend
    this.mechanic = data.mechanic;
    this.partsUsed = data.parts_used; // Mapeamento para o frontend
    this.laborHours = data.labor_hours; // Mapeamento para o frontend
    this.createdAt = data.created_at; // Mapeamento para o frontend
    this.updatedAt = data.updated_at; // Mapeamento para o frontend
    
    // Campos adicionais do JOIN
    this.clientName = data.client_name;
    this.clientEmail = data.client_email;
    this.vehicleBrand = data.vehicle_brand;
    this.vehicleModel = data.vehicle_model;
    this.vehiclePlate = data.vehicle_license_plate;
  }

  // Mapear status do banco para paymentStatus do frontend
  mapStatusToPaymentStatus(status) {
    const s = (status || '').toString().trim();
    const sLower = s.toLowerCase();
    // Remover acentos para comparação mais robusta
    const sNorm = s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    // Tratar sinônimos e variações como concluído
    if (
      sLower === 'concluído' ||
      sNorm === 'concluido' ||
      sLower === 'completed' ||
      sLower === 'processado' ||
      sLower === 'faturado' ||
      sLower === 'pago' ||
      sLower === 'paid'
    ) {
      return 'completed';
    }

    if (sLower === 'em andamento' || sLower === 'in_progress') {
      return 'in_progress';
    }
    if (sLower === 'pendente' || sLower === 'pending') {
      return 'pending';
    }
    if (sLower === 'cancelado' || sLower === 'cancelled') {
      return 'cancelled';
    }

    // Padrão
    return 'pending';
  }

  // Mapear status do frontend para o banco de dados
  static mapFrontendStatusToDatabase(status) {
    switch (status) {
      case 'completed':
        return 'Concluído';
      case 'in_progress':
        return 'Em Andamento';
      case 'pending':
        return 'Pendente';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Pendente';
    }
  }

  // Buscar todos os serviços
  static async findAll() {
    const result = await query(`
      SELECT 
        s.*,
        c.name as client_name,
        c.email as client_email,
        v.brand as vehicle_brand,
        v.model as vehicle_model,
        v.license_plate as vehicle_license_plate
      FROM services s
      JOIN clients c ON s.client_id = c.id
      JOIN vehicles v ON s.vehicle_id = v.id
      ORDER BY s.service_date DESC
    `);
    return result.rows.map(row => new Service(row));
  }

  // Buscar serviço por ID
  static async findById(id) {
    const result = await query(`
      SELECT 
        s.*,
        c.name as client_name,
        c.email as client_email,
        v.brand as vehicle_brand,
        v.model as vehicle_model,
        v.license_plate as vehicle_license_plate
      FROM services s
      JOIN clients c ON s.client_id = c.id
      JOIN vehicles v ON s.vehicle_id = v.id
      WHERE s.id = $1
    `, [id]);
    return result.rows.length > 0 ? new Service(result.rows[0]) : null;
  }

  // Buscar serviços por veículo
  static async findByVehicleId(vehicleId) {
    const result = await query(`
      SELECT s.*, c.name as client_name
      FROM services s
      JOIN clients c ON s.client_id = c.id
      WHERE s.vehicle_id = $1 
      ORDER BY s.service_date DESC
    `, [vehicleId]);
    return result.rows.map(row => new Service(row));
  }

  // Buscar serviços por cliente
  static async findByClientId(clientId) {
    const result = await query(`
      SELECT 
        s.*,
        v.brand as vehicle_brand,
        v.model as vehicle_model,
        v.license_plate as vehicle_license_plate
      FROM services s
      JOIN vehicles v ON s.vehicle_id = v.id
      WHERE s.client_id = $1 
      ORDER BY s.service_date DESC
    `, [clientId]);
    return result.rows.map(row => new Service(row));
  }

  // Criar novo serviço
  static async create(serviceData) {
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
    } = serviceData;
    
    // Formatar tipos de serviço para o banco
    const formattedServiceType = this.formatServiceTypesForDB(service_type);
    
    // Mapear status do frontend (inglês) para o banco (português)
    const mappedStatus = this.mapFrontendStatusToDatabase(status);
    
    const result = await query(
      `INSERT INTO services (
        vehicle_id, client_id, service_type, description, cost, 
        service_date, exit_date, mileage, status, mechanic, parts_used, labor_hours
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        vehicle_id, 
        client_id, 
        formattedServiceType, 
        description, 
        cost, 
        service_date, 
        exit_date,
        mileage,
        mappedStatus, 
        mechanic, 
        parts_used, 
        labor_hours || 0
      ]
    );
    
    // Criar uma nova instância da classe Service com o mapeamento correto
    const serviceInstance = new Service(result.rows[0]);
    
    // Retornar o objeto com os campos mapeados
    return {
      id: serviceInstance.id,
      vehicleId: serviceInstance.vehicleId,
      clientId: serviceInstance.clientId,
      type: serviceInstance.type,
      description: serviceInstance.description,
      totalValue: serviceInstance.totalValue,
      entryDate: serviceInstance.entryDate,
      exitDate: serviceInstance.exitDate,
      mileage: serviceInstance.mileage,
      paymentStatus: serviceInstance.paymentStatus,
      mechanic: serviceInstance.mechanic,
      partsUsed: serviceInstance.partsUsed,
      laborHours: serviceInstance.laborHours,
      createdAt: serviceInstance.createdAt,
      updatedAt: serviceInstance.updatedAt
    };
  }

  // Atualizar serviço
  static async update(id, serviceData) {
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
    } = serviceData;
    
    // Formatar tipos de serviço para o banco
    const formattedServiceType = this.formatServiceTypesForDB(service_type);
    
    // Mapear status do frontend (inglês) para o banco (português)
    const mappedStatus = this.mapFrontendStatusToDatabase(status);
    
    const result = await query(
      `UPDATE services 
       SET vehicle_id = $1, client_id = $2, service_type = $3, description = $4, 
           cost = $5, service_date = $6, exit_date = $7, mileage = $8, status = $9, 
           mechanic = $10, parts_used = $11, labor_hours = $12
       WHERE id = $13 RETURNING *`,
      [
        vehicle_id, 
        client_id, 
        formattedServiceType, 
        description, 
        cost, 
        service_date, 
        exit_date,
        mileage,
        mappedStatus, 
        mechanic, 
        parts_used, 
        labor_hours, 
        id
      ]
    );
    return result.rows.length > 0 ? new Service(result.rows[0]) : null;
  }

  // Deletar serviço
  static async delete(id) {
    const result = await query('DELETE FROM services WHERE id = $1 RETURNING *', [id]);
    return result.rows.length > 0;
  }

  // Buscar serviços por período
  static async findByDateRange(startDate, endDate) {
    const result = await query(`
      SELECT 
        s.*,
        c.name as client_name,
        v.brand as vehicle_brand,
        v.model as vehicle_model,
        v.license_plate as vehicle_license_plate
      FROM services s
      JOIN clients c ON s.client_id = c.id
      JOIN vehicles v ON s.vehicle_id = v.id
      WHERE s.service_date BETWEEN $1 AND $2
      ORDER BY s.service_date DESC
    `, [startDate, endDate]);
    return result.rows.map(row => new Service(row));
  }

  // Estatísticas financeiras
  static async getFinancialStats() {
    const result = await query(`
      SELECT 
        COUNT(*) as total_services,
        SUM(cost) as total_revenue,
        AVG(cost) as avg_cost,
        SUM(labor_hours) as total_hours
      FROM services
    `);
    return result.rows[0];
  }

  // Serviços por status
  static async getByStatus() {
    const result = await query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(cost) as total_cost
      FROM services 
      GROUP BY status 
      ORDER BY count DESC
    `);
    return result.rows;
  }

  // Contar total de serviços
  static async count() {
    const result = await query('SELECT COUNT(*) as total FROM services');
    return parseInt(result.rows[0].total);
  }

  // Função para formatar data evitando problemas de fuso horário
  formatDateForFrontend(dateString) {
    if (!dateString) return null;
    
    // Se já é uma string no formato YYYY-MM-DD, retorna como está
    if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateString;
    }
    
    // Se é um objeto Date ou string de data, usar toISOString().split('T')[0]
    // que funciona corretamente para datas UTC
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }

  // Função para processar tipos de serviço (pode ser string única ou múltiplos)
  parseServiceTypes(serviceTypeData) {
    if (!serviceTypeData) return [];
    
    // Se já é um array, retorna como está
    if (Array.isArray(serviceTypeData)) {
      return serviceTypeData;
    }
    
    // Se é uma string, verifica se contém vírgulas (múltiplos tipos)
    if (typeof serviceTypeData === 'string') {
      // Se contém vírgulas, divide em array
      if (serviceTypeData.includes(',')) {
        return serviceTypeData.split(',').map(type => type.trim()).filter(type => type.length > 0);
      }
      // Se é uma string única, retorna como array de um elemento
      return [serviceTypeData.trim()];
    }
    
    return [];
  }

  // Função para converter array de tipos em string para o banco
  static formatServiceTypesForDB(serviceTypes) {
    if (!serviceTypes) return '';
    
    // Se já é uma string, retorna como está
    if (typeof serviceTypes === 'string') {
      return serviceTypes;
    }
    
    // Se é um array, junta com vírgulas
    if (Array.isArray(serviceTypes)) {
      return serviceTypes.join(', ');
    }
    
    return String(serviceTypes);
  }
}

module.exports = Service;