const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');

// GET /api/activities/recent?limit=5
router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '5', 10);
    const items = await ActivityLog.recent(Math.min(Math.max(limit, 1), 50));

    // Adaptar payload para o frontend (description, value, status, date)
    const data = items.map(item => ({
      id: item.id,
      description: item.title + (item.description ? ` — ${item.description}` : ''),
      value: item.amount || 0,
      status: mapActionToStatus(item.action, item.status),
      date: item.occurred_at,
      entityType: item.entity_type,
    }));

    return res.json({ success: true, data });
  } catch (error) {
    console.error('Erro ao buscar atividades recentes:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

function mapActionToStatus(action, status) {
  // Se houver status do serviço, priorizar
  if (status) return normalizeStatus(status);
  switch (String(action).toLowerCase()) {
    case 'created':
      return 'created';
    case 'updated':
      return 'updated';
    case 'deleted':
      return 'deleted';
    default:
      return 'pending';
  }
}

function normalizeStatus(st) {
  const s = String(st).toLowerCase();
  if (['completed', 'concluído', 'concluido', 'pago', 'paid', 'processado', 'faturado'].includes(s)) return 'completed';
  if (['in_progress', 'em andamento'].includes(s)) return 'in_progress';
  if (['pending', 'pendente'].includes(s)) return 'pending';
  if (['cancelled', 'cancelado'].includes(s)) return 'cancelled';
  return s;
}

module.exports = router;