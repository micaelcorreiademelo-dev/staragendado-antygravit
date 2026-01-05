# ✅ Funcionalidade: Plano Inicial (Default)

O sistema agora suporta a definição de um **Plano Inicial Padrão**.

### Relatório de Mudanças

1.  **Banco de Dados**: Nova coluna `is_default` na tabela `planos` com índice único parcial (garante que apenas um seja true).
2.  **Painel Admin**:
    *   Botão **"Definir Padrão"** na página de Planos.
    *   Indicador visual **"Padrão"** (estrela roxa) no card do plano principal.
3.  **Backend**:
    *   Ao criar uma loja (via cadastro ou admin), se **nenhum plano for selecionado**, o sistema busca automaticamente o plano padrão.
    *   A data de expiração (`plan_expires_at`) é calculada automaticamente: `Data Atual + Vigência do Plano`.
    *   Ao alterar o plano de uma loja manualmente, o sistema recalcula a data de expiração com base na vigência do novo plano.

### ⚠️ Ação Necessária: Atualização do Banco de Dados

Para ativar essa funcionalidade, execute o script SQL abaixo no Supabase:

1.  Vá ao **Supabase Dashboard** > **SQL Editor**.
2.  Execute o seguinte comando:

```sql
-- Adicionar coluna 'is_default' para identificar o plano padrão
ALTER TABLE public.planos 
ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false;

-- Garantir que apenas um seja default (Unique constraint parcial)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes WHERE indexname = 'unique_default_plan'
    ) THEN
        CREATE UNIQUE INDEX unique_default_plan ON public.planos (is_default) WHERE is_default = true;
    END IF;
END $$;

NOTIFY pgrst, 'reload schema';
```

### Como Testar

1.  No Painel Admin, vá em **Planos**.
2.  Clique em **"Definir Padrão"** e selecione um plano.
3.  Verifique se o selo "Padrão" aparece no card.
4.  Tente criar uma nova loja (ou simular um cadastro) sem enviar `plano_id` no payload, ou via Admin sem selecionar plano.
5.  Verifique no banco de dados (`lojas`) se `plano_id` foi preenchido e se `plan_expires_at` está correto (Data de hoje + Dias de vigência).
