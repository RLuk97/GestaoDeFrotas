-- Migration: 002_add_client_fields.sql
-- Adiciona campos ausentes na tabela de clientes

-- Adicionar novos campos à tabela clients
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS document VARCHAR(20),
ADD COLUMN IF NOT EXISTS city VARCHAR(100),
ADD COLUMN IF NOT EXISTS state VARCHAR(50),
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Criar índice para o documento (CPF/CNPJ)
CREATE INDEX IF NOT EXISTS idx_clients_document ON clients(document);

-- Criar índice para o status
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

-- Atualizar clientes existentes para ter status ativo por padrão
UPDATE clients SET status = 'active' WHERE status IS NULL;