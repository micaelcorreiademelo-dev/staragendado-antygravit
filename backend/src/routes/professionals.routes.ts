import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { supabase } from '../config/supabase';
import bcrypt from 'bcryptjs';

export async function professionalsRoutes(app: FastifyInstance) {
    const server = app.withTypeProvider<ZodTypeProvider>();

    // LOGIN
    server.post('/profissionais/login', {
        schema: {
            tags: ['Professionals'],
            summary: 'Login de profissional',
            body: z.object({
                email: z.string().email(),
                password: z.string()
            }),
            response: {
                200: z.object({
                    id: z.string(),
                    nome: z.string(),
                    email: z.string(),
                    role: z.string(),
                    loja_id: z.string(),
                    permissoes: z.any().nullable().optional()
                }),
                401: z.object({ error: z.string() }),
                500: z.object({ error: z.string() })
            }
        }
    }, async (request, reply) => {
        const { email, password } = request.body;

        const { data: prof, error } = await supabase
            .from('profissionais')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !prof) {
            return reply.status(401).send({ error: 'Credenciais inválidas.' });
        }

        const isValid = await bcrypt.compare(password, prof.senha_hash);
        if (!isValid) {
            return reply.status(401).send({ error: 'Credenciais inválidas.' });
        }

        if (prof.status === 'Bloqueado') {
            return reply.status(401).send({ error: 'Conta bloqueada.' });
        }

        return reply.send({
            id: prof.id,
            nome: prof.nome,
            email: prof.email,
            role: 'profissional',
            loja_id: prof.loja_id,
            permissoes: prof.permissoes
        });
    });

    // CREATE
    server.post('/profissionais', {
        schema: {
            tags: ['Professionals'],
            summary: 'Criar novo profissional',
            body: z.object({
                nome: z.string(),
                email: z.string().email(),
                password: z.string().min(3),
                loja_id: z.string(),
                phone: z.string().optional(),
                status: z.string().default('Active'),
                disponibilidade: z.any().optional(),       // JSONB
                indisponibilidades: z.any().optional(),    // JSONB
                permissoes: z.any().optional(),            // JSONB
                avatar: z.string().optional()
            }),
            response: {
                201: z.object({
                    id: z.string(),
                    message: z.string()
                }),
                500: z.object({
                    error: z.string()
                })
            }
        }
    }, async (request, reply) => {
        const { nome, email, password, loja_id, phone, status, disponibilidade, indisponibilidades, permissoes, avatar } = request.body;

        try {
            // Hash password correctly using bcryptjs
            const salt = await bcrypt.genSalt(10);
            const senha_hash = await bcrypt.hash(password, salt);

            const { data, error } = await supabase.from('profissionais').insert({
                nome,
                email,
                senha_hash,
                loja_id,
                phone,
                status,
                disponibilidade: disponibilidade || {},
                indisponibilidades: indisponibilidades || [],
                permissoes: permissoes || {},
                avatar
            }).select('id').single();

            if (error) {
                console.error('Supabase Insert Error:', error);
                // Handle duplicate email/slug constraint if any
                if (error.code === '23505') { // Unique violation check
                    return reply.status(409).send({ error: 'Email já cadastrado nesta loja.' });
                }
                throw error;
            }

            return reply.status(201).send({ id: data.id, message: 'Profissional criado com sucesso!' });
        } catch (err: any) {
            console.error('Server Error:', err);
            return reply.status(500).send({ error: err.message || 'Erro interno ao criar profissional.' });
        }
    });

    // LIST
    server.get('/profissionais', {
        schema: {
            tags: ['Professionals'],
            summary: 'Listar profissionais',
            querystring: z.object({
                loja_id: z.string().optional(),
            }),
            response: {
                200: z.array(z.object({
                    id: z.string(),
                    nome: z.string(),
                    email: z.string().nullable(),
                    phone: z.string().nullable(),
                    loja_id: z.string(),
                    status: z.string().nullable(),
                    disponibilidade: z.any().nullable(),
                    indisponibilidades: z.any().nullable(),
                    permissoes: z.any().nullable(),
                    avatar: z.string().nullable(),
                    // senha_hash is NOT returned 
                })),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { loja_id } = request.query;

        let query = supabase.from('profissionais').select('id, nome, email, phone, loja_id, status, disponibilidade, indisponibilidades, permissoes, avatar');

        if (loja_id) {
            query = query.eq('loja_id', loja_id);
        }

        const { data, error } = await query;
        if (error) {
            console.error('Supabase Select Error:', error);
            return reply.status(500).send({ error: error.message });
        }

        return reply.send(data || []);
    });

    // UPDATE
    server.put('/profissionais/:id', {
        schema: {
            tags: ['Professionals'],
            params: z.object({ id: z.string() }),
            body: z.object({
                nome: z.string().optional(),
                email: z.string().email().optional(),
                password: z.string().optional(), // Opcional no update
                phone: z.string().optional(),
                status: z.string().optional(),
                disponibilidade: z.any().optional(),
                indisponibilidades: z.any().optional(),
                permissoes: z.any().optional(),
                avatar: z.string().optional()
            }),
            response: {
                200: z.object({ message: z.string() }),
                500: z.object({ error: z.string() })
            }
        }
    }, async (request, reply) => {
        const { id } = request.params;
        const { password, ...rest } = request.body;

        try {
            let updateData: any = { ...rest };

            // If password provided, update hash
            if (password) {
                const salt = await bcrypt.genSalt(10);
                updateData.senha_hash = await bcrypt.hash(password, salt);
            }

            const { error } = await supabase.from('profissionais').update(updateData).eq('id', id);

            if (error) throw error;
            return reply.send({ message: 'Profissional atualizado com sucesso' });
        } catch (err: any) {
            console.error('Update Error:', err);
            return reply.status(500).send({ error: err.message });
        }
    });

    // DELETE
    server.delete('/profissionais/:id', {
        schema: {
            tags: ['Professionals'],
            params: z.object({ id: z.string() }),
            response: {
                200: z.object({ message: z.string() }),
                500: z.object({ error: z.string() })
            }
        }
    }, async (request, reply) => {
        const { id } = request.params;
        try {
            const { error } = await supabase.from('profissionais').delete().eq('id', id);
            if (error) throw error;
            return reply.send({ message: 'Profissional excluído com sucesso' });
        } catch (err: any) {
            return reply.status(500).send({ error: err.message });
        }
    });

    // PATCH unavailable (Specific endpoint kept for compatibility)
    server.patch('/profissionais/:id/indisponibilidade', {
        schema: {
            tags: ['Professionals'],
            params: z.object({ id: z.string() }),
            body: z.object({
                indisponibilidades: z.array(z.any())
            }),
            response: {
                200: z.object({ message: z.string() }),
                500: z.object({ error: z.string() }),
            },
        },
    }, async (request, reply) => {
        const { id } = request.params;
        const { indisponibilidades } = request.body;
        const { error } = await supabase.from('profissionais').update({ indisponibilidades }).eq('id', id);
        if (error) return reply.status(500).send({ error: error.message });
        return reply.send({ message: 'Indisponibilidade updated' });
    });
}
