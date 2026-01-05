# 📘 Guia Detalhado de Configuração e Login

Este guia foi feito para resolver o problema de login passo a passo. Por favor, siga cada etapa exatamente como descrito.

---

## 🛑 PARTE 1: Limpeza (Garantir que começamos do zero)

Vamos garantir que não há dados conflitantes.

1. Acesse o **Supabase Dashboard**: https://supabase.com/dashboard/project/tuxypcfryphcqtuqewbo
2. Vá no menu lateral esquerdo em **SQL Editor**.
3. Clique em **New Query**.
4. Cole e execute este comando para limpar o usuário admin (se existir):

```sql
DELETE FROM users WHERE email = 'admin@staragendado.com';
```

5. Vá no menu lateral em **Authentication** > **Users**.
6. Se você ver `admin@staragendado.com` na lista, clique nos três pontinhos (...) ao lado dele e escolha **Delete User**.

---

## 🛠️ PARTE 2: Criar o Usuário Corretamente

### Passo 2.1: Criar no Painel de Autenticação
1. Ainda em **Authentication** > **Users**, clique no botão verde **Add User** (canto superior direito).
2. Escolha **Create new user**.
3. Preencha exatamente assim:
   - **Email:** `admin@staragendado.com`
   - **Password:** `Admin@123`
   - **Auto Confirm User:** ✅ (CERTIFIQUE-SE DE QUE ESTÁ MARCADO)
4. Clique em **Create user**.

### Passo 2.2: Pegar o ID do Usuário (O Passo Crítico!)
1. Agora você verá o usuário na lista.
2. Na coluna **User UID**, você verá um código longo (ex: `a1b2c3d4-e5f6...`).
3. Clique no ícone de **Copiar** ao lado desse código.
   - *Se não conseguir copiar, anote os primeiros 4 caracteres para identificar depois.*

### Passo 2.3: Vincular ao Banco de Dados
1. Volte ao **SQL Editor**.
2. Apague qualquer código que estiver lá.
3. Cole o código abaixo, **MAS NÃO EXECUTE AINDA**:

```sql
INSERT INTO users (id, full_name, email, role, loja_id)
VALUES ('COLE_O_UUID_AQUI', 'Administrador', 'admin@staragendado.com', 'admin', NULL);
```

4. Apague o texto `COLE_O_UUID_AQUI` (mantenha as aspas simples `' '`) e cole o código que você copiou no Passo 2.2.
   - Deve ficar algo como: `VALUES ('a1b2c3d4-e5f6-4789...', ...`
5. Agora sim, clique em **Run** (ou Ctrl+Enter).
   - Deve aparecer: `Success. No rows returned` ou `INSERT 0 1`.

---

## 💻 PARTE 3: Rodar o Sistema

### Passo 3.1: Backend
1. Abra um terminal (Prompt de Comando ou PowerShell).
2. Entre na pasta do backend:
   ```bash
   cd "c:\Users\Samsung\Downloads\staragendado Antygravit\backend"
   ```
3. Inicie o servidor:
   ```bash
   npm run dev
   ```
4. **AGUARDE** até aparecer: `Server listening on port 3000`.
   - *Não feche essa janela.*

### Passo 3.2: Frontend
1. Abra **OUTRO** terminal.
2. Entre na pasta do projeto principal:
   ```bash
   cd "c:\Users\Samsung\Downloads\staragendado Antygravit"
   ```
3. Inicie o site:
   ```bash
   npm run dev
   ```
4. Aguarde aparecer o link (geralmente `http://localhost:5173`).

---

## 🚀 PARTE 4: Fazer Login

1. Abra seu navegador (Chrome, Edge, etc).
2. Acesse: http://localhost:5173
3. Você deve ver a tela de login preta/azul.
4. Digite:
   - **Email:** `admin@staragendado.com`
   - **Senha:** `Admin@123`
5. Clique em **Entrar**.

---

## ❓ Ainda com problemas?

Se der erro, olhe para o terminal onde o **Backend** está rodando.
- Se aparecer algum erro lá, copie e me mande.
- Se não aparecer nada lá, o frontend não está conseguindo chegar no backend.

**Teste Final de Conexão:**
Se ainda não funcionar, abra outro terminal e rode:
```bash
cd "c:\Users\Samsung\Downloads\staragendado Antygravit"
node test-login.js
```
Isso vai me dizer exatamente onde está o erro sem precisar do navegador.
