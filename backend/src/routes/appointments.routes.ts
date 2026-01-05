import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { supabase } from '../config/supabase';

export async function appointmentsRoutes(app: FastifyInstance) {
    const server = app.withTypeProvider<ZodTypeProvider>();

    server.get('/agendamentos', {
        schema: {
            tags: ['Appointments'],
            querystring: z.object({
                loja_id: z.string().optional(),
                profissional_id: z.string().optional(),
                status: z.enum(['confirmado', 'cancelado', 'pendente']).optional(),
                data: z.string().optional(),
            }),
            response: {
                200: z.array(z.object({
                    id: z.string(),
                    loja_id: z.string(),
                    cliente_nome: z.string(),
                    cliente_telefone: z.string().nullable(),
                    profissional_id: z.string(),
                    servico_id: z.string(),
                    data: z.string(),
                    hora: z.string(),
                    status: z.string(),
                })),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { loja_id, profissional_id, status, data: date } = request.query;
        let query = supabase.from('agendamentos').select('*');

        if (loja_id) query = query.eq('loja_id', loja_id);
        if (profissional_id) query = query.eq('profissional_id', profissional_id);
        if (status) query = query.eq('status', status);
        if (date) query = query.eq('data', date);

        const { data, error } = await query;
        if (error) return reply.status(500).send({ error: error.message });
        return reply.send(data);
    });

    server.post('/agendamentos', {
        schema: {
            tags: ['Appointments'],
            body: z.object({
                loja_id: z.string(),
                cliente_nome: z.string(),
                cliente_telefone: z.string().optional(),
                profissional_id: z.string(),
                servico_id: z.string(),
                data: z.string(), // YYYY-MM-DD
                hora: z.string(), // HH:MM:SS
            }),
            response: {
                201: z.object({ id: z.string() }),
                400: z.object({ error: z.string() }),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { loja_id, profissional_id, servico_id, data: date, hora } = request.body;

        try {
            // 1. Fetch Service for Duration
            const { data: service, error: serviceError } = await supabase
                .from('servicos')
                .select('duracao_minutos')
                .eq('id', servico_id)
                .single();

            if (serviceError || !service) return reply.status(400).send({ error: 'Service not found' });
            const duration = service.duracao_minutos || 60;

            // 2. Fetch Professional Unavailability
            const { data: prof, error: profError } = await supabase
                .from('profissionais')
                .select('indisponibilidades')
                .eq('id', profissional_id)
                .single();

            if (profError || !prof) return reply.status(400).send({ error: 'Professional not found' });

            const unavailability = prof.indisponibilidades || [];

            // 3. Check for Unavailability Conflicts
            const apptStart = new Date(`${date}T${hora}`);
            const apptEnd = new Date(apptStart.getTime() + duration * 60000);

            if (Array.isArray(unavailability)) {
                const hasConflict = unavailability.some((u: any) => {
                    const uStart = new Date(u.start);
                    const uEnd = new Date(u.end);
                    // Check overlap: StartA < EndB && EndA > StartB
                    return (apptStart < uEnd && apptEnd > uStart);
                });

                if (hasConflict) {
                    return reply.status(400).send({ error: 'Profissional indisponível neste horário (período de ausência cadastrado).' });
                }
            }

            // 4. Check for Existing Appointment Conflicts
            const { data: conflicts, error: conflictError } = await supabase
                .from('agendamentos')
                .select('id')
                .eq('profissional_id', profissional_id)
                .eq('data', date)
                .eq('hora', hora) // Basic precise match check (Validation could be improved for intervals)
                .neq('status', 'cancelado');

            if (conflictError) throw conflictError;
            if (conflicts && conflicts.length > 0) {
                return reply.status(400).send({ error: 'Profissional já possui agendamento neste horário.' });
            }

            // 5. Create appointment
            const { data: newAppt, error } = await supabase.from('agendamentos').insert(request.body).select('id').single();
            if (error) throw error;
            return reply.status(201).send(newAppt);

        } catch (err: any) {
            console.error('Appointment Error:', err);
            return reply.status(500).send({ error: err.message || 'Error executing request' });
        }
    });

    server.put('/agendamentos/:id', {
        schema: {
            tags: ['Appointments'],
            params: z.object({ id: z.string() }),
            body: z.object({
                status: z.enum(['confirmado', 'cancelado', 'pendente']).optional(),
                data: z.string().optional(),
                hora: z.string().optional(),
            }),
            response: {
                200: z.object({ message: z.string() }),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const { error } = await supabase.from('agendamentos').update(request.body).eq('id', id);
        if (error) return reply.status(500).send({ error: error.message });
        return reply.send({ message: 'Appointment updated successfully' });
    });

    server.patch('/agendamentos/:id/status', {
        schema: {
            tags: ['Appointments'],
            params: z.object({ id: z.string() }),
            body: z.object({
                status: z.enum(['confirmado', 'cancelado', 'pendente']),
            }),
            response: {
                200: z.object({ message: z.string() }),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const { status } = request.body;
        const { error } = await supabase.from('agendamentos').update({ status }).eq('id', id);
        if (error) return reply.status(500).send({ error: error.message });
        return reply.send({ message: 'Status updated successfully' });
    });

    server.delete('/agendamentos/:id', {
        schema: {
            tags: ['Appointments'],
            params: z.object({ id: z.string() }),
            response: {
                200: z.object({ message: z.string() }),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const { error } = await supabase.from('agendamentos').delete().eq('id', id);
        if (error) return reply.status(500).send({ error: error.message });
        return reply.send({ message: 'Appointment deleted successfully' });
    });
}
