# 🔧 Correção: Lojas não aparecem no Painel Admin

## 📋 Diagnóstico do Problema

O erro ocorre porque a tabela `lojas` no banco de dados **não possui a coluna `plano_id`** que o código espera. O schema atual da tabela está incompleto.

## ✅ Solução

Execute o script SQL `FIX_LOJAS_SCHEMA.sql` no Supabase Dashboard para corrigir o schema.

### Passo a Passo:

#### 1. Acesse o Supabase Dashboard
- URL: https://supabase.com/dashboard/project/tuxypcfryphcqtuqewbo
- Vá em **SQL Editor**

#### 2. Execute o Script de Correção
- Abra o arquivo `backend/FIX_LOJAS_SCHEMA.sql`
- Copie todo o conteúdo
- Cole no SQL Editor do Supabase
- Clique em **Run** ou pressione `Ctrl+Enter`

#### 3. Verifique a Correção
O script irá:
- ✅ Criar a tabela `planos` com 3 planos padrão (Básico, Profissional, Enterprise)
- ✅ Adicionar a coluna `plano_id` na tabela `lojas`
- ✅ Configurar as políticas de segurança (RLS)
- ✅ Mostrar a estrutura atualizada da tabela

#### 4. Criar Lojas de Exemplo (Opcional)
Após corrigir o schema, você pode executar o script `backend/init-data.sql` para criar lojas de exemplo.

#### 5. Recarregue a Página
- Volte para o painel admin: http://localhost:5173
- Pressione `Ctrl+Shift+R` para forçar o reload
- As lojas devem aparecer agora!

## 🔍 Verificação

Após executar o script, você deve ver:
1. Mensagem de sucesso no SQL Editor
2. Tabela com as colunas da tabela `lojas` (incluindo `plano_id`)
3. Lista dos 3 planos criados

## ⚠️ Se o Erro Persistir

1. Abra o Console do Navegador (F12)
2. Vá na aba **Console**
3. Procure por erros em vermelho
4. Copie a mensagem de erro e me envie

## 📝 Notas Técnicas

**Causa Raiz:** O schema inicial (`database_setup_complete.sql`) não incluía a tabela `planos` nem a coluna `plano_id` na tabela `lojas`, mas o código frontend e backend foram desenvolvidos esperando essa estrutura.

**Arquivos Afetados:**
- `backend/src/routes/stores.routes.ts` - Espera `plano_id` nas queries
- `pages/Stores.tsx` - Exibe e filtra por plano
- `services/stores.service.ts` - Interface TypeScript com `plano_id`
