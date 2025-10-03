# Backend - Sistema de Gestão de Frotas e Finanças

API REST desenvolvida em Node.js com Express e PostgreSQL para gerenciamento de frotas e serviços automotivos.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **express-validator** - Validação de dados
- **CORS** - Cross-Origin Resource Sharing
- **Helmet** - Segurança HTTP
- **Morgan** - Logging de requisições

## 📋 Pré-requisitos

- Node.js 16+ 
- PostgreSQL 12+
- npm ou yarn

## ⚙️ Configuração

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Copie o arquivo `.env.example` para `.env` e configure:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/gestao_frotas
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gestao_frotas
DB_USER=your_username
DB_PASSWORD=your_password

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# CORS Configuration
FRONTEND_URL=http://localhost:3001
```

### 3. Criar banco de dados
```sql
CREATE DATABASE gestao_frotas;
```

### 4. Executar migrations
```bash
npm run migrate
```

### 5. Popular com dados de exemplo (opcional)
```bash
npm run seed
```

## 🏃‍♂️ Executar

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

O servidor estará disponível em `http://localhost:5000`

## 📚 API Endpoints

### Health Check
- `GET /api/health` - Status do servidor

### Clientes
- `GET /api/clients` - Listar clientes
- `GET /api/clients/:id` - Buscar cliente por ID
- `POST /api/clients` - Criar cliente
- `PUT /api/clients/:id` - Atualizar cliente
- `DELETE /api/clients/:id` - Deletar cliente
- `GET /api/clients/stats/count` - Contar clientes

### Veículos
- `GET /api/vehicles` - Listar veículos
- `GET /api/vehicles/:id` - Buscar veículo por ID
- `POST /api/vehicles` - Criar veículo
- `PUT /api/vehicles/:id` - Atualizar veículo
- `DELETE /api/vehicles/:id` - Deletar veículo
- `GET /api/vehicles/stats/count` - Contar veículos
- `GET /api/vehicles/stats/brands` - Estatísticas por marca

### Serviços
- `GET /api/services` - Listar serviços
- `GET /api/services/:id` - Buscar serviço por ID
- `POST /api/services` - Criar serviço
- `PUT /api/services/:id` - Atualizar serviço
- `DELETE /api/services/:id` - Deletar serviço
- `GET /api/services/stats/financial` - Estatísticas financeiras
- `GET /api/services/stats/status` - Serviços por status
- `GET /api/services/stats/count` - Contar serviços

## 🗄️ Estrutura do Banco

### Tabelas
- **clients** - Dados dos clientes
- **vehicles** - Veículos dos clientes
- **services** - Serviços realizados nos veículos

### Relacionamentos
- Um cliente pode ter vários veículos
- Um veículo pode ter vários serviços
- Cada serviço pertence a um cliente e um veículo

## 🔒 Validações

### Cliente
- Nome: 2-255 caracteres
- Email: formato válido e único
- Telefone: formato brasileiro (opcional)
- Endereço: máximo 500 caracteres (opcional)

### Veículo
- Marca: 2-100 caracteres
- Modelo: 2-100 caracteres
- Ano: 1900 até ano atual + 1
- Placa: formato brasileiro (ABC1234 ou ABC1D23)
- Combustível: valores predefinidos
- Quilometragem: número positivo

### Serviço
- Tipo: 2-100 caracteres
- Custo: valor positivo
- Data: formato ISO 8601
- Status: valores predefinidos
- Descrição: máximo 1000 caracteres

## 🚨 Tratamento de Erros

A API retorna erros padronizados:

```json
{
  "error": "Tipo do erro",
  "message": "Descrição detalhada",
  "details": [] // Array com detalhes de validação (quando aplicável)
}
```

### Códigos HTTP
- `200` - Sucesso
- `201` - Criado
- `400` - Dados inválidos
- `404` - Não encontrado
- `409` - Conflito (duplicação)
- `500` - Erro interno

## 📊 Recursos Avançados

### Pool de Conexões
- Máximo 20 conexões simultâneas
- Timeout de 30s para conexões inativas
- Timeout de 2s para estabelecer conexão

### Logging
- Todas as requisições são logadas
- Queries SQL são monitoradas
- Tempo de execução é registrado

### Segurança
- Helmet para headers de segurança
- CORS configurado
- Validação rigorosa de entrada
- Sanitização de dados

## 🔧 Scripts Disponíveis

- `npm start` - Iniciar servidor
- `npm run dev` - Desenvolvimento com nodemon
- `npm run migrate` - Executar migrations
- `npm run seed` - Popular banco com dados

## 📁 Estrutura de Arquivos

```
backend/
├── config/
│   └── database.js      # Configuração do PostgreSQL
├── migrations/
│   ├── 001_create_tables.sql
│   └── migrate.js       # Script de migration
├── models/
│   ├── Client.js        # Modelo de cliente
│   ├── Vehicle.js       # Modelo de veículo
│   └── Service.js       # Modelo de serviço
├── routes/
│   ├── clients.js       # Rotas de clientes
│   ├── vehicles.js      # Rotas de veículos
│   └── services.js      # Rotas de serviços
├── seeds/
│   └── seed.js          # Dados de exemplo
├── .env                 # Variáveis de ambiente
├── .env.example         # Exemplo de configuração
├── package.json         # Dependências
└── server.js           # Servidor principal
```