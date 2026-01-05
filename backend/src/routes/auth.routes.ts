import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { supabase } from '../config/supabase';

export async function authRoutes(app: FastifyInstance) {
    const server = app.withTypeProvider<ZodTypeProvider>();

    server.post('/auth/login', {
        schema: {
            tags: ['Auth'],
            body: z.object({
                email: z.string().email(),
                password: z.string(),
            }),
            response: {
                200: z.object({
                    session: z.any(),
                    user: z.any(),
                }),
                401: z.object({
                    error: z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const { email, password } = request.body;
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            return reply.status(401).send({ error: error.message });
        }

        // Buscar permissões extras na tabela users
        if (data.user) {
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('permissions, role, full_name')
                .eq('id', data.user.id)
                .single();

            if (profileError) {
                console.error('Erro ao buscar perfil do usuário:', profileError);

                // Se o usuário não existe na tabela users, criar automaticamente
                if (profileError.code === 'PGRST116') {
                    console.log('Usuário não encontrado na tabela users, criando registro...');
                    const userRole = (data.user.user_metadata as any)?.role || 'cliente';
                    const userFullName = (data.user.user_metadata as any)?.full_name || data.user.email?.split('@')[0] || 'Usuário';

                    const { error: insertError } = await supabase
                        .from('users')
                        .insert({
                            id: data.user.id,
                            email: data.user.email,
                            full_name: userFullName,
                            role: userRole,
                            permissions: userRole === 'admin'
                                ? { dashboard: true, users: true, stores: true, services: true, appointments: true, employees: true }
                                : {}
                        });

                    if (insertError) {
                        console.error('Erro ao criar perfil do usuário:', insertError);
                    } else {
                        // Atribuir os dados ao usuário
                        Object.assign(data.user, {
                            permissions: userRole === 'admin'
                                ? { dashboard: true, users: true, stores: true, services: true, appointments: true, employees: true }
                                : {},
                            role: userRole,
                            full_name: userFullName
                        });
                    }
                }
            } else if (profile) {
                // Mesclar dados do perfil no objeto user retornado
                Object.assign(data.user, {
                    permissions: profile.permissions,
                    role: profile.role || (data.user.user_metadata as any).role,
                    full_name: profile.full_name || (data.user.user_metadata as any).full_name
                });
            }
        }

        return reply.send(data);
    });

    server.post('/auth/logout', {
        schema: {
            tags: ['Auth'],
            response: {
                200: z.object({
                    message: z.string(),
                }),
                500: z.object({
                    error: z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            return reply.status(500).send({ error: error.message });
        }
        return reply.send({ message: 'Logged out successfully' });
    });

    server.get('/auth/me', {
        schema: {
            tags: ['Auth'],
            response: {
                200: z.any(),
                401: z.object({
                    error: z.string(),
                }),
            },
        },
    }, async (request, reply) => {
        const token = request.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return reply.status(401).send({ error: 'Missing token' });
        }

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error) {
            return reply.status(401).send({ error: error.message });
        }

        return reply.send(user);
    });
}
