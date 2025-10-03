const { query } = require('../config/database');

class ActivityLog {
  constructor(data) {
    this.id = data.id;
    this.entity_type = data.entity_type;
    this.action = data.action;
    this.entity_id = data.entity_id;
    this.title = data.title;
    this.description = data.description;
    this.amount = Number(data.amount || 0);
    this.status = data.status || null;
    this.occurred_at = data.occurred_at;
    this.metadata = data.metadata || null;
  }

  static async create({ entity_type, action, entity_id, title, description, amount = 0, status = null, occurred_at = null, metadata = null }) {
    const result = await query(
      `INSERT INTO activity_logs (entity_type, action, entity_id, title, description, amount, status, occurred_at, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, COALESCE($8, CURRENT_TIMESTAMP), $9)
       RETURNING *`,
      [entity_type, action, entity_id, title, description, amount, status, occurred_at, metadata]
    );
    return new ActivityLog(result.rows[0]);
  }

  static async recent(limit = 10) {
    const result = await query(
      `SELECT id, entity_type, action, entity_id, title, description, amount, status, occurred_at, metadata
       FROM activity_logs
       ORDER BY occurred_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows.map(row => new ActivityLog(row));
  }
}

module.exports = ActivityLog;