# 🚀 Guia Rápido - StarAgendado

## Passo 1: Criar Dados Iniciais no Supabase

1. Acesse: https://supabase.com/dashboard/project/tuxypcfryphcqtuqewbo
2. Vá em **SQL Editor**
3. Execute o script `backend/init-data.sql`

## Passo 2: Criar Usuário Admin

### Via Dashboard (RECOMENDADO)
1. Vá em **Authentication** → **Users**
2. Clique em **Add User** → **Create new user**
3. Preencha:
   - Email: `admin@staragendado.com`
   - Password: `Admin@123`
   - ✅ Marque "Auto Confirm User"
4. Clique em **Create user**
5. Copie o **UUID** do usuário

### Vincular à Tabela Users
No **SQL Editor**, execute (substitua o UUID):

```sql
INSERT INTO users (id, full_name, email, role, loja_id)
VALUES ('UUID_COPIADO_AQUI', 'Administrador', 'admin@staragendado.com', 'admin', NULL);
```

## Passo 3: Iniciar o Backend

```bash
cd backend
npm run dev
```

Deve mostrar: `Server listening on port 3000`

## Passo 4: Testar o Login (Opcional)

```bash
node test-login.js
```

## Passo 5: Iniciar o Frontend

Em outro terminal:

```bash
npm run dev
```

## Passo 6: Fazer Login

1. Acesse: http://localhost:5173
2. Faça login com:
   - **Email:** admin@staragendado.com
   - **Senha:** Admin@123

---

## ⚠️ Problemas Comuns

### "Invalid login credentials"
- Verifique se marcou "Auto Confirm User" ao criar o usuário
- Ou confirme manualmente: Authentication > Users > clique no usuário > Confirm email

### "Network Error"
- Backend não está rodando
- Execute: `cd backend && npm run dev`

### "User not found"
- Não executou o INSERT na tabela users
- Execute o comando do Passo 2

### Console do navegador mostra erro
- Pressione F12 e veja a aba Console
- Procure por erros em vermelho
- Copie e me envie a mensagem de erro

---

## 📝 Credenciais

**Email:** admin@staragendado.com  
**Senha:** Admin@123
