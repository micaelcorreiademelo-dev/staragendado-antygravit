import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { jsonSchemaTransform, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import dotenv from 'dotenv';
import { authRoutes } from './routes/auth.routes';
import { plansRoutes } from './routes/plans.routes';
import { storesRoutes } from './routes/stores.routes';
import { professionalsRoutes } from './routes/professionals.routes';
import { servicesRoutes } from './routes/services.routes';
import { appointmentsRoutes } from './routes/appointments.routes';
import { logsRoutes } from './routes/logs.routes';
import { usersRoutes } from './routes/users.routes';
import { employeesRoutes } from './routes/employees.routes';
import { segmentsRoutes } from './routes/segments.routes';

dotenv.config();

const app = Fastify({
    logger: true
});

// Diagnostic Log for Supabase Keys
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log('---------------------------------------------------');
console.log('🔍 SUPABASE KEY DIAGNOSTIC:');
console.log(`SERVICE_ROLE_KEY Present? ${serviceKey ? 'YES ✅' : 'NO ❌'}`);
console.log(`SERVICE_ROLE_KEY Length: ${serviceKey ? serviceKey.length : 0}`);
console.log('---------------------------------------------------');

app.setErrorHandler((error, request, reply) => {
    console.error('❌ GLOBAL ERROR HANDLER:', error);
    reply.status(error.statusCode || 500).send({ error: error.message });
});

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.get('/debug-env', async () => {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    return {
        service_role_key_exists: !!key,
        service_role_key_length: key ? key.length : 0,
        is_anon_key: key === process.env.SUPABASE_ANON_KEY
    };
});

app.register(cors, {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
});

app.register(swagger, {
    openapi: {
        info: {
            title: 'StarAgendado API',
            description: 'API for StarAgendado SaaS',
            version: '1.0.0',
        },
        servers: [],
    },
    transform: jsonSchemaTransform,
});

app.register(swaggerUi, {
    routePrefix: '/docs',
});

app.register(authRoutes);
app.register(plansRoutes);
app.register(storesRoutes);
app.register(professionalsRoutes);
app.register(servicesRoutes);
app.register(appointmentsRoutes);
app.register(logsRoutes);
app.register(usersRoutes);
app.register(employeesRoutes);
app.register(segmentsRoutes);

const start = async () => {
    try {
        await app.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' });
        console.log(`Server listening on port ${process.env.PORT || 3000}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();
