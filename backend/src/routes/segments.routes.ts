
import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { supabase } from '../config/supabase';

export async function segmentsRoutes(app: FastifyInstance) {
    const server = app.withTypeProvider<ZodTypeProvider>();

    server.get('/segmentos', {
        schema: {
            tags: ['Segments'],
            response: {
                200: z.array(z.object({
                    id: z.string(),
                    nome: z.string(),
                    active: z.boolean().nullable().optional(),
                })),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { data, error } = await supabase.from('segmentos').select('*').order('nome');
        if (error) return reply.status(500).send({ error: error.message });
        return reply.send(data);
    });

    server.post('/segmentos', {
        schema: {
            tags: ['Segments'],
            body: z.object({
                nome: z.string(),
                active: z.boolean().optional().default(true),
            }),
            response: {
                201: z.object({ id: z.string() }),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { data, error } = await supabase.from('segmentos').insert(request.body).select('id').single();
        if (error) return reply.status(500).send({ error: error.message });
        return reply.status(201).send(data);
    });

    server.put('/segmentos/:id', {
        schema: {
            tags: ['Segments'],
            params: z.object({ id: z.string() }),
            body: z.object({
                nome: z.string().optional(),
                active: z.boolean().optional(),
            }),
            response: {
                200: z.object({ message: z.string() }),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const { error } = await supabase.from('segmentos').update(request.body).eq('id', id);
        if (error) return reply.status(500).send({ error: error.message });
        return reply.send({ message: 'Segment updated' });
    });

    server.delete('/segmentos/:id', {
        schema: {
            tags: ['Segments'],
            params: z.object({ id: z.string() }),
            response: {
                200: z.object({ message: z.string() }),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const { error } = await supabase.from('segmentos').delete().eq('id', id);
        if (error) return reply.status(500).send({ error: error.message });
        return reply.send({ message: 'Segment deleted' });
    });
}
