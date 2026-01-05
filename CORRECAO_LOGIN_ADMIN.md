# Correção do Problema de Login do Admin

## Problema Identificado

Após as últimas alterações na gestão de funcionários, o login do admin está falhando com a mensagem "Erro ao fazer login. Verifique suas credenciais."

## Causa Raiz

O problema ocorre porque:

1. **Mudanças na estrutura de dados**: As alterações recentes na gestão de funcionários modificaram como os usuários são armazenados e consultados na tabela `users`.

2. **Dessincronia entre tabelas**: O usuário admin pode existir na tabela `auth.users` (autenticação do Supabase) mas não na tabela `public.users` (dados do perfil), ou o campo `role` pode estar incorreto.

3. **Falta de tratamento de erro**: O código de login não estava tratando adequadamente o caso onde o perfil do usuário não existe na tabela `users`.

## Soluções Implementadas

### 1. Correção no Backend (auth.routes.ts)

✅ **Já aplicado automaticamente**

Melhorei o código de autenticação para:
- Detectar quando um usuário existe no auth mas não na tabela `users`
- Criar automaticamente o registro faltante com as permissões corretas
- Adicionar logs para facilitar o debug
- Tratar erros de forma mais robusta

### 2. Script SQL para Sincronização Manual

Criei o arquivo `backend/fix-admin-sync.sql` que você pode executar no SQL Editor do Supabase para:
- Verificar o estado atual do admin
- Sincronizar o admin entre as tabelas `auth.users` e `public.users`
- Garantir que o role e permissões estejam corretos

## Como Resolver

### Opção 1: Reiniciar o Backend (Recomendado)

1. Pare o backend se estiver rodando
2. Inicie novamente o backend
3. Tente fazer login com:
   - **Email**: `admin@staragendado.com`
   - **Senha**: `Admin@123`

O código agora criará automaticamente o perfil do admin na tabela `users` se ele não existir.

### Opção 2: Executar o Script SQL Manualmente

Se a Opção 1 não funcionar:

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Abra o arquivo `backend/fix-admin-sync.sql`
4. Copie todo o conteúdo
5. Cole no SQL Editor
6. Clique em **Run**
7. Verifique os resultados
8. Tente fazer login novamente

## Credenciais do Admin

- **Email**: `admin@staragendado.com`
- **Senha**: `Admin@123`

## Verificação

Após aplicar a solução, você deve conseguir:
1. Fazer login com as credenciais do admin
2. Acessar o dashboard administrativo
3. Ver todas as funcionalidades disponíveis

## Prevenção Futura

A correção no código garante que:
- Novos usuários criados no auth terão automaticamente um perfil na tabela `users`
- Usuários existentes sem perfil terão o perfil criado automaticamente no primeiro login
- Logs detalhados facilitarão o debug de problemas futuros

## Próximos Passos

1. Reinicie o backend
2. Teste o login do admin
3. Se ainda houver problemas, execute o script SQL
4. Verifique os logs do backend para mais detalhes
