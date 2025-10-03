const { query } = require('./config/database');

async function addVehicleStatus() {
  try {
    console.log('🔄 Adicionando campo status na tabela vehicles...');
    
    // Verificar se a coluna já existe
    const checkColumn = await query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'vehicles' AND column_name = 'status'
    `);
    
    if (checkColumn.rows.length > 0) {
      console.log('✅ Campo status já existe na tabela vehicles');
      return;
    }
    
    // Adicionar coluna status
    await query(`
      ALTER TABLE vehicles 
      ADD COLUMN status VARCHAR(20) DEFAULT 'active'
    `);
    console.log('✅ Campo status adicionado com sucesso');
    
    // Atualizar veículos existentes
    await query(`
      UPDATE vehicles 
      SET status = 'active' 
      WHERE status IS NULL
    `);
    console.log('✅ Veículos existentes atualizados para status "active"');
    
    // Adicionar constraint
    await query(`
      ALTER TABLE vehicles 
      ADD CONSTRAINT vehicles_status_check 
      CHECK (status IN ('active', 'inactive', 'maintenance'))
    `);
    console.log('✅ Constraint de status adicionada');
    
    // Criar índice
    await query(`
      CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status)
    `);
    console.log('✅ Índice de status criado');
    
    console.log('🎉 Campo status adicionado com sucesso na tabela vehicles!');
    
  } catch (error) {
    console.error('❌ Erro ao adicionar campo status:', error);
  } finally {
    process.exit(0);
  }
}

addVehicleStatus();