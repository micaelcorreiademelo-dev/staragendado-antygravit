import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { supabase } from '../config/supabase';

export async function servicesRoutes(app: FastifyInstance) {
    const server = app.withTypeProvider<ZodTypeProvider>();

    server.get('/servicos', {
        schema: {
            tags: ['Services'],
            querystring: z.object({
                loja_id: z.string().optional(),
            }),
            response: {
                200: z.array(z.object({
                    id: z.string(),
                    nome: z.string(),
                    preco: z.number(),
                    duracao_minutos: z.number(),
                    loja_id: z.string(),
                })),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { loja_id } = request.query;
        let query = supabase.from('servicos').select('*');

        if (loja_id) query = query.eq('loja_id', loja_id);

        const { data, error } = await query;
        if (error) return reply.status(500).send({ error: error.message });
        return reply.send(data);
    });

    server.post('/servicos', {
        schema: {
            tags: ['Services'],
            body: z.object({
                nome: z.string(),
                preco: z.number(),
                duracao_minutos: z.number(),
                loja_id: z.string(),
            }),
            response: {
                201: z.object({ id: z.string() }),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { data, error } = await supabase.from('servicos').insert(request.body).select('id').single();
        if (error) return reply.status(500).send({ error: error.message });
        return reply.status(201).send(data);
    });

    server.put('/servicos/:id', {
        schema: {
            tags: ['Services'],
            params: z.object({ id: z.string() }),
            body: z.object({
                nome: z.string().optional(),
                preco: z.number().optional(),
                duracao_minutos: z.number().optional(),
            }),
            response: {
                200: z.object({ message: z.string() }),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const { error } = await supabase.from('servicos').update(request.body).eq('id', id);
        if (error) return reply.status(500).send({ error: error.message });
        return reply.send({ message: 'Service updated successfully' });
    });

    server.delete('/servicos/:id', {
        schema: {
            tags: ['Services'],
            params: z.object({ id: z.string() }),
            response: {
                200: z.object({ message: z.string() }),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const { error } = await supabase.from('servicos').delete().eq('id', id);
        if (error) return reply.status(500).send({ error: error.message });
        return reply.send({ message: 'Service deleted successfully' });
    });
}
