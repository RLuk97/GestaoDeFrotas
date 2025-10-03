-- Migration 006: Create Rental System for Taxi Fleet
-- Criação do sistema de aluguel de veículos para frota de táxi

-- Tabela de contratos de aluguel
CREATE TABLE IF NOT EXISTS rental_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    monthly_value DECIMAL(10,2) NOT NULL DEFAULT 2000.00,
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'terminated', 'pending')),
    deposit_value DECIMAL(10,2) DEFAULT 0.00,
    contract_terms TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de mensalidades
CREATE TABLE IF NOT EXISTS monthly_payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES rental_contracts(id) ON DELETE CASCADE,
    reference_month DATE NOT NULL, -- Primeiro dia do mês de referência (ex: 2024-01-01)
    due_date DATE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    paid_amount DECIMAL(10,2) DEFAULT 0.00,
    payment_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'paid', 'overdue')),
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para controle de responsabilidade por manutenções
CREATE TABLE IF NOT EXISTS maintenance_responsibilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    responsible_party VARCHAR(20) NOT NULL CHECK (responsible_party IN ('company', 'driver')),
    reason VARCHAR(100),
    cost_amount DECIMAL(10,2) DEFAULT 0.00,
    driver_charge_amount DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_rental_contracts_vehicle_id ON rental_contracts(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_rental_contracts_client_id ON rental_contracts(client_id);
CREATE INDEX IF NOT EXISTS idx_rental_contracts_status ON rental_contracts(status);
CREATE INDEX IF NOT EXISTS idx_rental_contracts_dates ON rental_contracts(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_monthly_payments_contract_id ON monthly_payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_monthly_payments_reference_month ON monthly_payments(reference_month);
CREATE INDEX IF NOT EXISTS idx_monthly_payments_status ON monthly_payments(status);
CREATE INDEX IF NOT EXISTS idx_monthly_payments_due_date ON monthly_payments(due_date);

CREATE INDEX IF NOT EXISTS idx_maintenance_responsibilities_service_id ON maintenance_responsibilities(service_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_responsibilities_party ON maintenance_responsibilities(responsible_party);

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_rental_contracts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_monthly_payments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_rental_contracts_updated_at
    BEFORE UPDATE ON rental_contracts
    FOR EACH ROW
    EXECUTE FUNCTION update_rental_contracts_updated_at();

CREATE TRIGGER update_monthly_payments_updated_at
    BEFORE UPDATE ON monthly_payments
    FOR EACH ROW
    EXECUTE FUNCTION update_monthly_payments_updated_at();

-- Comentários para documentação
COMMENT ON TABLE rental_contracts IS 'Contratos de aluguel de veículos para motoristas de táxi';
COMMENT ON TABLE monthly_payments IS 'Controle de mensalidades dos contratos de aluguel';
COMMENT ON TABLE maintenance_responsibilities IS 'Controle de responsabilidade por custos de manutenção';

COMMENT ON COLUMN rental_contracts.monthly_value IS 'Valor mensal do aluguel em reais';
COMMENT ON COLUMN rental_contracts.status IS 'Status do contrato: active, suspended, terminated, pending';
COMMENT ON COLUMN monthly_payments.reference_month IS 'Mês de referência da mensalidade (primeiro dia do mês)';
COMMENT ON COLUMN monthly_payments.status IS 'Status do pagamento: pending, partial, paid, overdue';
COMMENT ON COLUMN maintenance_responsibilities.responsible_party IS 'Responsável pelo custo: company ou driver';