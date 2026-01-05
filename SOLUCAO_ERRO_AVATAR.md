# ✅ CORREÇÃO: Erro ao Criar Profissional (Avatar Missing)

## 🔍 O Problema
Ao tentar criar um novo profissional no painel do lojista, você recebeu o erro:
> `Could not find the 'avatar' column of 'profissionais' in the schema cache`

Isso acontece porque o banco de dados está desatualizado em relação ao código. O sistema tenta salvar o campo `avatar` (foto do profissional), mas a tabela `profissionais` no banco de dados ainda não tem essa coluna.

## ✅ A Solução
Criei um script SQL que adiciona a coluna `avatar` (e outras importantes como `phone` e `disponibilidade`) automaticamente à sua tabela, sem perder dados.

## 🚀 Como Aplicar a Correção

1. Acesse o **Supabase Dashboard**.
2. Vá para a seção **SQL Editor** (ícone de terminal/código no menu lateral).
3. Clique em **New Query**.
4. Copie **todo o conteúdo** do arquivo abaixo:

   `backend/FIX_PROFISSIONAIS_SCHEMA.sql`

   *(O conteúdo está logo abaixo para facilitar)*

5. Cole no editor e clique em **RUN**.

### Script SQL para Copiar:

```sql
-- 1. Adicionar coluna 'avatar'
ALTER TABLE public.profissionais ADD COLUMN IF NOT EXISTS avatar TEXT;

-- 2. Adicionar coluna 'phone'
ALTER TABLE public.profissionais ADD COLUMN IF NOT EXISTS phone TEXT;

-- 3. Adicionar coluna 'disponibilidade'
ALTER TABLE public.profissionais ADD COLUMN IF NOT EXISTS disponibilidade JSONB DEFAULT '{}'::jsonb;

-- 4. Adicionar coluna 'indisponibilidades'
ALTER TABLE public.profissionais ADD COLUMN IF NOT EXISTS indisponibilidades JSONB DEFAULT '[]'::jsonb;

-- 5. Recarregar Schema
NOTIFY pgrst, 'reload schema';
```

## 🧪 Teste
Após rodar o script e ver a mensagem "Success" no Supabase:
1. Volte ao painel do lojista.
2. Tente cadastrar o profissional novamente.
3. Deve funcionar perfeitamente!

---
**Status**: ✅ Script de correção criado | ⏳ Aguardando execução no Supabase
