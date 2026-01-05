# Product Requirements Document (PRD) - StarAgendado

## 1. Visão Geral do Produto
**Nome do Produto:** StarAgendado
**Descrição:** Plataforma SaaS para gestão de agendamentos e administração de lojas (ex: barbearias, salões de beleza, estúdios). O sistema permite que administradores gerenciem múltiplas lojas e que lojistas gerenciem seus agendamentos, profissionais e serviços.

## 2. Público Alvo
*   **Administradores da Plataforma:** Responsáveis por gerenciar as lojas cadastradas, planos de assinatura e monitorar o desempenho global.
*   **Lojistas (Proprietários):** Donos de estabelecimentos que utilizam a plataforma para gerenciar seus negócios.
*   **Profissionais:** Funcionários das lojas que prestam serviços.
*   **Clientes Finais:** Usuários que agendam serviços nas lojas.

## 3. Funcionalidades Principais

### 3.1. Painel Administrativo (Dashboard)
*   **Visão Geral:** Exibição de métricas chave (KPIs) como Total de Lojas, Faturamento, Agendamentos e Novos Clientes.
*   **Gráficos:**
    *   Evolução de Faturamento e Agendamentos (Gráfico de Área).
    *   Distribuição de Planos (Gráfico de Pizza).
*   **Filtros:** Visualização por períodos (7 dias, 30 dias, Anual).

### 3.2. Gestão de Lojas (Stores)
*   **Listagem:** Visualização de todas as lojas cadastradas com busca e filtros (Status, Plano).
*   **Cadastro/Edição:** Adicionar e editar informações da loja (Nome, Email, Plano, Status).
*   **Status:** Controle de status da loja (Ativa, Bloqueada, Pendente).
*   **Persistência:** Atualmente utiliza `localStorage` para persistir dados no frontend.

### 3.3. Gestão de Planos
*   **Níveis:** Básico, Profissional, Enterprise.
*   **Recursos:** Definição de limites (profissionais, agendamentos) e funcionalidades (pagamentos online, integração com calendário).

### 3.4. Agendamento e Serviços (Inferido)
*   **Agendamentos:** Confirmação, cancelamento e visualização de horários.
*   **Serviços:** Cadastro de serviços com preço e duração.
*   **Profissionais:** Gestão de equipe e horários de trabalho.

### 3.5. Suporte e Logs
*   **Logs:** Registro de erros e atividades do sistema.
*   **Suporte:** Canal de comunicação entre lojistas e administração.

## 4. Stack Tecnológica
*   **Frontend:** React (Vite), TypeScript.
*   **Estilização:** Tailwind CSS.
*   **Componentes UI:** Lucide React (ícones), Recharts (gráficos).
*   **Backend/Infraestrutura:** Supabase (Autenticação, Banco de Dados - PostgreSQL).
*   **Roteamento:** React Router.

## 5. Status Atual do Projeto
*   **Integração Supabase:** Projeto criado (`tuxypcfryphcqtuqewbo`), mas o frontend ainda utiliza dados mockados e `localStorage` em diversas partes (ex: Dashboard, Stores).
*   **Interface:** UI moderna e responsiva implementada.
*   **Funcionalidades:**
    *   Dashboard: Visualização implementada com dados mockados.
    *   Lojas: CRUD completo funcionando com `localStorage`.
    *   Outras páginas (Plans, Reports, Settings): Estrutura de arquivos existe.

## 6. Próximos Passos (Roadmap Sugerido)
1.  **Migração para Supabase:** Substituir `localStorage` e dados mockados por chamadas reais à API do Supabase.
2.  **Autenticação:** Implementar fluxo de login real.
3.  **Integração de Agendamentos:** Conectar a lógica de agendamento com o banco de dados.
