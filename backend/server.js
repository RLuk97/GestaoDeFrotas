const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de segurança
app.use(helmet());

// Middleware de compressão
app.use(compression());

// Middleware de logging (reduzido e configurável por ambiente)
const logFormat = process.env.LOG_FORMAT || (process.env.NODE_ENV === 'production' ? 'combined' : 'tiny');
if (logFormat !== 'off') {
  app.use(morgan(logFormat));
}

// Middleware de CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3006',
  'http://localhost:3007'
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requisições sem origin (ex.: curl, server-side)
    if (!origin) return callback(null, true);
    // Em desenvolvimento, permitir qualquer localhost:porta
    const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin);
    if (allowedOrigins.includes(origin) || isLocalhost) {
      return callback(null, true);
    }
    return callback(new Error('CORS: origem não permitida'));
  },
  credentials: true
}));

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Evitar respostas 304 (ETag) e caching em desenvolvimento
// Garante que o frontend receba sempre 200 com corpo JSON
app.set('etag', false);
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Importar rotas (apenas módulos ativos)
const clientsRoutes = require('./routes/clients');
const servicesRoutes = require('./routes/services');
const vehiclesRoutes = require('./routes/vehicles');
const activitiesRoutes = require('./routes/activities');

// Usar rotas (apenas módulos ativos)
app.use('/api/clients', clientsRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/activities', activitiesRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo deu errado!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Erro interno do servidor'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});