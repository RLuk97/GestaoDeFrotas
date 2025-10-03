-- Migração para atualizar status dos serviços existentes
-- De status financeiros para status de gestão de frota

-- Atualizar status antigos para os novos
UPDATE services 
SET status = 'completed' 
WHERE status IN ('Processado', 'Faturado');

UPDATE services 
SET status = 'pending' 
WHERE status = 'Orçamento Solicitado';

UPDATE services 
SET status = 'in_progress' 
WHERE status = 'Orçamento Aprovado';

-- Manter status cancelado como está (se existir)
UPDATE services 
SET status = 'cancelled' 
WHERE status = 'Cancelado';

-- Verificar se há outros status não mapeados
SELECT DISTINCT status, COUNT(*) as count 
FROM services 
GROUP BY status;