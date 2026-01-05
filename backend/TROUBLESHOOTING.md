# Guia de Troubleshooting - Login

## Checklist de Verificação

### 1. Backend está rodando?
```bash
cd backend
npm run dev
```
- Deve mostrar: "Server listening on port 3000"
- Acesse: http://localhost:3000/docs (deve abrir o Swagger)

### 2. Usuário foi criado no Supabase?
Execute no SQL Editor do Supabase:
```sql
-- Verificar usuário no Auth
SELECT id, email, email_confirmed_at FROM auth.users 
WHERE email = 'admin@staragendado.com';

-- Verificar usuário na tabela users
SELECT id, email, role FROM users 
WHERE email = 'admin@staragendado.com';
```

**Resultado esperado:**
- Deve retornar 1 linha em cada query
- Os IDs devem ser iguais
- `email_confirmed_at` não deve ser NULL

### 3. Frontend está conectando ao backend?
Abra o Console do navegador (F12) e tente fazer login. Procure por:
- Erro de CORS
- Erro 404 (endpoint não encontrado)
- Erro 401 (credenciais inválidas)
- Erro de conexão

### 4. Teste direto no Swagger
1. Acesse: http://localhost:3000/docs
2. Expanda `POST /auth/login`
3. Clique em "Try it out"
4. Cole:
```json
{
  "email": "admin@staragendado.com",
  "password": "Admin@123"
}
```
5. Clique em "Execute"

**Resultado esperado:** Status 200 com token

## Problemas Comuns

### Erro: "Invalid login credentials"
- **Causa:** Senha incorreta ou usuário não confirmado
- **Solução:** Confirme o email no Supabase Dashboard (Authentication > Users > clique no usuário > Confirm email)

### Erro: "Network Error" ou "Failed to fetch"
- **Causa:** Backend não está rodando ou CORS
- **Solução:** Verifique se o backend está rodando na porta 3000

### Erro: "User not found"
- **Causa:** Usuário não foi vinculado à tabela `users`
- **Solução:** Execute o INSERT na tabela users com o UUID correto

### Erro: "Cannot read property 'access_token'"
- **Causa:** Resposta do backend diferente do esperado
- **Solução:** Verifique a estrutura da resposta no backend
