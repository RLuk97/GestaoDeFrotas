-- Migration: 012_enforce_unique_document.sql
-- Garante unicidade de CPF/CNPJ na tabela de clientes, sem afetar registros nulos

-- Criar índice único parcial para documentos não nulos
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_document_unique
ON clients(document)
WHERE document IS NOT NULL;

-- Comentário para documentação
COMMENT ON INDEX idx_clients_document_unique IS 'Garante unicidade de CPF/CNPJ (apenas quando não nulo)';