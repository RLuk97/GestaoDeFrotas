# GestFrota — Gestão de Frotas e Finanças

Sistema web para gestão de frotas, serviços e controle operacional, com backend em Node.js/Express e banco de dados PostgreSQL, e frontend em React com Tailwind CSS. Inclui autenticação, proteção de rotas, logs de atividades, módulos de clientes, veículos e serviços, e base para evolução financeira.

## ✨ Módulos Atuais

- Dashboard: visão geral de KPIs, serviços em andamento e atividades recentes.
- Clientes: cadastro, edição, consulta e histórico do cliente.
- Veículos: cadastro, listagem, detalhes, associação ao cliente e quilometragem.
- Serviços: abertura, edição, filtro por status, mês e veículo; exportação em PDF.
- Atividades: feed de atividades recentes (criação/atualização/remoção) com adaptação de status.
- Notificações: área preparada para exibir eventos relevantes na UI.
- Autenticação: login, logout, persistência de sessão e rotas protegidas.

## 🔐 Autenticação e Sessão

- Login com persistência de sessão em `localStorage` e hidratação antes de proteger rotas.
- `ProtectedRoute` aguarda `isLoading` do `AuthContext` antes de decidir redirecionar.
- Logout disponível no cabeçalho dentro do menu “Administrador”.

## 🧩 Funcionalidades-Chave

- CRUDs completos de Clientes, Veículos e Serviços.
- Filtros e busca em listas (placa, marca, status, mês, veículo).
- Exportação de lista de serviços em PDF (`jsPDF` + `autotable`).
- Logs de atividades com normalização de status (completed/in_progress/pending/cancelled).
- Interface responsiva com layout em grid e componentes Tailwind.

## 📦 Módulos de Upgrade (Roadmap)

- Peças/Estoque: catálogo, fornecedores e movimentação (nav presente como desativado).
- Relatórios avançados: relatórios financeiros e operacionais com exportação.
- Financeiro ampliado: conciliações, métodos de pagamento, saldos e cobranças.
- Telemetria e manutenção preventiva: integração futura com rastreamento e agendamentos.
- Multi-empresa e RBAC: perfis, papéis e permissões refinadas.
- Sistema de Aluguéis (base já em migrações): contratos, mensalidades e status.

## 🛠️ Tecnologias Utilizadas

### Frontend
- React 18, React Router v6.
- Tailwind CSS com design tokens customizados (`brand-*`).
- Context API para estado global (Auth, App, Settings, Notifications).
- Lucide React (ícones) e `jsPDF`/`jspdf-autotable` para exportação.
- Proxy de desenvolvimento para o backend (`setupProxy.js`).

### Backend
- Node.js + Express.
- PostgreSQL via `pg` (pool de conexões e queries SQL). 
- `express-validator`, `helmet`, `cors`, `morgan`, `compression`.
- Migrations SQL em `backend/migrations` e seed em `backend/seeds`.
- Observação: `sequelize` está disponível para uso futuro; modelos atuais usam SQL direto.

## ⚙️ Desenvolvimento

### Backend
- Configurar `.env` (ver `backend/.env.example`).
- Criar banco de dados (`gestao_frotas`).
- Executar migrations: `npm run migrate` (padrão roda `001_create_tables.sql`; é possível passar outro arquivo como argumento).
- Popular dados de exemplo (opcional): `npm run seed`.
- Rodar servidor: `npm run dev` (porta padrão `5000`).

### Frontend
- `npm install` na pasta `frontend`.
- `npm start` para desenvolvimento. A porta padrão é `3000`. Em ambientes locais pode variar (`PORT=3001 npm start`).
- O frontend usa proxy para `http://localhost:5000/api` durante o desenvolvimento.

## 🔌 Integração Frontend ↔ Backend

- Proxy: requests do frontend para `'/api'` são redirecionadas ao backend.
- Em produção, configure `REACT_APP_API_URL` com a URL pública do backend para evitar falhas.
- Health check: `GET http://localhost:5000/api/health`.

## 📱 Responsividade

- Layout em grid com duas colunas no desktop e coluna única em telas menores.
- Tela de login responsiva: formulário centralizado e painel visual exibido a partir de `md`.
- Tabelas com scroll e cards empilháveis em mobile.
- Ações e botões touch-friendly.

## 🏗️ Estrutura (resumo)

