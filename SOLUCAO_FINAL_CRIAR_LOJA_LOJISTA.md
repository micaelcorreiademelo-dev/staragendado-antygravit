# ✅ Solução Final v2: Criar Lojista + Loja + Telefone

## 🎯 **Atualizações Realizadas**
- ✅ **Email Unificado:** Email da loja é o mesmo do lojista (login).
- ✅ **Telefone/WhatsApp:** Novo campo com formatação automática `(XX) XXXXX-XXXX`.
- ✅ **UI/UX Melhorada:** Modal maior (`max-w-2xl`), com scroll e centralizado.
- ✅ **Robustez:** Backend aceita telefone e o salva nos metadados do usuário.

---

## 📋 **Novo Formulário (Atualizado)**

```
┌──────────────────────────────────────────────┐
│  Adicionar Nova Loja                    [X]  │
├──────────────────────────────────────────────┤
│  Nome da Loja                                │
│  [ Barbearia Top                         ]   │
│                                              │
│  ──────── Dados do Lojista ─────────         │
│                                              │
│  Nome Completo do Lojista                    │
│  [ João Silva                            ]   │
│                                              │
│  E-mail do Lojista (Login e Contato)         │
│  [ joao@barbearia.com                    ]   │
│  Este email será usado para login e contato  │
│                                              │
│  Telefone / WhatsApp                         │
│  [ (11) 99999-9999                       ]   │
│  Número do WhatsApp para contato             │
│                                              │
│  Senha de Acesso                             │
│  [ **********                            ]   │
│                                              │
│  Status                                      │
│  [▼ Ativa                                ]   │
│                                              │
│                        [Cancelar] [Salvar]   │
└──────────────────────────────────────────────┘
```

---

## 🛠️ **Instruções Importantes para o Banco de Dados**

Para que o telefone seja salvo corretamente na tabela de usuários (além do sistema de autenticação), é necessário adicionar a coluna `phone` na tabela `public.users`.

### **Script SQL Necessário**
Execute o seguinte script no **Supabase SQL Editor**:

```sql
-- Verificar e adicionar coluna phone
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'phone'
    ) THEN
        ALTER TABLE public.users ADD COLUMN phone TEXT;
    END IF;
END $$;
```

> **Nota:** O sistema funcionará mesmo sem rodar este script, mas o telefone ficará salvo apenas nos metadados do usuário (Auth), não na tabela de perfil (`public.users`). Para uma solução completa, execute o script acima.

---

## 🔄 **Fluxo de Criação (Backend)**

1. **Frontend:**
   - Formata telefone automaticamente: `(11) 9...`
   - Envia `lojista_telefone` no corpo da requisição.

2. **Backend (`stores.routes.ts`):**
   - Valida `lojista_telefone` (opcional).
   - Cria usuário no Supabase Auth com `phone` e `user_metadata.phone`.
   - Tenta criar perfil na tabela `users`.
   - **Observação:** A linha que salva `phone` na tabela `users` está comentada no código para evitar erros caso a coluna não exista. Após rodar o script SQL acima, você pode descomentar a linha 116 em `backend/src/routes/stores.routes.ts`.

---

## 🧪 **Como Testar**

1. Atualize a página do Painel Admin (F5).
2. Clique em "Adicionar Nova Loja".
3. Digite o telefone (apenas números) -> Veja a formatação automática.
4. Salve a loja.
5. Verifique se a loja e o lojista foram criados.

---

## 📁 **Arquivos Modificados**
- `backend/src/routes/stores.routes.ts` (Adicionado telefone ao schema)
- `pages/Stores.tsx` (Adicionado campo telefone com máscara e ajustes de layout)
- `services/stores.service.ts` (Atualizada interface de dados)
- `backend/ADD_PHONE_TO_USERS.sql` (Script para criar coluna)
