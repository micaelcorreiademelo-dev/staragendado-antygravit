# StarAgendado Backend

Backend completo para o sistema StarAgendado, desenvolvido com Node.js, Fastify, TypeScript e Supabase.

## 🚀 Tecnologias

- **Node.js** + **TypeScript**
- **Fastify** (Framework web)
- **Supabase** (PostgreSQL + Auth + RLS)
- **Zod** (Validação de schemas)
- **Swagger** (Documentação automática)
- **Jest** (Testes)

## 📦 Instalação

```bash
npm install
```

## ⚙️ Configuração

Crie um arquivo `.env` na raiz do projeto (já existe um exemplo):

```env
SUPABASE_URL=https://tuxypcfryphcqtuqewbo.supabase.co
SUPABASE_ANON_KEY=sua_chave_aqui
PORT=3000
```

## 🏃 Executando

### Modo Desenvolvimento
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
npm start
```

### Testes
```bash
npm test
```

## 📚 Documentação da API

Após iniciar o servidor, acesse:

**Swagger UI:** `http://localhost:3000/docs`

## 🔐 Endpoints Disponíveis

### Autenticação
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Obter usuário atual

### Planos
- `GET /planos` - Listar planos
- `POST /planos` - Criar plano
- `PUT /planos/:id` - Atualizar plano

### Lojas
- `GET /lojas` - Listar lojas (com filtros: status, plano_id)
- `GET /lojas/:id` - Obter loja por ID
- `POST /lojas` - Criar loja
- `PUT /lojas/:id` - Atualizar loja
- `DELETE /lojas/:id` - Deletar loja

### Profissionais
- `GET /profissionais` - Listar profissionais (filtro: loja_id)
- `POST /profissionais` - Criar profissional
- `PUT /profissionais/:id` - Atualizar profissional
- `DELETE /profissionais/:id` - Deletar profissional
- `PATCH /profissionais/:id/permissoes` - Atualizar permissões

### Serviços
- `GET /servicos` - Listar serviços (filtro: loja_id)
- `POST /servicos` - Criar serviço
- `PUT /servicos/:id` - Atualizar serviço
- `DELETE /servicos/:id` - Deletar serviço

### Agendamentos
- `GET /agendamentos` - Listar agendamentos (filtros: loja_id, profissional_id, status, data)
- `POST /agendamentos` - Criar agendamento (com verificação de conflitos)
- `PUT /agendamentos/:id` - Atualizar agendamento
- `PATCH /agendamentos/:id/status` - Atualizar status
- `DELETE /agendamentos/:id` - Deletar agendamento

### Logs
- `GET /logs` - Listar logs do sistema
- `POST /logs` - Criar log

## 🗄️ Banco de Dados

O banco de dados foi criado no Supabase com as seguintes tabelas:

- `users` - Usuários do sistema
- `lojas` - Lojas cadastradas
- `planos` - Planos de assinatura
- `profissionais` - Profissionais das lojas
- `servicos` - Serviços oferecidos
- `agendamentos` - Agendamentos realizados
- `logs_sistema` - Logs de auditoria

### Row Level Security (RLS)

Todas as tabelas possuem políticas RLS configuradas:

- **Admin**: Acesso total a todos os dados
- **Lojista**: Acesso apenas aos dados da sua loja
- **Profissional**: Acesso aos agendamentos da sua loja
- **Cliente**: Pode criar agendamentos

## 🧪 Testes

Os testes estão localizados em `src/__tests__/` e incluem:

- Testes de conflito de agendamentos
- Validação de políticas RLS
- Testes de integração das rotas

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── plans.routes.ts
│   │   ├── stores.routes.ts
│   │   ├── professionals.routes.ts
│   │   ├── services.routes.ts
│   │   ├── appointments.routes.ts
│   │   └── logs.routes.ts
│   ├── __tests__/
│   │   └── appointments.test.ts
│   └── server.ts
├── .env
├── package.json
├── tsconfig.json
└── jest.config.js
```

## 🔒 Segurança

- Todas as senhas são gerenciadas pelo Supabase Auth
- RLS habilitado em todas as tabelas
- CORS configurado
- Validação de entrada com Zod

## 📝 Próximos Passos

1. Conectar o frontend existente a esta API
2. Implementar webhooks para eventos importantes
3. Adicionar mais testes de integração
4. Implementar rate limiting
5. Adicionar logging estruturado