```
frontend/
  src/
    App.js               # Rotas e ProtectedRoute
    pages/               # Dashboard, Clients, Vehicles, Services, Details, Login
    components/          # Layout, Common, Services, Vehicles
    context/             # Auth, App, Settings, Notifications
    utils/               # i18n, helpers
    setupProxy.js        # Proxy dev → backend

backend/
  config/database.js     # Pool PostgreSQL
  migrations/            # SQL migrations (inclui aluguel, danos, pagamentos parciais)
  routes/                # clients, vehicles, services, activities
  models/                # mapeamentos para payload do frontend
  seeds/                 # dados exemplo
  server.js              # servidor Express
```

## 🔐 Erros e Resiliência

- `ErrorBoundary` no frontend para capturar exceções e manter estabilidade.
- Middleware de erros no backend com mensagens amigáveis e CORS seguro.

## 🚀 Deploy

- Frontend: Vercel (configurar `REACT_APP_API_URL`).
- Backend: Railway/Render/Heroku equivalentes; usar `DATABASE_URL` com SSL em produção.

---

### Observações
- Este README reflete o estado atual do sistema e seu roadmap. Itens marcados como “upgrade” possuem base técnica em parte do backend (migrations e estrutura), e serão expostos na UI conforme evolução.
- **Lazy loading** de componentes
- **Memoização** de cálculos pesados
- **Debounce** em campos de busca
- **Paginação** em listas grandes
- **Compressão** de assets

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm start          # Inicia servidor de desenvolvimento
npm run build      # Build para produção
npm test           # Executa testes
npm run eject      # Ejeta configurações (irreversível)

# Linting e formatação
npm run lint       # Verifica código
npm run format     # Formata código
```

## 📝 Contribuição

1. **Fork** o projeto
2. **Crie** uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. **Push** para a branch (`git push origin feature/AmazingFeature`)
5. **Abra** um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👥 Equipe

- **Desenvolvedor Principal**: Ryan Lucas
- **UI/UX Design**: Sistema próprio com Tailwind CSS
- **Arquitetura**: React (Frontend) + Node.js/Express (Backend) + PostgreSQL (Database)

## 📞 Suporte

Para suporte e dúvidas:
- **Email**: suporte@gestaofrota.com
- **Documentação**: [Link da documentação]
- **Issues**: [Link do GitHub Issues]

---

**Desenvolvido para otimizar a gestão de frotas e oficinas automotivas.**

## 🚀 Deploy (Railway + Vercel)

### Backend no Railway
- Conecte via `Repositório GitHub` e selecione este repo.
- Configure:
  - `Root Directory`: `backend`
  - `Build Command`: `npm install`
  - `Start Command`: `npm start`
- Variáveis de ambiente (Service → Variables):
  - `DATABASE_URL`: string do Postgres do Railway
  - `JWT_SECRET`: chave forte de sua escolha
  - `NODE_ENV=production`
  - `FRONTEND_URL=https://<seu-domínio-vercel>`
- Executar migrations no Shell do serviço Web (Node):
  - `npm run migrate 001_create_tables.sql`
  - `npm run migrate 002_add_client_fields.sql`
  - `npm run migrate 003_add_service_fields.sql`
  - `npm run migrate 004_add_vehicle_status.sql`
  - `npm run migrate 005_modify_service_type_for_multiple.sql`
  - `npm run migrate 006_create_rental_system.sql`
  - `npm run migrate 007_create_damage_system.sql`
  - `npm run migrate 008_create_partial_payments.sql`
  - `npm run migrate 009_create_contract_history.sql`
  - `npm run migrate 010_update_service_status.sql`
  - `npm run migrate 011_make_vehicle_client_optional.sql`
- Opcional (dados exemplo): `npm run seed`
- Health check: abra `https://<app>.up.railway.app/api/health` e valide `200` com JSON.

### Frontend no Vercel
- Conecte o repositório e selecione a pasta `frontend`.
- Variáveis de ambiente:
  - `REACT_APP_API_URL=https://<app>.up.railway.app/api`
- Build:
  - `Build Command`: `npm run build`
  - `Output Directory`: `build`
- Após publicar, a aplicação consumirá o backend pela URL acima.

### Desenvolvimento vs Produção
- Dev: proxy do React mapeia `'/api'` para `http://localhost:5000` (`frontend/src/setupProxy.js`).
- Prod: o `ApiService` usa `process.env.REACT_APP_API_URL` (definido no Vercel).

### Dicas e Troubleshooting
- CORS: ajuste `FRONTEND_URL` no backend para o domínio Vercel (e previews, se necessário).
- Respostas `304 Not Modified`: em dev desativamos ETag e adicionamos `no-cache` no backend.
- Porta: Railway injeta `PORT`; o backend usa `process.env.PORT || 5000`.