import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { supabase } from '../config/supabase';

export async function logsRoutes(app: FastifyInstance) {
    const server = app.withTypeProvider<ZodTypeProvider>();

    server.get('/logs', {
        schema: {
            tags: ['Logs'],
            response: {
                200: z.array(z.object({
                    id: z.string(),
                    tipo: z.string(),
                    usuario_id: z.string().nullable(),
                    mensagem: z.string(),
                    created_at: z.string(),
                })),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { data, error } = await supabase.from('logs_sistema').select('*').order('created_at', { ascending: false }).limit(100);
        if (error) return reply.status(500).send({ error: error.message });
        return reply.send(data);
    });

    server.post('/logs', {
        schema: {
            tags: ['Logs'],
            body: z.object({
                tipo: z.string(),
                usuario_id: z.string().optional(),
                mensagem: z.string(),
            }),
            response: {
                201: z.object({ id: z.string() }),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { data, error } = await supabase.from('logs_sistema').insert(request.body).select('id').single();
        if (error) return reply.status(500).send({ error: error.message });
        return reply.status(201).send(data);
    });
}
