# 🔧 SOLUÇÃO IMEDIATA - Corrigir Login do Admin

## ⚠️ Problema Confirmado

O teste de login confirmou que o usuário admin **não existe** ou está com **credenciais incorretas** no Supabase.

**Erro retornado**: `Invalid login credentials` (Status 401)

## ✅ Solução - Execute Estes Passos

### PASSO 1: Acesse o Supabase Dashboard

1. Abra seu navegador
2. Acesse: https://supabase.com/dashboard
3. Faça login na sua conta
4. Selecione o projeto **StarAgendado**

### PASSO 2: Abra o SQL Editor

1. No menu lateral esquerdo, clique em **SQL Editor**
2. Clique em **New Query** (ou pressione Ctrl+Enter)

### PASSO 3: Execute o Script de Correção

Copie e cole o seguinte SQL no editor:

```sql
-- ========================================
-- SCRIPT DE CORREÇÃO DO ADMIN
-- ========================================

-- PASSO 1: Verificar se o admin já existe
SELECT 'Verificando admin existente...' as status;

SELECT 
    'AUTH.USERS' as tabela, 
    id, 
    email, 
    raw_user_meta_data->>'role' as role_metadata
FROM auth.users 
WHERE email = 'admin@staragendado.com'
UNION ALL
SELECT 
    'PUBLIC.USERS' as tabela, 
    id::text, 
    email, 
    role
FROM public.users 
WHERE email = 'admin@staragendado.com';

-- PASSO 2: Limpar registros antigos (se existirem)
DELETE FROM public.users WHERE email = 'admin@staragendado.com';
-- Nota: O registro em auth.users será recriado manualmente

-- PASSO 3: Agora você precisa criar o usuário manualmente
-- Vá para Authentication > Users > Add User
-- Use as credenciais:
--   Email: admin@staragendado.com
--   Password: Admin@123
--   Auto Confirm User: SIM (marque esta opção)

-- PASSO 4: Após criar o usuário manualmente, execute este SQL
-- IMPORTANTE: Substitua 'UUID_DO_ADMIN' pelo UUID real que apareceu após criar o usuário

-- Primeiro, veja o UUID do admin recém-criado:
SELECT id, email FROM auth.users WHERE email = 'admin@staragendado.com';

-- Depois, execute este INSERT substituindo o UUID:
-- INSERT INTO public.users (id, email, full_name, role, permissions)
-- VALUES (
--     'COLE_O_UUID_AQUI',  -- Substitua pelo UUID real
--     'admin@staragendado.com',
--     'Administrador',
--     'admin',
--     '{"dashboard": true, \"users\": true, \"stores\": true, \"services\": true, \"appointments\": true, \"employees\": true}'::jsonb
-- );

-- PASSO 5: Verificar se tudo está correto
SELECT 
    'Verificação Final' as status,
    au.id,
    au.email,
    au.raw_user_meta_data->>'role' as auth_role,
    pu.role as db_role,
    pu.full_name,
    pu.permissions
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE au.email = 'admin@staragendado.com';
```

### PASSO 4: Criar o Usuário Admin Manualmente

Como o Supabase não permite criar usuários com senha via SQL diretamente, você precisa:

1. No Supabase Dashboard, vá em **Authentication** > **Users**
2. Clique em **Add User** (botão verde no canto superior direito)
3. Preencha:
   - **Email**: `admin@staragendado.com`
   - **Password**: `Admin@123`
   - **Auto Confirm User**: ✅ **MARQUE ESTA OPÇÃO** (muito importante!)
4. Clique em **Create User**
5. **Copie o UUID** que aparece na lista de usuários (algo como: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`)

### PASSO 5: Sincronizar com a Tabela Users

1. Volte ao **SQL Editor**
2. Execute este SQL (substituindo `COLE_O_UUID_AQUI` pelo UUID que você copiou):

```sql
INSERT INTO public.users (id, email, full_name, role, permissions)
VALUES (
    'COLE_O_UUID_AQUI',  -- ⚠️ SUBSTITUA PELO UUID REAL
    'admin@staragendado.com',
    'Administrador',
    'admin',
    '{"dashboard": true, \"users\": true, \"stores\": true, \"services\": true, \"appointments\": true, \"employees\": true}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    permissions = EXCLUDED.permissions;
```

### PASSO 6: Testar o Login

1. Abra o navegador em: http://localhost:5173/login
2. Use as credenciais:
   - **Email**: `admin@staragendado.com`
   - **Senha**: `Admin@123`
3. Clique em **Entrar**

## 🎉 Resultado Esperado

Você deve conseguir fazer login e ser redirecionado para o dashboard administrativo.

## ❓ Se Ainda Não Funcionar

Execute este comando no terminal para testar novamente:

```bash
node test-admin-login.cjs
```

Se ainda houver erro, me avise e vou investigar mais a fundo!

## 📝 Credenciais do Admin

- **Email**: `admin@staragendado.com`
- **Senha**: `Admin@123`

---

**Nota**: A correção no código do backend (auth.routes.ts) já foi aplicada e criará automaticamente o perfil na tabela `users` para novos logins, mas como o admin ainda não existe, precisamos criá-lo manualmente primeiro.
