# 🚨 Correção Obrigatória: Erro "User not allowed"

O erro `User not allowed` ocorre porque o Backend está usando a chave pública (`ANON_KEY`) para tentar criar usuários administrativos, o que não é permitido por segurança.

Para corrigir isso, você precisa adicionar a **Service Role Key** (Chave secreta de serviço) no arquivo `.env` do backend.

---

## 🛠️ Passo 1: Obter a Chave no Supabase

1. Acesse o painel do seu projeto no [Supabase Dashboard](https://supabase.com/dashboard).
2. Vá em **Settings** (ícone de engrenagem) > **API**.
3. Na seção `Project API keys`, encontre a chave chamada `service_role` (secret).
4. Clique em `Reveal` e copie a chave (ela começa com `eyJ...`).

---

## 🛠️ Passo 2: Atualizar o arquivo .env

1. Abra o arquivo `backend/.env`.
2. Adicione uma nova linha com a chave copiada:

```env
SUPABASE_SERVICE_ROLE_KEY=sua_chave_service_role_aqui
```

**Exemplo do arquivo final:**
```env
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (A chave secreta que você copiou)
```

3. Salve o arquivo.

---

## 🛠️ Passo 3: Reiniciar o Backend

Após salvar o arquivo `.env`, o backend deve reiniciar automaticamente. Se não reiniciar:

1. Pare o terminal do backend (`Ctrl + C`).
2. Execute novamente: `npm run dev`.

---

## ✅ Teste Novamente

Tente criar a loja novamente no painel admin. O erro deve desaparecer.
