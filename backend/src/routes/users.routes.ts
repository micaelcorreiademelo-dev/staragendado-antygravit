import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { supabase } from '../config/supabase';

export async function usersRoutes(app: FastifyInstance) {
    const server = app.withTypeProvider<ZodTypeProvider>();

    server.get('/users', {
        schema: {
            tags: ['Users'],
            querystring: z.object({
                role: z.enum(['admin', 'lojista', 'profissional']).optional(),
            }),
            response: {
                200: z.array(z.object({
                    id: z.string(),
                    email: z.string(),
                    full_name: z.string().nullable(),
                    role: z.string(),
                    created_at: z.string(),
                })),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { role } = request.query;
        let query = supabase.from('users').select('*');

        if (role) query = query.eq('role', role);

        const { data, error } = await query;
        if (error) return reply.status(500).send({ error: error.message });
        return reply.send(data);
    });

    server.get('/users/:id', {
        schema: {
            tags: ['Users'],
            params: z.object({ id: z.string() }),
            response: {
                200: z.object({
                    id: z.string(),
                    email: z.string(),
                    full_name: z.string().nullable(),
                    role: z.string(),
                    created_at: z.string(),
                }),
                404: z.object({ error: z.string() }),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
        if (error) return reply.status(500).send({ error: error.message });
        if (!data) return reply.status(404).send({ error: 'User not found' });
        return reply.send(data);
    });
}
