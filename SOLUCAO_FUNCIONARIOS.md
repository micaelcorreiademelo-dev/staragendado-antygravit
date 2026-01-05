# 🔧 Solução: Funcionários Não Aparecem no Painel

## 📋 Problema Identificado

Os funcionários estão sendo criados com sucesso (status 201), mas não aparecem na listagem do painel. A rota GET `/employees` está retornando erro 500.

## 🔍 Causas Identificadas

### 1. **Frontend não estava enviando o campo `role`**
   - ✅ **CORRIGIDO**: Adicionado `role: 'admin'` no payload de criação

### 2. **Possível erro na query do Supabase**
   - A query está filtrando por `role IN ('admin', 'funcionario')`
   - Pode haver um problema com a estrutura da tabela ou permissões

## ✅ Correções Aplicadas

### 1. Frontend (Employees.tsx)
```typescript
const payload = { 
    ...formData,
    role: 'admin' as const // Garantir que o role seja enviado
};
```

### 2. Backend (employees.routes.ts)
- ✅ Adicionados logs detalhados na criação de funcionários
- ✅ Adicionados logs detalhados na listagem de funcionários
- ✅ Melhor tratamento de erros

## 🎯 Próximos Passos

### PASSO 1: Verificar Funcionários Existentes no Banco

Execute o script SQL `backend/debug-employees.sql` no Supabase SQL Editor para:
1. Ver todos os usuários
2. Identificar quais têm role correto
3. Encontrar usuários com role NULL ou incorreto

### PASSO 2: Testar Criação de Novo Funcionário

1. Recarregue a página do painel (http://localhost:5173/employees)
2. Clique em **"Novo Funcionário"**
3. Preencha os dados:
   - Nome: Teste Funcionário
   - Email: teste@funcionario.com
   - Senha: 123456
   - Marque algumas permissões
4. Clique em **"Salvar Funcionário"**
5. **Verifique os logs do backend** no terminal

### PASSO 3: Verificar os Logs

No terminal onde o backend está rodando, você verá logs como:

```
➕ POST /employees - Criando novo funcionário...
  - Nome: Teste Funcionário
  - Email: teste@funcionario.com
  - Role: admin
  - Permissões: [...]
✅ Usuário criado no Auth com ID: xxx-xxx-xxx
✅ Perfil criado no DB com sucesso
🎉 Funcionário criado com sucesso! ID: xxx-xxx-xxx

📋 GET /employees - Buscando funcionários...
📊 Resultado da query:
  - Total encontrado: X
  - Erro: nenhum
  - Funcionários: [...]
```

### PASSO 4: Se Ainda Houver Erro 500

Execute este SQL no Supabase para verificar a estrutura da tabela:

```sql
-- Verificar estrutura da tabela users
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar se há índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'users' AND schemaname = 'public';
```

### PASSO 5: Corrigir Funcionários Antigos (Se Necessário)

Se houver funcionários criados anteriormente sem o campo `role`, execute:

```sql
-- Atualizar funcionários sem role
UPDATE public.users 
SET role = 'admin'
WHERE role IS NULL 
  AND id IN (
    SELECT id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'admin'
  );
```

## 🐛 Debug em Tempo Real

Os logs agora mostrarão:
- ✅ Quando um funcionário é criado
- ✅ Qual role foi atribuído
- ✅ Quantos funcionários foram encontrados na listagem
- ✅ Quais são os funcionários (ID, email, role)
- ❌ Erros detalhados se houver

## 📝 Arquivos Modificados

1. **pages/Employees.tsx** - Adicionado campo `role` no payload
2. **backend/src/routes/employees.routes.ts** - Adicionados logs de debug
3. **backend/debug-employees.sql** - Script de diagnóstico

## 🎉 Resultado Esperado

Após as correções:
1. Novos funcionários criados terão `role = 'admin'`
2. Aparecerão na listagem imediatamente
3. Logs detalhados facilitarão o debug

## ⚠️ Se o Problema Persistir

1. Copie os logs do backend (especialmente os erros)
2. Execute o script `debug-employees.sql` e copie os resultados
3. Me envie essas informações para análise mais profunda

---

**Status**: Correções aplicadas ✅ | Aguardando teste 🧪
