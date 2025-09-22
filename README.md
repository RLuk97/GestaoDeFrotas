# Sistema de Gestão de Frota e Finanças

## 📋 Descrição

Sistema completo para gestão de frotas e controle financeiro de oficinas automotivas, desenvolvido em React com Tailwind CSS. O sistema oferece funcionalidades abrangentes para gerenciamento de veículos, serviços, controle de pagamentos e análise financeira.

## ✨ Funcionalidades

### 🚗 Gestão de Veículos
- **Cadastro completo** de veículos com informações detalhadas
- **Busca e filtros** avançados por placa, marca, modelo e proprietário
- **Visualização detalhada** com histórico de serviços
- **Edição e exclusão** de registros
- **Controle de quilometragem** e observações

### 🔧 Gestão de Serviços
- **Registro de serviços** com descrição detalhada
- **Controle de entrada e saída** de veículos
- **Gestão de peças** utilizadas nos serviços
- **Controle de pagamentos** (Pendente, Parcial, Pago)
- **Cálculo automático** de valores e custos
- **Histórico completo** por veículo

### 📊 Dashboard Inteligente
- **Estatísticas em tempo real** da frota
- **Resumo financeiro** com receitas e pendências
- **Serviços em andamento** e alertas
- **Gráficos e indicadores** de performance
- **Visão geral** dos pagamentos pendentes

### 💰 Controle Financeiro
- **Acompanhamento de receitas** por período
- **Controle de pagamentos** pendentes
- **Análise de custos** por serviço
- **Relatórios financeiros** detalhados

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca JavaScript para interfaces
- **React Router DOM** - Roteamento e navegação
- **Tailwind CSS** - Framework CSS utilitário
- **Lucide React** - Biblioteca de ícones
- **Date-fns** - Manipulação de datas
- **Context API** - Gerenciamento de estado global

### Backend (Planejado)
- **Node.js** - Runtime JavaScript para servidor
- **Express.js** - Framework web minimalista e flexível
- **JWT (JSON Web Tokens)** - Autenticação e autorização
- **Bcrypt** - Criptografia de senhas
- **Multer** - Upload de arquivos
- **Cors** - Controle de acesso entre origens
- **Helmet** - Segurança HTTP

### Banco de Dados (Planejado)
- **PostgreSQL** - Banco de dados relacional robusto
- **Prisma ORM** - Object-Relational Mapping moderno
- **Redis** - Cache em memória para sessões e dados temporários

### DevOps & Deploy (Planejado)
- **Vercel** - Deploy do frontend React
- **Railway** - Deploy do backend Node.js
- **Docker** - Containerização da aplicação backend
- **PM2** - Gerenciador de processos Node.js
- **SSL/TLS** - Certificados de segurança automáticos

## 📦 Instalação

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Passos para instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd "Gestão de Frotas e Finanças"
```

2. **Instale as dependências**
```bash
npm install
```

3. **Execute o projeto**
```bash
npm start
```

4. **Acesse o sistema**
```
http://localhost:3000
```

## 🏗️ Estrutura do Projeto

```
src/
├── components/           # Componentes reutilizáveis
│   ├── Common/          # Componentes comuns (Modal, Loading, etc.)
│   ├── Layout/          # Layout principal e navegação
│   ├── Services/        # Componentes específicos de serviços
│   └── Vehicles/        # Componentes específicos de veículos
├── context/             # Gerenciamento de estado global
│   └── AppContext.js    # Context principal da aplicação
├── pages/               # Páginas principais
│   ├── Dashboard.js     # Painel principal
│   ├── Vehicles.js      # Listagem de veículos
│   ├── VehicleDetails.js # Detalhes do veículo
│   ├── Services.js      # Listagem de serviços
│   ├── ServiceDetails.js # Detalhes do serviço
│   ├── Parts.js         # Gestão de peças (futuro)
│   └── History.js       # Histórico completo (futuro)
├── App.js               # Componente principal
├── index.js             # Ponto de entrada
└── index.css            # Estilos globais
```

## 🎨 Design System

### Cores Principais
- **Primária**: Azul (#3B82F6)
- **Secundária**: Cinza (#6B7280)
- **Sucesso**: Verde (#10B981)
- **Aviso**: Amarelo (#F59E0B)
- **Erro**: Vermelho (#EF4444)

### Componentes Estilizados
- **Botões**: Primário, Secundário, Perigo
- **Cards**: Layout consistente com sombras
- **Formulários**: Campos padronizados com validação
- **Modais**: Overlay responsivo
- **Badges**: Status coloridos

## 📱 Responsividade

O sistema é totalmente responsivo e otimizado para:
- **Desktop** (1024px+)
- **Tablet** (768px - 1023px)
- **Mobile** (320px - 767px)

### Características Responsivas
- Navegação lateral colapsável em mobile
- Tabelas com scroll horizontal
- Formulários adaptáveis
- Cards empilháveis
- Botões touch-friendly

## 🔄 Gerenciamento de Estado

### Context API
O sistema utiliza React Context para gerenciamento de estado global:

```javascript
// Estado principal
{
  vehicles: [],    // Lista de veículos
  services: [],    // Lista de serviços
  clients: [],     // Lista de clientes
  parts: []        // Lista de peças
}

