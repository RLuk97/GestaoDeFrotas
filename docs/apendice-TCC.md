# Apêndice — Trechos Principais (com explicações)

Abaixo estão os trechos essenciais do sistema, organizados por tema. Cada bloco começa com uma explicação direta e objetiva, detalhando o propósito, onde se encaixa na arquitetura e o que garantir em produção.

## Frontend (principal)
Montagem do aplicativo com provedores de estado (autenticação, configurações e notificações) e roteamento de páginas. A rota protegida assegura que as áreas críticas fiquem atrás de autenticação e o layout global mantém consistência visual.

```jsx
// frontend/src/App.js (trecho principal)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            } />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}
```

## Backend (principal)
Servidor Express com segurança básica, compressão e parsing de JSON; registra as rotas REST principais. Este é o ponto único de entrada do backend e serve para rodar localmente e em produção (Railway).

```js
// backend/server.js (trecho principal)
const express = require('express');
const helmet = require('helmet');
const compression = require('compression');
const clients = require('./routes/clients');
const vehicles = require('./routes/vehicles');
const services = require('./routes/services');

const app = express();
app.use(helmet());
app.use(compression());
app.use(express.json());

app.use('/api/clients', clients);
app.use('/api/vehicles', vehicles);
app.use('/api/services', services);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API on :${port}`));
```

## Comunicação Front ↔ Back (principal)
Camada de serviço centraliza chamadas HTTP. Em produção, usa `REACT_APP_API_URL`; em desenvolvimento, funciona com proxy (`/api`) ou apontando para `http://localhost:<porta>`. Inclui um método genérico `request` e um exemplo de consumo.

```js
// frontend/src/services/api.js (trecho principal)
const PROD_BASE = process.env.REACT_APP_API_URL; // ex.: https://api.suaapp.com
const DEV_BASE = process.env.REACT_APP_DEV_API || '/api';
const BASE_URL = PROD_BASE || DEV_BASE;

async function request(path, { method = 'GET', body, headers = {} } = {}) {
  const resp = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.json();
}

export const getClients = () => request('/clients');
```

### Desenvolvimento (proxy)
Durante desenvolvimento, o proxy evita CORS e roteia as chamadas do frontend para o backend local, mantendo a mesma origem.

```js
// frontend/src/setupProxy.js (trecho principal)
const { createProxyMiddleware } = require('http-proxy-middleware');
module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({ target: 'http://localhost:3000', changeOrigin: true })
  );
};
```

## Dados (principal)
Migração inicial define o modelo relacional base com chaves primárias em UUID. Cria `clients`, `vehicles` e `services`, relacionando veículos ao cliente e serviços ao veículo, com campos essenciais de negócio.

```sql
-- backend/migrations/001_create_tables.sql (trecho principal)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  document TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  plate TEXT UNIQUE,
  model TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vehicle_id UUID REFERENCES vehicles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  status TEXT NOT NULL,
  amount NUMERIC(12,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Produção — Railway/Vercel (principal)
No Railway, o backend lê `DATABASE_URL` e habilita SSL em produção. No Vercel, o frontend usa `REACT_APP_API_URL` apontando para a API pública; o `vercel.json` garante roteamento de SPA.

```js
// backend/config/database.js (trecho principal)
const { Pool } = require('pg');
const isProd = process.env.NODE_ENV === 'production';
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProd ? { rejectUnauthorized: false } : false,
});
module.exports = pool;
```

```ini
# backend/.env.example (trecho principal)
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

```json
// frontend/vercel.json (trecho principal)
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Notas de produção:
- Configurar `REACT_APP_API_URL` no Vercel apontando para a URL da API no Railway.
- Em `DATABASE_URL`, usar usuário/senha/host do provisionamento do Railway e habilitar SSL.
- Validar CORS (se necessário) e cookies/sessão conforme política da aplicação.