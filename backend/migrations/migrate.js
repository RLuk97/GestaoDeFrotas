const fs = require('fs');
const path = require('path');
const { query, testConnection } = require('../config/database');

const runMigrations = async () => {
  try {
    console.log('🔄 Iniciando migrations...');
    
    // Testar conexão primeiro
    await testConnection();
    
    // Permite executar um arquivo de migration específico via argumento
    const targetFile = process.argv[2] || '001_create_tables.sql';
    const migrationPath = path.join(__dirname, targetFile);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Executar migration
    await query(migrationSQL);
    
    console.log(`✅ Migration executada com sucesso: ${targetFile}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao executar migrations:', error);
    process.exit(1);
  }
};

// Executar se chamado diretamente
if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };