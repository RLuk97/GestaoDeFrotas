const { query } = require('../config/database');

class Vehicle {
  constructor(data) {
    this.id = data.id;
    this.client_id = data.client_id;
    this.brand = data.brand;
    this.model = data.model;
    this.year = data.year;
    this.license_plate = data.license_plate;
    this.color = data.color;
    this.fuel_type = data.fuel_type;
    this.mileage = data.mileage;
    this.status = data.status || 'active';
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Buscar todos os veículos
  static async findAll() {
    const result = await query(`
      SELECT 
        v.*,
        c.name as client_name,
        c.email as client_email
      FROM vehicles v
      LEFT JOIN clients c ON v.client_id = c.id
      ORDER BY v.brand, v.model ASC
    `);
    return result.rows.map(row => new Vehicle(row));
  }

  // Buscar veículo por ID
  static async findById(id) {
    const result = await query(`
      SELECT 
        v.*,
        c.name as client_name,
        c.email as client_email
      FROM vehicles v
      LEFT JOIN clients c ON v.client_id = c.id
      WHERE v.id = $1
    `, [id]);
    return result.rows.length > 0 ? new Vehicle(result.rows[0]) : null;
  }

  // Buscar veículos por cliente
  static async findByClientId(clientId) {
    const result = await query('SELECT * FROM vehicles WHERE client_id = $1 ORDER BY brand, model ASC', [clientId]);
    return result.rows.map(row => new Vehicle(row));
  }

  // Buscar veículo por placa
  static async findByLicensePlate(licensePlate) {
    const result = await query('SELECT * FROM vehicles WHERE license_plate = $1', [licensePlate]);
    return result.rows.length > 0 ? new Vehicle(result.rows[0]) : null;
  }

  // Criar novo veículo
  static async create(vehicleData) {
    const { client_id, brand, model, year, license_plate, color, fuel_type, mileage, status } = vehicleData;
    const result = await query(
      `INSERT INTO vehicles (client_id, brand, model, year, license_plate, color, fuel_type, mileage, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [client_id, brand, model, year, license_plate, color, fuel_type || 'Gasolina', mileage || 0, status || 'active']
    );
    return new Vehicle(result.rows[0]);
  }

  // Atualizar veículo
  static async update(id, vehicleData) {
    const { client_id, brand, model, year, license_plate, color, fuel_type, mileage, status } = vehicleData;
    const result = await query(
      `UPDATE vehicles 
       SET client_id = $1, brand = $2, model = $3, year = $4, license_plate = $5, 
           color = $6, fuel_type = $7, mileage = $8, status = $9
       WHERE id = $10 RETURNING *`,
      [client_id, brand, model, year, license_plate, color, fuel_type, mileage, status, id]
    );
    return result.rows.length > 0 ? new Vehicle(result.rows[0]) : null;
  }

  // Deletar veículo
  static async delete(id) {
    const result = await query('DELETE FROM vehicles WHERE id = $1 RETURNING *', [id]);
    return result.rows.length > 0;
  }

  // Buscar veículos com serviços
  static async findWithServices() {
    const result = await query(`
      SELECT 
        v.*,
        c.name as client_name,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', s.id,
              'service_type', s.service_type,
              'description', s.description,
              'cost', s.cost,
              'service_date', s.service_date,
              'status', s.status
            )
          ) FILTER (WHERE s.id IS NOT NULL), 
          '[]'
        ) as services
      FROM vehicles v
      LEFT JOIN clients c ON v.client_id = c.id
      LEFT JOIN services s ON v.id = s.vehicle_id
      GROUP BY v.id, c.name
      ORDER BY v.brand, v.model ASC
    `);
    
    return result.rows.map(row => ({
      ...new Vehicle(row),
      services: row.services
    }));
  }

  // Contar total de veículos
  static async count() {
    const result = await query('SELECT COUNT(*) as total FROM vehicles');
    return parseInt(result.rows[0].total);
  }

  // Estatísticas por marca
  static async getStatsByBrand() {
    const result = await query(`
      SELECT 
        brand,
        COUNT(*) as count,
        AVG(year) as avg_year
      FROM vehicles 
      GROUP BY brand 
      ORDER BY count DESC
    `);
    return result.rows;
  }

  // Atualizar apenas a quilometragem do veículo
  static async updateMileage(id, mileage) {
    const result = await query(
      `UPDATE vehicles 
       SET mileage = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2 RETURNING *`,
      [mileage, id]
    );
    return result.rows.length > 0 ? new Vehicle(result.rows[0]) : null;
  }
}

module.exports = Vehicle;