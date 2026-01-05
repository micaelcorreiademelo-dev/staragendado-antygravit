# ✅ Novas Funcionalidades: Planos Ocultos e Notificações

Foram adicionadas ao Painel Administrativo as opções solicitadas:
1.  **Ocultar do Lojista:** Permite criar planos que não aparecem na listagem pública.
2.  **Notificações WhatsApp:** Novo recurso tecnológico selecionável.
3.  **Notificações E-mail:** Novo recurso tecnológico selecionável.

## ⚠️ Ação Necessária: Atualização do Banco de Dados

Para a funcionalidade de "Ocultar" funcionar, você precisa atualizar a tabela de planos.

### 🚀 Execute este Script no Supabase

1. Copie o código abaixo (somente o conteúdo SQL):

```sql
ALTER TABLE public.planos 
ADD COLUMN IF NOT EXISTS hidden BOOLEAN DEFAULT false;

NOTIFY pgrst, 'reload schema';
```

2. Vá ao **Supabase Dashboard** > **SQL Editor**.
3. Cole e execute.

## 📝 Como testar

1. Vá em **Planos** > **Criar** ou **Editar**.
2. Marque a caixa "Ocultar do Lojista" para testar a visibilidade.
3. Marque "Notificações WhatsApp" e "E-mail" na seção de recursos.
4. Salve e verifique se o card do plano exibe o rótulo "Oculto" e os novos recursos na lista.
