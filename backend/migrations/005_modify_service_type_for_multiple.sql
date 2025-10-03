-- Migration: 005_modify_service_type_for_multiple.sql
-- Modifica o campo service_type para suportar múltiplos tipos de serviço

-- Alterar o campo service_type para TEXT para armazenar JSON ou string separada por vírgulas
ALTER TABLE services 
ALTER COLUMN service_type TYPE TEXT;

-- Adicionar comentário para documentação
COMMENT ON COLUMN services.service_type IS 'Tipos de serviço (pode conter múltiplos tipos separados por vírgula ou JSON)';

-- Criar índice para busca em tipos de serviço
CREATE INDEX IF NOT EXISTS idx_services_service_type ON services USING gin(to_tsvector('portuguese', service_type));