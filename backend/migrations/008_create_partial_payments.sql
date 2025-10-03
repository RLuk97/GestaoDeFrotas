-- Migração 008: Sistema de Mensalidades Parcialmente Pagas
-- Criação das tabelas para gerenciar pagamentos parciais das mensalidades

-- Tabela de pagamentos parciais
CREATE TABLE IF NOT EXISTS partial_payments (
    id SERIAL PRIMARY KEY,
    contract_id UUID NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount_paid DECIMAL(10,2) NOT NULL,
    monthly_amount DECIMAL(10,2) NOT NULL,
    remaining_amount DECIMAL(10,2) NOT NULL,
    payment_type VARCHAR(20) DEFAULT 'partial' CHECK (payment_type IN ('partial', 'advance', 'full')),
    reference_month DATE NOT NULL, -- Mês de referência da mensalidade
    payment_method VARCHAR(50) DEFAULT 'cash',
    notes TEXT,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES rental_contracts(id) ON DELETE CASCADE
);

-- Tabela de saldos devedores
CREATE TABLE IF NOT EXISTS outstanding_balances (
    id SERIAL PRIMARY KEY,
    contract_id UUID NOT NULL,
    original_month DATE NOT NULL, -- Mês original da mensalidade
    outstanding_amount DECIMAL(10,2) NOT NULL,
    original_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    due_date DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES rental_contracts(id) ON DELETE CASCADE,
    UNIQUE(contract_id, original_month)
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_partial_payments_contract_id ON partial_payments(contract_id);
CREATE INDEX IF NOT EXISTS idx_partial_payments_reference_month ON partial_payments(reference_month);
CREATE INDEX IF NOT EXISTS idx_partial_payments_payment_date ON partial_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_outstanding_balances_contract_id ON outstanding_balances(contract_id);
CREATE INDEX IF NOT EXISTS idx_outstanding_balances_status ON outstanding_balances(status);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_partial_payments_updated_at 
    BEFORE UPDATE ON partial_payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outstanding_balances_updated_at 
    BEFORE UPDATE ON outstanding_balances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir dados de exemplo
INSERT INTO partial_payments (contract_id, amount_paid, monthly_amount, remaining_amount, reference_month, payment_method, notes) VALUES
((SELECT id FROM rental_contracts LIMIT 1), 800.00, 1200.00, 400.00, '2024-01-01', 'pix', 'Pagamento parcial - cliente pagará restante no próximo mês'),
((SELECT id FROM rental_contracts LIMIT 1), 400.00, 400.00, 0.00, '2024-01-01', 'cash', 'Pagamento do saldo devedor do mês anterior');

INSERT INTO outstanding_balances (contract_id, original_month, outstanding_amount, original_amount, due_date) VALUES
((SELECT id FROM rental_contracts LIMIT 1), '2024-01-01', 400.00, 1200.00, '2024-02-05');