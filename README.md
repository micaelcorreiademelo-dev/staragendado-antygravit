<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# StarAgendado - Sistema de Agendamento SaaS

Sistema completo de agendamento multi-tenant com painéis para Admin, Lojista e Cliente.

## 🚀 Deploy na Vercel

### Opção 1: Deploy Direto (Recomendado)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/micaelcorreiademelo-dev/staragendado-antygravit)

### Opção 2: Deploy Manual
1. Acesse [Vercel Dashboard](https://vercel.com/dashboard)
2. Clique em **"Add New Project"**
3. Selecione **"Import Git Repository"**
4. Cole a URL: `https://github.com/micaelcorreiademelo-dev/staragendado-antygravit`
5. **IMPORTANTE**: Certifique-se de selecionar a branch **`main`**
6. Configure as variáveis de ambiente (veja abaixo)
7. Clique em **"Deploy"**

### Variáveis de Ambiente Necessárias
Configure estas variáveis no Vercel antes do deploy:
```
VITE_API_URL=https://seu-backend-url.com
VITE_SUPABASE_URL=sua-url-supabase
VITE_SUPABASE_ANON_KEY=sua-chave-anonima-supabase
```

## 💻 Executar Localmente

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Frontend
```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas credenciais

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
```

### Backend
```bash
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais Supabase

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

## 📚 Documentação Adicional
- [Guia de Setup Detalhado](DETAILED_SETUP_GUIDE.md)
- [Quickstart](QUICKSTART.md)

## 🔧 Estrutura do Projeto
```
├── components/      # Componentes React reutilizáveis
├── contexts/        # Contextos React (Auth, etc)
├── pages/          # Páginas da aplicação
├── services/       # Serviços de API
├── backend/        # API Node.js/Fastify
└── types.ts        # Definições TypeScript
```

## 🛠️ Tecnologias
- **Frontend**: React, TypeScript, Vite, TailwindCSS
- **Backend**: Node.js, Fastify, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Deploy**: Vercel (Frontend) + Supabase (Backend)

## 📝 Licença
Proprietary - Todos os direitos reservados
