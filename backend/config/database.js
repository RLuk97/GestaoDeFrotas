const { Pool } = require('pg');
require('dotenv').config();

// Configuração do pool de conexões
// Suporta tanto variáveis individuais (DB_*) quanto DATABASE_URL.
// Em produção (Railway), usa SSL com rejectUnauthorized=false para compatibilidade.
let pool;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  });
} else {
  pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20, // máximo de conexões no pool
    idleTimeoutMillis: 30000, // tempo limite para conexões inativas
    connectionTimeoutMillis: 2000, // tempo limite para estabelecer conexão
  });
}

// Função para testar conexão
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ Conectado ao PostgreSQL com sucesso!');
    client.release();
  } catch (err) {
    console.error('❌ Erro ao conectar ao PostgreSQL:', err.message);
    process.exit(1);
  }
};

// Função para executar queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executada:', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('Erro na query:', err);
    throw err;
  }
};

// Função para transações
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;
  
  // Sobrescrever o método release para adicionar timeout
  const timeout = setTimeout(() => {
    console.error('Cliente não foi liberado após 5 segundos!');
  }, 5000);
  
  client.release = () => {
    clearTimeout(timeout);
    return release.apply(client);
  };
  
  return client;
};

module.exports = {
  pool,
  query,
  getClient,
  testConnection
};