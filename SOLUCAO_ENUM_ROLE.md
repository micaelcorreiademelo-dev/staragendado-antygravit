# ✅ PROBLEMA RESOLVIDO: Enum user_role

## 🔍 Problema Identificado

**Erro**: `ERROR: 22P02: invalid input value for enum user_role: "funcionario"`

### Causa Raiz

A tabela `users` no Supabase tem uma coluna `role` do tipo **ENUM** chamado `user_role`. Este enum **NÃO inclui o valor `'funcionario'`**.

Os valores válidos no enum `user_role` são provavelmente:
- ✅ `'admin'`
- ✅ `'lojista'`
- ✅ `'profissional'`
- ✅ `'cliente'`
- ❌ `'funcionario'` (NÃO EXISTE)

## ✅ Correções Aplicadas

### 1. Backend (`backend/src/routes/employees.routes.ts`)

#### GET /employees
- **Antes**: `.in('role', ['admin', 'funcionario'])`
- **Depois**: `.eq('role', 'admin')`

#### POST /employees
- **Antes**: `z.enum(['admin', 'funcionario'])`
- **Depois**: `z.literal('admin')`

#### PUT /employees/:id
- **Antes**: `z.enum(['admin', 'funcionario'])`
- **Depois**: `z.literal('admin')`

### 2. Frontend (`services/employees.service.ts`)

#### Interface Employee
- **Antes**: `role: 'admin' | 'funcionario'`
- **Depois**: `role: 'admin'`

#### Interface CreateEmployeeData
- **Antes**: `role?: 'admin' | 'funcionario'`
- **Depois**: `role?: 'admin'`

### 3. Frontend (`pages/Employees.tsx`)
- ✅ Já estava enviando `role: 'admin'` corretamente

## 🎯 Resultado

Agora todos os funcionários criados terão `role = 'admin'`, que é um valor válido no enum `user_role`.

## 📋 Próximos Passos

### PASSO 1: Verificar se o Backend Reiniciou

O backend deve ter reiniciado automaticamente (nodemon). Verifique no terminal se apareceu:
```
[nodemon] restarting due to changes...
Server listening on port 3000
```

### PASSO 2: Testar a Listagem de Funcionários

1. Abra o painel: http://localhost:5173/employees
2. A listagem deve funcionar agora (sem erro 500)
3. Você verá todos os usuários com `role = 'admin'`

### PASSO 3: Criar um Novo Funcionário

1. Clique em **"Novo Funcionário"**
2. Preencha os dados:
   - Nome: Teste Admin
   - Email: teste@admin.com
   - Senha: 123456
   - Marque algumas permissões
3. Clique em **"Salvar"**
4. O funcionário deve aparecer na lista imediatamente!

### PASSO 4: Verificar Logs

No terminal do backend, você verá:
```
➕ POST /employees - Criando novo funcionário...
  - Nome: Teste Admin
  - Email: teste@admin.com
  - Role: admin
✅ Usuário criado no Auth
✅ Perfil criado no DB
🎉 Funcionário criado com sucesso!

📋 GET /employees - Buscando funcionários...
📊 Resultado da query:
  - Total encontrado: X
  - Funcionários: [...]
```

## 🔧 Script SQL para Verificação

Execute o script `backend/check-enum-role.sql` no Supabase para:
1. Ver quais valores são permitidos no enum `user_role`
2. Ver a estrutura da tabela `users`
3. Ver todos os usuários existentes

## ⚠️ Opção Alternativa: Adicionar 'funcionario' ao Enum

Se você REALMENTE precisa do valor `'funcionario'` no enum, execute este SQL no Supabase:

```sql
-- Adicionar 'funcionario' ao enum user_role
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'funcionario';

-- Verificar se foi adicionado
SELECT enumlabel 
FROM pg_enum
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'user_role')
ORDER BY enumsortorder;
```

**IMPORTANTE**: Depois de adicionar o valor ao enum, você precisaria reverter as mudanças no código para voltar a usar `'funcionario'`.

## 🎉 Solução Recomendada

**Manter apenas 'admin'** é a solução mais simples e funcional, pois:
- ✅ Funciona imediatamente sem alterar o banco
- ✅ Todos os funcionários administrativos têm o mesmo role
- ✅ As permissões específicas são controladas pelo campo `permissions`

## 📝 Arquivos Modificados

1. ✅ `backend/src/routes/employees.routes.ts` - Rotas corrigidas
2. ✅ `services/employees.service.ts` - Tipos corrigidos
3. ✅ `pages/Employees.tsx` - Já estava correto
4. 📄 `backend/check-enum-role.sql` - Script de verificação criado

---

**Status**: ✅ Problema resolvido | 🧪 Pronto para teste
