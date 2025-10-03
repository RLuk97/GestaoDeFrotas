const { query, testConnection } = require('../config/database');

const seedData = async () => {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');
    
    // Testar conexão primeiro
    await testConnection();
    
    // Limpar dados existentes (opcional - descomente se necessário)
    // await query('TRUNCATE TABLE services, vehicles, clients RESTART IDENTITY CASCADE');
    
    // Inserir clientes de exemplo
    console.log('📋 Inserindo clientes...');
    const clientsResult = await query(`
      INSERT INTO clients (name, email, phone, address) VALUES
      ('João Silva', 'joao.silva@email.com', '(11) 99999-1111', 'Rua das Flores, 123 - São Paulo, SP'),
      ('Maria Santos', 'maria.santos@email.com', '(11) 99999-2222', 'Av. Paulista, 456 - São Paulo, SP'),
      ('Pedro Oliveira', 'pedro.oliveira@email.com', '(11) 99999-3333', 'Rua Augusta, 789 - São Paulo, SP'),
      ('Ana Costa', 'ana.costa@email.com', '(11) 99999-4444', 'Rua Oscar Freire, 321 - São Paulo, SP'),
      ('Carlos Ferreira', 'carlos.ferreira@email.com', '(11) 99999-5555', 'Av. Faria Lima, 654 - São Paulo, SP')
      RETURNING id, name
    `);
    
    const clients = clientsResult.rows;
    console.log(`✅ ${clients.length} clientes inseridos`);
    
    // Inserir veículos de exemplo
    console.log('🚗 Inserindo veículos...');
    const vehiclesData = [
      [clients[0].id, 'Toyota', 'Corolla', 2020, 'ABC1234', 'Prata', 'Flex', 45000],
      [clients[0].id, 'Honda', 'Civic', 2019, 'DEF5678', 'Preto', 'Flex', 52000],
      [clients[1].id, 'Volkswagen', 'Golf', 2021, 'GHI9012', 'Branco', 'Flex', 28000],
      [clients[2].id, 'Ford', 'Focus', 2018, 'JKL3456', 'Azul', 'Flex', 68000],
      [clients[2].id, 'Chevrolet', 'Onix', 2022, 'MNO7890', 'Vermelho', 'Flex', 15000],
      [clients[3].id, 'Nissan', 'Sentra', 2020, 'PQR1234', 'Cinza', 'Flex', 38000],
      [clients[4].id, 'Hyundai', 'HB20', 2021, 'STU5678', 'Branco', 'Flex', 22000],
      [clients[4].id, 'Fiat', 'Argo', 2019, 'VWX9012', 'Prata', 'Flex', 41000]
    ];
    
    const vehiclesResult = await query(`
      INSERT INTO vehicles (client_id, brand, model, year, license_plate, color, fuel_type, mileage) VALUES
      ${vehiclesData.map((_, i) => `($${i * 8 + 1}, $${i * 8 + 2}, $${i * 8 + 3}, $${i * 8 + 4}, $${i * 8 + 5}, $${i * 8 + 6}, $${i * 8 + 7}, $${i * 8 + 8})`).join(', ')}
      RETURNING id, brand, model, license_plate
    `, vehiclesData.flat());
    
    const vehicles = vehiclesResult.rows;
    console.log(`✅ ${vehicles.length} veículos inseridos`);
    
    // Inserir serviços de exemplo
    console.log('🔧 Inserindo serviços...');
    const servicesData = [
      [vehicles[0].id, clients[0].id, 'Troca de Óleo', 'Troca de óleo e filtro', 150.00, '2024-01-15', 'Processado', 'José Mecânico', 'Óleo 5W30, Filtro de óleo', 1.5],
      [vehicles[0].id, clients[0].id, 'Revisão Geral', 'Revisão dos 45.000 km', 450.00, '2024-01-20', 'Processado', 'José Mecânico', 'Velas, Filtros, Fluidos', 3.0],
      [vehicles[1].id, clients[0].id, 'Alinhamento', 'Alinhamento e balanceamento', 120.00, '2024-01-25', 'Processado', 'Carlos Alinhador', 'Serviço de alinhamento', 1.0],
      [vehicles[2].id, clients[1].id, 'Troca de Pneus', 'Troca dos 4 pneus', 800.00, '2024-02-01', 'Processado', 'Pedro Pneus', '4 pneus 195/65R15', 2.0],
      [vehicles[3].id, clients[2].id, 'Reparo no Freio', 'Troca de pastilhas e discos', 350.00, '2024-02-05', 'Faturado', 'Ana Freios', 'Pastilhas, Discos', 2.5],
      [vehicles[4].id, clients[2].id, 'Troca de Óleo', 'Primeira troca de óleo', 140.00, '2024-02-10', 'Orçamento Solicitado', null, null, 0],
      [vehicles[5].id, clients[3].id, 'Revisão', 'Revisão dos 40.000 km', 380.00, '2024-02-15', 'Orçamento Solicitado', null, null, 0],
      [vehicles[6].id, clients[4].id, 'Lavagem Completa', 'Lavagem e enceramento', 80.00, '2024-02-18', 'Processado', 'Lava Rápido Silva', 'Produtos de limpeza', 1.0],
      [vehicles[7].id, clients[4].id, 'Troca de Bateria', 'Bateria descarregada', 280.00, '2024-02-20', 'Processado', 'Elétrica Auto', 'Bateria 60Ah', 0.5]
    ];
    
    const servicesResult = await query(`
      INSERT INTO services (vehicle_id, client_id, service_type, description, cost, service_date, status, mechanic, parts_used, labor_hours) VALUES
      ${servicesData.map((_, i) => `($${i * 10 + 1}, $${i * 10 + 2}, $${i * 10 + 3}, $${i * 10 + 4}, $${i * 10 + 5}, $${i * 10 + 6}, $${i * 10 + 7}, $${i * 10 + 8}, $${i * 10 + 9}, $${i * 10 + 10})`).join(', ')}
      RETURNING id, service_type, cost
    `, servicesData.flat());
    
    const services = servicesResult.rows;
    console.log(`✅ ${services.length} serviços inseridos`);
    
    // Mostrar resumo
    console.log('\n📊 Resumo do seed:');
    console.log(`👥 Clientes: ${clients.length}`);
    console.log(`🚗 Veículos: ${vehicles.length}`);
    console.log(`🔧 Serviços: ${services.length}`);
    
    const totalRevenue = services.reduce((sum, service) => sum + parseFloat(service.cost), 0);
    console.log(`💰 Receita total: R$ ${totalRevenue.toFixed(2)}`);
    
    console.log('\n✅ Seed concluído com sucesso!');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error);
    process.exit(1);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  seedData();
}

module.exports = { seedData };