// Ações disponíveis
- ADD_VEHICLE / UPDATE_VEHICLE / DELETE_VEHICLE
- ADD_SERVICE / UPDATE_SERVICE / DELETE_SERVICE
- ADD_CLIENT / UPDATE_CLIENT / DELETE_CLIENT
```

### Funções Auxiliares
- `getServicesInProgress()` - Serviços em andamento
- `getPendingPayments()` - Pagamentos pendentes
- `getVehicleServices(vehicleId)` - Serviços por veículo
- `calculateTotalRevenue()` - Receita total

## 🧪 Dados de Exemplo

O sistema vem com dados mockados para demonstração:
- **5 veículos** de diferentes marcas e modelos
- **7 serviços** com status variados
- **Peças e componentes** associados
- **Histórico financeiro** completo

## 🚀 Funcionalidades Futuras

### 📦 Módulo de Peças (v2.0)
- Controle de estoque
- Cadastro de fornecedores
- Relatórios de movimentação
- Integração com serviços

### 📈 Módulo de Histórico (v2.0)
- Relatórios avançados
- Exportação em PDF
- Gráficos detalhados
- Análise de tendências

### 🔐 Sistema de Autenticação (v3.0)
- Login de usuários
- Controle de permissões
- Auditoria de ações
- Backup automático

## 🎯 Padrões de Código

### Clean Code
- **Nomes descritivos** para variáveis e funções
- **Componentes pequenos** e focados
- **Separação de responsabilidades**
- **Comentários explicativos** quando necessário

### Estrutura de Componentes
```javascript
// Padrão de componente
const ComponentName = ({ props }) => {
  // 1. Hooks e estado
  // 2. Funções auxiliares
  // 3. Handlers de eventos
  // 4. Render
};
```

### Convenções
- **PascalCase** para componentes
- **camelCase** para funções e variáveis
- **kebab-case** para arquivos CSS
- **Imports organizados** por categoria

## 🐛 Tratamento de Erros

- **Validação de formulários** em tempo real
- **Mensagens de erro** claras e específicas
- **Estados de loading** durante operações
- **Fallbacks** para dados não encontrados
- **Confirmações** para ações destrutivas

## 📊 Performance

### Otimizações Implementadas
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

- **Desenvolvedor Principal**: [Seu Nome]
- **UI/UX Design**: Sistema próprio com Tailwind CSS
- **Arquitetura**: React (Frontend) + Node.js/Express (Backend) + PostgreSQL (Database)

## 📞 Suporte

Para suporte e dúvidas:
- **Email**: suporte@gestaofrota.com
- **Documentação**: [Link da documentação]
- **Issues**: [Link do GitHub Issues]

---

**Desenvolvido para otimizar a gestão de frotas e oficinas automotivas.**