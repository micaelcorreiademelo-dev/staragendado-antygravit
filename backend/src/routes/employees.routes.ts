import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { supabase } from '../config/supabase';

export async function employeesRoutes(app: FastifyInstance) {
    const server = app.withTypeProvider<ZodTypeProvider>();

    // GET /employees - List all admins/employees
    server.get('/employees', {
        schema: {
            tags: ['Employees'],
            response: {
                200: z.array(z.object({
                    id: z.string(),
                    full_name: z.string(),
                    email: z.string(),
                    phone: z.string().optional().nullable(),
                    role: z.string().nullable().optional(),
                    permissions: z.record(z.boolean()).optional().nullable(),
                    created_at: z.string(),
                })),
                500: z.object({ error: z.string() })
            }
        }
    }, async (request, reply) => {
        console.log('📋 GET /employees - Buscando funcionários...');

        // Busca usuários com role admin
        // Nota: O enum user_role não tem 'funcionario', apenas 'admin', 'lojista', 'profissional', 'cliente'
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'admin') // Apenas admin, pois 'funcionario' não existe no enum
            .order('created_at', { ascending: false });

        console.log('📊 Resultado da query:');
        console.log('  - Total encontrado:', data?.length || 0);
        console.log('  - Erro:', error?.message || 'nenhum');

        if (data && data.length > 0) {
            console.log('  - Funcionários:', data.map(u => ({ id: u.id, email: u.email, role: u.role })));
        }

        if (error) {
            console.error('❌ Erro ao buscar funcionários:', error);
            return reply.status(500).send({ error: error.message });
        }

        return reply.send(data || []);
    });

    // POST /employees - Create new employee
    server.post('/employees', {
        schema: {
            tags: ['Employees'],
            body: z.object({
                full_name: z.string(),
                email: z.string().email(),
                password: z.string().min(6),
                permissions: z.record(z.boolean()),
                role: z.literal('admin').optional().default('admin') // Apenas 'admin' é válido no enum
            }),
            response: {
                201: z.object({ id: z.string(), message: z.string() }),
                500: z.object({ error: z.string() })
            }
        }
    }, async (request, reply) => {
        const { full_name, email, password, permissions, role } = request.body;

        console.log('➕ POST /employees - Criando novo funcionário...');
        console.log('  - Nome:', full_name);
        console.log('  - Email:', email);
        console.log('  - Role:', role);
        console.log('  - Permissões:', Object.keys(permissions).filter(k => permissions[k]));

        // 1. Create Auth User
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name, role }
        });

        if (authError) {
            console.error('❌ Erro ao criar usuário no Auth:', authError.message);
            if (authError.message.includes('already been registered')) {
                return reply.status(409).send({ error: 'Este e-mail já está cadastrado no sistema.' });
            }
            return reply.status(500).send({ error: `Erro Auth: ${authError.message}` });
        }
        if (!authData.user) {
            console.error('❌ Usuário Auth não foi criado');
            return reply.status(500).send({ error: 'Erro ao criar usuário Auth' });
        }

        const userId = authData.user.id;
        console.log('✅ Usuário criado no Auth com ID:', userId);

        // 2. Create Profile
        const { error: dbError } = await supabase
            .from('users')
            .insert({
                id: userId,
                full_name,
                email,
                role,
                permissions // Requer coluna permissions JSONB
                // phone é opcional
            });

        if (dbError) {
            console.error('❌ Erro ao criar perfil no DB:', dbError.message);
            // Rollback
            await supabase.auth.admin.deleteUser(userId);
            return reply.status(500).send({ error: `Erro DB: ${dbError.message}` });
        }

        console.log('✅ Perfil criado no DB com sucesso');
        console.log('🎉 Funcionário criado com sucesso! ID:', userId);

        return reply.status(201).send({ id: userId, message: 'Funcionário criado com sucesso' });
    });

    // PUT /employees/:id - Update employee
    server.put('/employees/:id', {
        schema: {
            tags: ['Employees'],
            params: z.object({ id: z.string() }),
            body: z.object({
                full_name: z.string().optional(),
                email: z.string().email().optional(),
                password: z.string().optional(),
                permissions: z.record(z.boolean()).optional(),
                role: z.literal('admin').optional() // Apenas 'admin' é válido no enum
            }),
            response: {
                200: z.object({ message: z.string() }),
                500: z.object({ error: z.string() })
            }
        }
    }, async (request, reply) => {
        const { id } = request.params;
        const { full_name, email, password, permissions, role } = request.body;

        // Update Auth if needed
        if (password || email) {
            const updates: any = {};
            if (password && password.trim() !== '') updates.password = password;
            if (email) {
                updates.email = email;
                updates.email_confirm = true;
            }
            if (Object.keys(updates).length > 0) {
                const { error: authError } = await supabase.auth.admin.updateUserById(id, updates);
                if (authError) return reply.status(500).send({ error: `Erro Auth Update: ${authError.message}` });
            }
        }

        // Update DB
        const dbUpdates: any = {};
        if (full_name) dbUpdates.full_name = full_name;
        if (email) dbUpdates.email = email; // Sync email
        if (permissions) dbUpdates.permissions = permissions;
        if (role) dbUpdates.role = role;

        if (Object.keys(dbUpdates).length > 0) {
            const { error: dbError } = await supabase
                .from('users')
                .update(dbUpdates)
                .eq('id', id);

            if (dbError) return reply.status(500).send({ error: `Erro DB Update: ${dbError.message}` });
        }

        return reply.send({ message: 'Funcionário atualizado com sucesso' });
    });

    // DELETE /employees/:id
    server.delete('/employees/:id', {
        schema: {
            tags: ['Employees'],
            params: z.object({ id: z.string() }),
            response: {
                200: z.object({ message: z.string() }),
                500: z.object({ error: z.string() })
            }
        }
    }, async (request, reply) => {
        const { id } = request.params;

        console.log('🗑️ DELETE /employees/:id - Removendo funcionário...');
        console.log('  - ID:', id);

        // 1. Manually delete related records to avoid FK constraints if CASCADE is missing
        console.log('  - Removendo registros relacionados (Profissionais/Lojas)...');

        // Remover vínculo de profissionais (se houver)
        const { error: profError } = await supabase
            .from('profissionais')
            .delete()
            .eq('user_id', id);

        if (profError) {
            console.error('⚠️ Erro ao deletar vínculo de profissional (ignorando):', profError.message);
        }

        // Remover lojas do usuário (se houver)
        const { error: lojasError } = await supabase
            .from('lojas')
            .delete()
            .eq('user_id', id);

        if (lojasError) {
            console.error('⚠️ Erro ao deletar lojas do usuário (ignorando):', lojasError.message);
        }

        // 2. Delete from Auth first
        console.log('  - Tentando deletar do Auth...');
        const { error: authError } = await supabase.auth.admin.deleteUser(id);
        if (authError) {
            console.error('❌ Erro ao deletar do Auth:', authError.message);
            // Continua para tentar deletar do DB mesmo assim
        } else {
            console.log('✅ Deletado do Auth com sucesso');
        }

        // 3. Delete from DB (ensure cleanup)
        console.log('  - Tentando deletar do DB...');
        const { error: dbError, count } = await supabase
            .from('users')
            .delete()
            .eq('id', id);

        if (dbError) {
            console.error('❌ Erro ao deletar do DB:', dbError.message);
            return reply.status(500).send({
                error: `Erro ao remover funcionário: ${dbError.message}`
            });
        }

        console.log('✅ Deletado do DB com sucesso');
        console.log('  - Registros afetados:', count);
        console.log('🎉 Funcionário removido com sucesso!');

        return reply.send({ message: 'Funcionário removido com sucesso' });
    });
}
