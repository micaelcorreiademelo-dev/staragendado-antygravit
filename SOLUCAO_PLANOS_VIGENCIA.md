# ✅ NOVA FUNCIONALIDADE: Vigência de Planos

## 🎯 O que foi feito
Adicionei a opção de definir a vigência (em dias) para cada plano no Painel Administrativo.
Agora, ao criar ou editar um plano, você pode especificar quanto tempo ele dura (ex: 30 dias, 365 dias, etc).

## ⚠️ Passo Necessário: Atualizar Banco de Dados
Para que essa funcionalidade funcione, você precisa atualizar a tabela de planos no seu banco de dados.

### 🚀 Como Atualizar
1. Copie o script SQL abaixo:

```sql
ALTER TABLE public.planos 
ADD COLUMN IF NOT EXISTS vigencia_dias INTEGER DEFAULT 30;

NOTIFY pgrst, 'reload schema';
```

2. Vá ao **Supabase Dashboard** > **SQL Editor**.
3. Cole o código e clique em **RUN**.

## 📊 Como Usar
1. Acesse o menu **Planos** no Painel Admin.
2. Crie um novo plano ou edite um existente.
3. Você verá o campo **"Vigência (Dias)"** logo abaixo do preço.
4. O padrão é 30 dias, mas você pode alterar para qualquer valor.

Essa informação será útil futuramente para controlar a expiração automática de assinaturas! 🚀
