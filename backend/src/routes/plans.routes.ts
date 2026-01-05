import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { supabase } from '../config/supabase';

export async function plansRoutes(app: FastifyInstance) {
    const server = app.withTypeProvider<ZodTypeProvider>();

    server.get('/planos', {
        schema: {
            tags: ['Plans'],
            response: {
                200: z.array(z.object({
                    id: z.string(),
                    nome: z.string(),
                    limite_profissionais: z.number(),
                    limite_agendamentos: z.number(),
                    permite_pagamentos_online: z.boolean(),
                    permite_integracao_calendar: z.boolean(),
                    price: z.number().nullable().optional(),
                    description: z.string().nullable().optional(),
                    active: z.boolean().nullable().optional(),
                    highlight: z.boolean().nullable().optional(),
                    features: z.any().nullable().optional(),
                    vigencia_dias: z.number().nullable().optional(),
                    hidden: z.boolean().nullable().optional(),
                    is_default: z.boolean().nullable().optional(),
                })),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { data, error } = await supabase.from('planos').select('*').order('price', { ascending: true });
        if (error) return reply.status(500).send({ error: error.message });
        return reply.send(data);
    });

    server.post('/planos', {
        schema: {
            tags: ['Plans'],
            body: z.object({
                nome: z.string(),
                limite_profissionais: z.number(),
                limite_agendamentos: z.number(),
                permite_pagamentos_online: z.boolean().optional(),
                permite_integracao_calendar: z.boolean().optional(),
                price: z.number().optional(),
                description: z.string().optional(),
                active: z.boolean().optional(),
                highlight: z.boolean().optional(),
                features: z.any().optional(),
                vigencia_dias: z.number().optional().default(30),
                hidden: z.boolean().optional().default(false),
                is_default: z.boolean().optional().default(false),
            }),
            response: {
                201: z.object({ id: z.string() }),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { data, error } = await supabase.from('planos').insert(request.body).select('id').single();
        if (error) return reply.status(500).send({ error: error.message });
        return reply.status(201).send(data);
    });

    server.put('/planos/:id', {
        schema: {
            tags: ['Plans'],
            params: z.object({ id: z.string() }),
            body: z.object({
                nome: z.string().optional(),
                limite_profissionais: z.number().optional(),
                limite_agendamentos: z.number().optional(),
                permite_pagamentos_online: z.boolean().optional(),
                permite_integracao_calendar: z.boolean().optional(),
                price: z.number().optional(),
                description: z.string().optional(),
                active: z.boolean().optional(),
                highlight: z.boolean().optional(),
                features: z.any().optional(),
                vigencia_dias: z.number().optional(),
                hidden: z.boolean().optional(),
                is_default: z.boolean().optional(),
            }),
            response: {
                200: z.object({ message: z.string() }),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const { error } = await supabase.from('planos').update(request.body).eq('id', id);
        if (error) return reply.status(500).send({ error: error.message });
        return reply.send({ message: 'Plan updated successfully' });
    });

    server.delete('/planos/:id', {
        schema: {
            tags: ['Plans'],
            params: z.object({ id: z.string() }),
            response: {
                200: z.object({ message: z.string() }),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const { error } = await supabase.from('planos').delete().eq('id', id);
        if (error) return reply.status(500).send({ error: error.message });
        return reply.send({ message: 'Plan deleted successfully' });
    });

    server.put('/planos/:id/default', {
        schema: {
            tags: ['Plans'],
            params: z.object({ id: z.string() }),
            response: {
                200: z.object({ message: z.string() }),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params;

        // 1. Reset all to false
        // We use a dummy filter to bypass potential "update all" restrictions while using a valid UUID format
        const { error: resetError } = await supabase
            .from('planos')
            .update({ is_default: false })
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (resetError) return reply.status(500).send({ error: resetError.message });

        // 2. Set target to true
        const { error: updateError } = await supabase.from('planos').update({ is_default: true }).eq('id', id);

        if (updateError) return reply.status(500).send({ error: updateError.message });

        return reply.send({ message: 'Default plan set successfully' });
    });
}
