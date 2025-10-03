const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  console.log('🔧 Configurando proxy para /api -> http://localhost:5000');
  
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
      logLevel: 'info'
    })
  );
  
  console.log('✅ Proxy configurado com sucesso!');
};