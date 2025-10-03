-- Migração para sistema de responsabilidade por danos
-- Criação das tabelas para controle de danos e responsabilidades

-- Tabela de tipos de danos
CREATE TABLE damage_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    default_responsibility VARCHAR(20) DEFAULT 'company' CHECK (default_responsibility IN ('company', 'driver', 'shared')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de danos reportados
CREATE TABLE damage_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES rental_contracts(id) ON DELETE SET NULL,
    damage_type_id UUID NOT NULL REFERENCES damage_types(id) ON DELETE RESTRICT,
    description TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    estimated_cost DECIMAL(10,2),
    actual_cost DECIMAL(10,2),
    responsibility VARCHAR(20) NOT NULL CHECK (responsibility IN ('company', 'driver', 'shared')),
    responsibility_percentage INTEGER DEFAULT 100 CHECK (responsibility_percentage BETWEEN 0 AND 100),
    status VARCHAR(20) DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'approved', 'rejected', 'resolved')),
    reported_by VARCHAR(100),
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de evidências de danos
CREATE TABLE damage_evidences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    damage_report_id UUID NOT NULL REFERENCES damage_reports(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER,
    description TEXT,
    uploaded_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de cobranças por danos
CREATE TABLE damage_charges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    damage_report_id UUID NOT NULL REFERENCES damage_reports(id) ON DELETE CASCADE,
    contract_id UUID NOT NULL REFERENCES rental_contracts(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    charge_type VARCHAR(20) DEFAULT 'damage' CHECK (charge_type IN ('damage', 'deductible', 'penalty')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'disputed')),
    due_date DATE,
    paid_at TIMESTAMP,
    payment_method VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir tipos de danos padrão
INSERT INTO damage_types (name, description, default_responsibility) VALUES
('Arranhão na Pintura', 'Arranhões superficiais na pintura do veículo', 'driver'),
('Amassado na Carroceria', 'Amassados na lataria do veículo', 'driver'),
('Vidro Quebrado', 'Quebra de vidros (para-brisa, janelas, espelhos)', 'driver'),
('Pneu Furado', 'Furo ou dano no pneu', 'shared'),
('Desgaste Natural', 'Desgaste normal por uso do veículo', 'company'),
('Problema Mecânico', 'Falhas mecânicas não relacionadas ao uso inadequado', 'company'),
('Acidente de Trânsito', 'Danos causados por acidentes de trânsito', 'driver'),
('Vandalismo', 'Danos causados por terceiros (vandalismo, roubo)', 'company'),
('Mau Uso', 'Danos causados por uso inadequado do veículo', 'driver'),
('Desgaste de Peças', 'Desgaste acelerado de peças por uso inadequado', 'driver');

-- Índices para melhor performance
CREATE INDEX idx_damage_reports_vehicle_id ON damage_reports(vehicle_id);
CREATE INDEX idx_damage_reports_contract_id ON damage_reports(contract_id);
CREATE INDEX idx_damage_reports_status ON damage_reports(status);
CREATE INDEX idx_damage_reports_responsibility ON damage_reports(responsibility);
CREATE INDEX idx_damage_reports_reported_at ON damage_reports(reported_at);
CREATE INDEX idx_damage_evidences_damage_report_id ON damage_evidences(damage_report_id);
CREATE INDEX idx_damage_charges_damage_report_id ON damage_charges(damage_report_id);
CREATE INDEX idx_damage_charges_contract_id ON damage_charges(contract_id);
CREATE INDEX idx_damage_charges_status ON damage_charges(status);

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_damage_types_updated_at BEFORE UPDATE ON damage_types FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_damage_reports_updated_at BEFORE UPDATE ON damage_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_damage_charges_updated_at BEFORE UPDATE ON damage_charges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários nas tabelas
COMMENT ON TABLE damage_types IS 'Tipos de danos possíveis nos veículos';
COMMENT ON TABLE damage_reports IS 'Relatórios de danos reportados nos veículos';
COMMENT ON TABLE damage_evidences IS 'Evidências (fotos, documentos) dos danos reportados';
COMMENT ON TABLE damage_charges IS 'Cobranças aplicadas aos motoristas por danos';

COMMENT ON COLUMN damage_reports.responsibility IS 'Responsabilidade pelo dano: company (empresa), driver (motorista), shared (compartilhada)';
COMMENT ON COLUMN damage_reports.responsibility_percentage IS 'Percentual de responsabilidade quando compartilhada';
COMMENT ON COLUMN damage_reports.severity IS 'Gravidade do dano: low, medium, high, critical';
COMMENT ON COLUMN damage_charges.charge_type IS 'Tipo de cobrança: damage (dano), deductible (franquia), penalty (multa)';