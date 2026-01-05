# Configuração do Backend StarAgendado (Supabase)

Devido a restrições de segurança na conexão direta via ferramenta, o script de configuração completa do banco de dados foi gerado localmente.

## Passos para Instalação

1.  Acesse o Painel do Seu Projeto Supabase (`tuxypcfryphcqtuqewbo`).
2.  Vá para a seção **SQL Editor**.
3.  Crie uma nova Query.
4.  Copie todo o conteúdo do arquivo localizado em:
    `backend/database_setup_complete.sql`
5.  Cole no editor e clique em **Run**.

## O que isso fará?

*   Criação das tabelas `users`, `lojas`, `profissionais`, `agendamentos`, etc.
*   Configuração das extensões de segurança (`pgcrypto`).
*   Configuração de tipos (Enums) para Status e Roles.
*   Aplicação das Políticas de Segurança (RLS) para proteger os dados.
*   Criação da função exclusiva `login_profissional` para autenticação segura.

## Notas Importantes

*   **Autenticação Profissional**: O sistema usa um fluxo híbrido. O Login do Profissional deve chamar a função RPC `login_profissional`.
*   **Dados Iniciais**: O script prepara a estrutura. Você precisará criar uma loja inicial e um usuário Admin na tabela `auth.users` e vincular à tabela `public.users` manualmente ou via fluxo de cadastro.
