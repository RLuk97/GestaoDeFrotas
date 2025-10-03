-- Migração 009: Histórico de Contratos
-- Criação das tabelas para histórico de contratos por veículo e motorista

-- Tabela de histórico de contratos
CREATE TABLE IF NOT EXISTS contract_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES rental_contracts(id) ON DELETE CASCADE,
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('created', 'activated', 'suspended', 'terminated', 'renewed', 'modified')),
    previous_status VARCHAR(20),
    new_status VARCHAR(20),
    previous_monthly_value DECIMAL(10,2),
    new_monthly_value DECIMAL(10,2),
    reason TEXT,
    notes TEXT,
    changed_by UUID, -- Referência para usuário que fez a alteração
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    effective_date DATE,
    metadata JSONB -- Para armazenar dados adicionais da alteração
);

-- Tabela de transferências de veículos
CREATE TABLE IF NOT EXISTS vehicle_transfers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    from_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    to_client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    from_contract_id UUID REFERENCES rental_contracts(id) ON DELETE SET NULL,
    to_contract_id UUID REFERENCES rental_contracts(id) ON DELETE SET NULL,
    transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
    reason TEXT,
    transfer_fee DECIMAL(10,2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'cancelled')),
    authorized_by UUID,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de histórico de motoristas por veículo
CREATE TABLE IF NOT EXISTS driver_vehicle_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES rental_contracts(id) ON DELETE SET NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    reason_for_change TEXT,
    performance_rating INTEGER CHECK (performance_rating BETWEEN 1 AND 5),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de métricas de contratos
