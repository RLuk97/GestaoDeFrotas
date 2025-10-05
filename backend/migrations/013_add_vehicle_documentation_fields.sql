-- Migration: 013_add_vehicle_documentation_fields.sql
-- Adiciona campos de documentação ao veículo (RENAVAM e status)

ALTER TABLE vehicles 
  ADD COLUMN IF NOT EXISTS renavam VARCHAR(11),
  ADD COLUMN IF NOT EXISTS licensing_status VARCHAR(20),
  ADD COLUMN IF NOT EXISTS insurance_status VARCHAR(20),
  ADD COLUMN IF NOT EXISTS ipva_status VARCHAR(20);

-- Comentários para documentação
COMMENT ON COLUMN vehicles.renavam IS 'Código RENAVAM do veículo (11 dígitos)';
COMMENT ON COLUMN vehicles.licensing_status IS 'Status do licenciamento (Em dia, Vencido, Pendente)';
COMMENT ON COLUMN vehicles.insurance_status IS 'Status do seguro (Ativo, Vencido, Cancelado, Pendente)';
COMMENT ON COLUMN vehicles.ipva_status IS 'Status do IPVA (Pago, Em atraso, Isento, Parcelado)';

-- Índices úteis
CREATE INDEX IF NOT EXISTS idx_vehicles_renavam ON vehicles(renavam);