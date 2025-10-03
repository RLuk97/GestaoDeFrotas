-- Migration: 004_add_vehicle_status.sql
-- Adiciona campo status na tabela vehicles

-- Adicionar coluna status na tabela vehicles
ALTER TABLE vehicles 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- Atualizar veículos existentes para status 'active'
UPDATE vehicles 
SET status = 'active' 
WHERE status IS NULL;

-- Adicionar constraint para valores válidos
ALTER TABLE vehicles 
ADD CONSTRAINT vehicles_status_check 
CHECK (status IN ('active', 'inactive', 'maintenance'));

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);