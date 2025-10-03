-- Migration 012: Activity Logs
-- Registra atividades recentes (criação/edição/exclusão) de clientes, veículos e serviços

-- Certificar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de logs de atividades
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(20) NOT NULL CHECK (entity_type IN ('client', 'vehicle', 'service')),
    action VARCHAR(20) NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
    entity_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    amount DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(20),
    occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_occurred_at ON activity_logs(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON activity_logs(action);

-- Comentários
COMMENT ON TABLE activity_logs IS 'Registro de atividades recentes do sistema';
COMMENT ON COLUMN activity_logs.entity_type IS 'Tipo de entidade: client, vehicle, service';
COMMENT ON COLUMN activity_logs.action IS 'Ação executada: created, updated, deleted';
COMMENT ON COLUMN activity_logs.amount IS 'Valor associado (ex.: custo do serviço)';
COMMENT ON COLUMN activity_logs.status IS 'Status associado (ex.: status do serviço)';