import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { supabase } from '../config/supabase';

export async function storesRoutes(app: FastifyInstance) {
    const server = app.withTypeProvider<ZodTypeProvider>();

    // GET all stores
    server.get('/lojas', {
        schema: {
            tags: ['Stores'],
            querystring: z.object({
                status: z.enum(['ativa', 'bloqueada', 'pendente']).optional(),
                plano_id: z.string().optional(),
                lojista_id: z.string().optional(),
            }),
            response: {
                200: z.array(z.object({
                    id: z.string(),
                    nome: z.string(),
                    email: z.string(),
                    status: z.string(),
                    plano_id: z.string().nullable(),
                    created_at: z.string(),
                    plan_expires_at: z.string().nullable().optional(),
                    segmento_id: z.string().nullable().optional(),
                })),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { status, plano_id, lojista_id } = request.query;
        let query = supabase.from('lojas').select('*');

        if (status) query = query.eq('status', status);
        if (plano_id) query = query.eq('plano_id', plano_id);
        if (lojista_id) query = query.eq('lojista_id', lojista_id);

        const { data, error } = await query;
        if (error) return reply.status(500).send({ error: error.message });
        return reply.send(data);
    });

    // GET store by ID
    server.get('/lojas/:id', {
        schema: {
            tags: ['Stores'],
            params: z.object({ id: z.string() }),
            response: {
                200: z.object({
                    id: z.string(),
                    nome: z.string(),
                    email: z.string(),
                    status: z.string(),
                    plano_id: z.string().nullable().optional(),
                    created_at: z.string(),
                    plan_expires_at: z.string().nullable().optional(),
                    segmento_id: z.string().nullable().optional(),
                    lojista_nome: z.string().optional().nullable(),
                    lojista_telefone: z.string().optional().nullable(),
                }),
                404: z.object({ error: z.string() }),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params;

        // 1. Buscar dados da loja
        const { data: store, error: storeError } = await supabase
            .from('lojas')
            .select('*')
            .eq('id', id)
            .single();

        if (storeError) {
            return reply.status(500).send({ error: storeError.message });
        }
        if (!store) {
            return reply.status(404).send({ error: 'Loja não encontrada' });
        }

        // 2. Buscar dados do lojista (se existir)
        let lojistaInfo = {};
        if (store.lojista_id) {
            const { data: userData } = await supabase
                .from('users') // Tabela de perfis públicos
                .select('full_name, phone')
                .eq('id', store.lojista_id)
                .single();

            if (userData) {
                lojistaInfo = {
                    lojista_nome: userData.full_name,
                    lojista_telefone: userData.phone
                };
            }
        }

        return reply.send({ ...store, ...lojistaInfo });
    });

    // POST - Create store WITH lojista (new approach)
    server.post('/lojas', {
        schema: {
            tags: ['Stores'],
            body: z.object({
                // Store data
                nome: z.string(),
                email: z.string().email(),
                plano_id: z.string().optional(),
                status: z.enum(['ativa', 'bloqueada', 'pendente']).optional(),
                // Lojista data
                lojista_nome: z.string(),
                lojista_email: z.string().email(),
                lojista_telefone: z.string().optional(),
                lojista_senha: z.string().min(6),
                segmento_id: z.string().optional().nullable(),
            }),
            response: {
                201: z.object({
                    id: z.string(),
                    lojista_id: z.string(),
                    message: z.string()
                }),
                400: z.object({ error: z.string() }),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { nome, email, plano_id, status, lojista_nome, lojista_email, lojista_telefone, lojista_senha, segmento_id } = request.body;


        try {
            // Formatar telefone para E.164 (se fornecido)
            let formattedPhone: string | undefined;

            if (lojista_telefone) {
                const numbers = lojista_telefone.replace(/\D/g, '');

                // Lógica de formatação simplificada e segura
                if (numbers.length >= 10 && !numbers.startsWith('55')) {
                    formattedPhone = `+55${numbers}`;
                } else {
                    formattedPhone = `+${numbers}`;
                }
            }

            // 1. Create user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: lojista_email,
                phone: formattedPhone, // Agora explícito string | undefined
                password: lojista_senha,
                email_confirm: true, // Auto-confirm email
                user_metadata: { phone: lojista_telefone } // Salva o formato original
            });

            if (authError) {
                console.error('❌ ERRO AUTH SUPABASE:', authError); // LOG DETALHADO
                return reply.status(400).send({ error: `Erro ao criar usuário: ${authError.message}` });
            }

            const userId = authData.user.id;

            // 2. Create user profile in public.users
            const { error: userError } = await supabase
                .from('users')
                .insert({
                    id: userId,
                    email: lojista_email,
                    full_name: lojista_nome,
                    phone: lojista_telefone, // Agora salvo no banco!
                    role: 'lojista',
                });

            if (userError) {
                // Rollback: delete auth user if profile creation fails
                await supabase.auth.admin.deleteUser(userId);
                return reply.status(500).send({ error: `Erro ao criar perfil: ${userError.message}` });
            }

            // 3. Create store
            // Garantir que email da loja seja o do lojista
            const storePayload: any = {
                nome,
                email: lojista_email,
                status: status || 'pendente',
                lojista_id: userId
            };

            if (segmento_id) {
                storePayload.segmento_id = segmento_id;
            }

            // Lógica Inteligente de Plano
            let finalPlanoId = plano_id;
            let finalExpiresAt = null;

            // Se não veio plano, buscar o Default
            if (!finalPlanoId || finalPlanoId.trim() === '') {
                const { data: defaultPlan } = await supabase.from('planos').select('*').eq('is_default', true).single();
                if (defaultPlan) {
                    finalPlanoId = defaultPlan.id;
                }
            }

            // Se temos um plano (vindo ou default), calcular expiração
            if (finalPlanoId) {
                const { data: chosenPlan } = await supabase.from('planos').select('*').eq('id', finalPlanoId).single();
                if (chosenPlan) {
                    const vigencia = chosenPlan.vigencia_dias || 30;
                    const expirationDate = new Date();
                    expirationDate.setDate(expirationDate.getDate() + vigencia);
                    finalExpiresAt = expirationDate.toISOString();

                    storePayload.plano_id = chosenPlan.id;
                    storePayload.plan_expires_at = finalExpiresAt;
                }
            }

            const { data: storeData, error: storeError } = await supabase
                .from('lojas')
                .insert(storePayload)
                .select()
                .single();

            if (storeError) {
                // Rollback: delete user profile and auth user
                await supabase.from('users').delete().eq('id', userId);
                await supabase.auth.admin.deleteUser(userId);
                return reply.status(500).send({ error: `Erro ao criar loja: ${storeError.message}` });
            }

            return reply.status(201).send({
                id: storeData.id,
                lojista_id: userId,
                message: 'Loja e lojista criados com sucesso'
            });

        } catch (err: any) {
            console.error('❌ ERRO GERAL CRIAR LOJA:', err);
            return reply.status(500).send({ error: err.message });
        }
    });

    // PUT - Update store
    // PUT - Update store & Lojista Auth
    server.put('/lojas/:id', {
        schema: {
            tags: ['Stores'],
            params: z.object({ id: z.string() }),
            body: z.object({
                nome: z.string().optional(),
                email: z.string().email().optional(),
                lojista_id: z.string().optional(),
                plano_id: z.string().optional(),
                status: z.enum(['ativa', 'bloqueada', 'pendente']).optional(),
                plan_expires_at: z.string().nullable().optional(),
                lojista_senha: z.string().optional(),
                segmento_id: z.string().optional().nullable(),
            }),
            response: {
                200: z.object({ message: z.string() }),
                400: z.object({ error: z.string() }),
                404: z.object({ error: z.string() }),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const { nome, email, lojista_id, plano_id, status, plan_expires_at, lojista_senha, segmento_id } = request.body;

        // 1. Buscar dados atuais da loja
        const { data: currentStore, error: fetchError } = await supabase
            .from('lojas')
            .select('lojista_id, email, plan_expires_at, plano_id')
            .eq('id', id)
            .single();

        if (fetchError || !currentStore) {
            return reply.status(404).send({ error: 'Loja não encontrada' });
        }

        const targetLojistaId = lojista_id || currentStore.lojista_id;

        // 2. Atualizar Auth User (Se houver senha ou mudança de email)
        if (targetLojistaId && (lojista_senha || (email && email !== currentStore.email))) {
            const authUpdates: any = {};
            if (lojista_senha && lojista_senha.trim() !== '') {
                authUpdates.password = lojista_senha;
            }
            if (email && email !== currentStore.email) {
                authUpdates.email = email;
                authUpdates.email_confirm = true;
            }

            if (Object.keys(authUpdates).length > 0) {
                const { error: authError } = await supabase.auth.admin.updateUserById(targetLojistaId, authUpdates);
                if (authError) {
                    return reply.status(400).send({ error: `Erro ao atualizar login: ${authError.message}` });
                }
                // Se mudou email, atualizar profile public.users também
                if (authUpdates.email) {
                    await supabase.from('users').update({ email: authUpdates.email }).eq('id', targetLojistaId);
                }
            }
        }

        // 3. Atualizar Tabela Lojas
        const storeUpdates: any = {};
        if (nome) storeUpdates.nome = nome;
        if (email) storeUpdates.email = email;
        if (status) storeUpdates.status = status;
        if (segmento_id !== undefined) storeUpdates.segmento_id = segmento_id === '' ? null : segmento_id;

        // Se mudou o plano, recalcular expiração
        if (plano_id !== undefined) {
            storeUpdates.plano_id = plano_id === '' ? null : plano_id;

            if (plano_id && plano_id !== '') {
                const { data: newPlan } = await supabase.from('planos').select('*').eq('id', plano_id).single();
                if (newPlan) {
                    const vigencia = newPlan.vigencia_dias || 30;

                    // Lógica de Renovação vs Troca de Plano
                    // Se estiver renovando o MESMO plano e ainda não expirou, soma a vigência à data atual de expiração.
                    // Caso contrário (troca de plano ou já expirado), começa a contar a partir de agora.
                    let baseDate = new Date();
                    const currentExpires = currentStore.plan_expires_at ? new Date(currentStore.plan_expires_at) : null;

                    if (plano_id === currentStore.plano_id && currentExpires && currentExpires > baseDate) {
                        baseDate = currentExpires;
                    }

                    baseDate.setDate(baseDate.getDate() + vigencia);
                    storeUpdates.plan_expires_at = baseDate.toISOString();
                }
            }
        }

        if (plan_expires_at !== undefined) storeUpdates.plan_expires_at = plan_expires_at;

        if (Object.keys(storeUpdates).length > 0) {
            const { error: updateError } = await supabase
                .from('lojas')
                .update(storeUpdates)
                .eq('id', id);

            if (updateError) return reply.status(500).send({ error: updateError.message });
        }

        return reply.send({ message: 'Loja e dados de acesso atualizados com sucesso' });
    });

    // DELETE store
    server.delete('/lojas/:id', {
        schema: {
            tags: ['Stores'],
            params: z.object({ id: z.string() }),
            response: {
                200: z.object({ message: z.string() }),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const { error } = await supabase.from('lojas').delete().eq('id', id);
        if (error) return reply.status(500).send({ error: error.message });
        return reply.send({ message: 'Store deleted successfully' });
    });
}
