const { query } = require('../config/database');

class Client {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this.phone = data.phone;
    this.document = data.document;
    this.address = data.address;
    this.city = data.city;
    this.state = data.state;
    this.zipCode = data.zipCode || data.zip_code; // Aceita ambos os formatos
    this.status = data.status;
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // Buscar todos os clientes
  static async findAll() {
    const result = await query('SELECT * FROM clients ORDER BY name ASC');
    return result.rows.map(row => {
      // Converter zip_code para zipCode
      if (row.zip_code !== undefined) {
        row.zipCode = row.zip_code;
        delete row.zip_code;
      }
      return new Client(row);
    });
  }

  // Buscar cliente por ID
  static async findById(id) {
    const result = await query('SELECT * FROM clients WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      const row = result.rows[0];
      // Converter zip_code para zipCode
      if (row.zip_code !== undefined) {
        row.zipCode = row.zip_code;
        delete row.zip_code;
      }
      return new Client(row);
    }
    return null;
  }

  // Buscar cliente por email
  static async findByEmail(email) {
    const result = await query('SELECT * FROM clients WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      const row = result.rows[0];
      // Converter zip_code para zipCode
      if (row.zip_code !== undefined) {
        row.zipCode = row.zip_code;
        delete row.zip_code;
      }
      return new Client(row);
    }
    return null;
  }

  // Buscar cliente por CPF/CNPJ
  static async findByDocument(document) {
    const result = await query('SELECT * FROM clients WHERE document = $1', [document]);
    if (result.rows.length > 0) {
      const row = result.rows[0];
      // Converter zip_code para zipCode
      if (row.zip_code !== undefined) {
        row.zipCode = row.zip_code;
        delete row.zip_code;
      }
      return new Client(row);
    }
    return null;
  }

  // Criar novo cliente
  static async create(clientData) {
    const { name, email, phone, document, address, city, state, zipCode, status, notes } = clientData;
    const result = await query(
      'INSERT INTO clients (name, email, phone, document, address, city, state, zip_code, status, notes) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [name, email, phone, document, address, city, state, zipCode, status || 'active', notes]
    );
    
    // Converter zip_code de volta para zipCode no objeto retornado
    const clientRow = result.rows[0];
    if (clientRow.zip_code !== undefined) {
      clientRow.zipCode = clientRow.zip_code;
      delete clientRow.zip_code;
    }
    
    return new Client(clientRow);
  }

  // Atualizar cliente
  static async update(id, clientData) {
    const { name, email, phone, document, address, city, state, zipCode, status, notes } = clientData;
    const result = await query(
      'UPDATE clients SET name = $1, email = $2, phone = $3, document = $4, address = $5, city = $6, state = $7, zip_code = $8, status = $9, notes = $10 WHERE id = $11 RETURNING *',
      [name, email, phone, document, address, city, state, zipCode, status, notes, id]
    );
    
    if (result.rows.length > 0) {
      // Converter zip_code de volta para zipCode no objeto retornado
      const clientRow = result.rows[0];
      if (clientRow.zip_code !== undefined) {
        clientRow.zipCode = clientRow.zip_code;
        delete clientRow.zip_code;
      }
      return new Client(clientRow);
    }
    
    return null;
  }

  // Deletar cliente
  static async delete(id) {
    const result = await query('DELETE FROM clients WHERE id = $1 RETURNING *', [id]);
    return result.rows.length > 0;
  }

  // Buscar clientes com seus veículos
  static async findWithVehicles() {
    const result = await query(`
      SELECT 
        c.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', v.id,
              'brand', v.brand,
              'model', v.model,
              'year', v.year,
              'license_plate', v.license_plate,
              'color', v.color
            )
          ) FILTER (WHERE v.id IS NOT NULL), 
          '[]'
        ) as vehicles
      FROM clients c
      LEFT JOIN vehicles v ON c.id = v.client_id
      GROUP BY c.id
      ORDER BY c.name ASC
    `);
    
    return result.rows.map(row => ({
      ...new Client(row),
      vehicles: row.vehicles
    }));
  }

  // Contar total de clientes
  static async count() {
    const result = await query('SELECT COUNT(*) as total FROM clients');
    return parseInt(result.rows[0].total);
  }
}

module.exports = Client;