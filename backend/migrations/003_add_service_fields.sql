-- Migration: 003_add_service_fields.sql
-- Adiciona campos de data de saída e quilometragem aos serviços

-- Adicionar novos campos à tabela services
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS exit_date DATE,
ADD COLUMN IF NOT EXISTS mileage INTEGER;

-- Criar índice para a data de saída
CREATE INDEX IF NOT EXISTS idx_services_exit_date ON services(exit_date);

-- Comentários para documentação
COMMENT ON COLUMN services.exit_date IS 'Data de saída/conclusão do serviço';
COMMENT ON COLUMN services.mileage IS 'Quilometragem do veículo no momento do serviço';