-- Migration: 011_make_vehicle_client_optional.sql
-- Torna opcional o vínculo de cliente em veículos

ALTER TABLE vehicles 
  ALTER COLUMN client_id DROP NOT NULL;

-- Observação: chave estrangeira continua válida; linhas sem cliente terão client_id = NULL