CREATE TABLE IF NOT EXISTS contract_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES rental_contracts(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL DEFAULT CURRENT_DATE,
    days_active INTEGER DEFAULT 0,
    total_payments_made INTEGER DEFAULT 0,
    total_amount_paid DECIMAL(10,2) DEFAULT 0.00,
    payments_on_time INTEGER DEFAULT 0,
    payments_late INTEGER DEFAULT 0,
    average_delay_days DECIMAL(5,2) DEFAULT 0.00,
    penalties_applied INTEGER DEFAULT 0,
    penalties_amount DECIMAL(10,2) DEFAULT 0.00,
    discounts_applied INTEGER DEFAULT 0,
    discounts_amount DECIMAL(10,2) DEFAULT 0.00,
    maintenance_requests INTEGER DEFAULT 0,
    damage_reports INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(contract_id, metric_date)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_contract_history_contract ON contract_history(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_history_vehicle ON contract_history(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_contract_history_client ON contract_history(client_id);
CREATE INDEX IF NOT EXISTS idx_contract_history_action ON contract_history(action_type);
CREATE INDEX IF NOT EXISTS idx_contract_history_date ON contract_history(changed_at);

CREATE INDEX IF NOT EXISTS idx_vehicle_transfers_vehicle ON vehicle_transfers(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_transfers_from_client ON vehicle_transfers(from_client_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_transfers_to_client ON vehicle_transfers(to_client_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_transfers_date ON vehicle_transfers(transfer_date);

CREATE INDEX IF NOT EXISTS idx_driver_history_vehicle ON driver_vehicle_history(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_driver_history_client ON driver_vehicle_history(client_id);
CREATE INDEX IF NOT EXISTS idx_driver_history_active ON driver_vehicle_history(is_active);
CREATE INDEX IF NOT EXISTS idx_driver_history_dates ON driver_vehicle_history(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_contract_metrics_contract ON contract_metrics(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_metrics_date ON contract_metrics(metric_date);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_driver_vehicle_history_updated_at 
BEFORE UPDATE ON driver_vehicle_history 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para registrar mudanças de contrato automaticamente
CREATE OR REPLACE FUNCTION log_contract_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Registrar mudanças no histórico
    IF TG_OP = 'INSERT' THEN
        INSERT INTO contract_history (
            contract_id, vehicle_id, client_id, action_type, 
            new_status, new_monthly_value, effective_date
        ) VALUES (
            NEW.id, NEW.vehicle_id, NEW.client_id, 'created',
            NEW.status, NEW.monthly_value, NEW.start_date
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Registrar apenas se houve mudanças significativas
        IF OLD.status != NEW.status OR OLD.monthly_value != NEW.monthly_value THEN
            INSERT INTO contract_history (
                contract_id, vehicle_id, client_id, action_type,
                previous_status, new_status, previous_monthly_value, new_monthly_value,
                effective_date
            ) VALUES (
                NEW.id, NEW.vehicle_id, NEW.client_id, 'modified',
                OLD.status, NEW.status, OLD.monthly_value, NEW.monthly_value,
                CURRENT_DATE
            );
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Trigger para registrar mudanças de contrato
CREATE TRIGGER log_rental_contract_changes
AFTER INSERT OR UPDATE ON rental_contracts
FOR EACH ROW EXECUTE FUNCTION log_contract_changes();

-- View para histórico completo de veículos
CREATE OR REPLACE VIEW vehicle_complete_history AS
SELECT 
    v.id as vehicle_id,
    v.license_plate,
    v.brand,
    v.model,
    v.year,
    -- Histórico de contratos
    ch.action_type,
    ch.previous_status,
    ch.new_status,
    ch.previous_monthly_value,
    ch.new_monthly_value,
    ch.reason,
    ch.changed_at,
    ch.effective_date,
    -- Dados do cliente
    c.name as client_name,
    c.email as client_email,
    c.phone as client_phone,
    -- Dados do contrato atual
    rc.status as current_contract_status,
    rc.monthly_value as current_monthly_value,
    rc.start_date as contract_start_date,
    rc.end_date as contract_end_date
FROM vehicles v
LEFT JOIN contract_history ch ON v.id = ch.vehicle_id
LEFT JOIN clients c ON ch.client_id = c.id
LEFT JOIN rental_contracts rc ON v.id = rc.vehicle_id AND rc.status = 'active'
ORDER BY v.license_plate, ch.changed_at DESC;

-- View para histórico de motoristas
CREATE OR REPLACE VIEW driver_complete_history AS
SELECT 
    c.id as client_id,
    c.name as driver_name,
    c.email,
    c.phone,
    -- Histórico de veículos
    dvh.vehicle_id,
    v.license_plate,
    v.brand,
    v.model,
    dvh.start_date,
    dvh.end_date,
    dvh.is_active,
    dvh.reason_for_change,
    dvh.performance_rating,
    -- Dados do contrato
    rc.monthly_value,
    rc.status as contract_status,
    -- Métricas
    cm.total_payments_made,
    cm.payments_on_time,
    cm.payments_late,
    cm.penalties_applied,
    cm.penalties_amount,
    cm.discounts_applied,
    cm.discounts_amount
FROM clients c
LEFT JOIN driver_vehicle_history dvh ON c.id = dvh.client_id
LEFT JOIN vehicles v ON dvh.vehicle_id = v.id
LEFT JOIN rental_contracts rc ON dvh.contract_id = rc.id
LEFT JOIN contract_metrics cm ON rc.id = cm.contract_id
ORDER BY c.name, dvh.start_date DESC;

-- View para relatório de transferências
CREATE OR REPLACE VIEW vehicle_transfer_report AS
SELECT 
    vt.id as transfer_id,
    v.license_plate,
    v.brand,
    v.model,
    fc.name as from_client,
    tc.name as to_client,
    vt.transfer_date,
    vt.reason,
    vt.transfer_fee,
    vt.status,
    vt.notes
FROM vehicle_transfers vt
JOIN vehicles v ON vt.vehicle_id = v.id
LEFT JOIN clients fc ON vt.from_client_id = fc.id
JOIN clients tc ON vt.to_client_id = tc.id
ORDER BY vt.transfer_date DESC;

-- Comentários nas tabelas
COMMENT ON TABLE contract_history IS 'Histórico de todas as mudanças nos contratos';
COMMENT ON TABLE vehicle_transfers IS 'Registro de transferências de veículos entre clientes';
COMMENT ON TABLE driver_vehicle_history IS 'Histórico de motoristas por veículo';
COMMENT ON TABLE contract_metrics IS 'Métricas e estatísticas dos contratos';

COMMENT ON COLUMN contract_history.action_type IS 'Tipo de ação: created, activated, suspended, terminated, renewed, modified';
COMMENT ON COLUMN vehicle_transfers.status IS 'Status da transferência: pending, completed, cancelled';
COMMENT ON COLUMN driver_vehicle_history.performance_rating IS 'Avaliação de desempenho do motorista (1-5)';