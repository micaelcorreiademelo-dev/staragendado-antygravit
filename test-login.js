// Test script para verificar login
// Execute com: node test-login.js

const axios = require('axios');

const API_URL = 'http://localhost:3000';

async function testLogin() {
    console.log('🔍 Testando login...\n');

    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@staragendado.com',
            password: 'Admin@123'
        });

        console.log('✅ Login bem-sucedido!');
        console.log('\n📦 Resposta:');
        console.log(JSON.stringify(response.data, null, 2));

        if (response.data.session && response.data.session.access_token) {
            console.log('\n🔑 Token de acesso recebido!');
            console.log('Token:', response.data.session.access_token.substring(0, 50) + '...');
        }

    } catch (error) {
        console.log('❌ Erro no login:');

        if (error.response) {
            console.log('Status:', error.response.status);
            console.log('Erro:', error.response.data);
        } else if (error.request) {
            console.log('❌ Backend não está respondendo!');
            console.log('Certifique-se de que o backend está rodando em', API_URL);
        } else {
            console.log('Erro:', error.message);
        }
    }
}

// Verificar se o backend está online
async function checkBackend() {
    console.log('🔍 Verificando se o backend está online...\n');

    try {
        const response = await axios.get(`${API_URL}/docs`);
        console.log('✅ Backend está rodando!\n');
        return true;
    } catch (error) {
        console.log('❌ Backend NÃO está rodando!');
        console.log('Execute: cd backend && npm run dev\n');
        return false;
    }
}

async function main() {
    console.log('='.repeat(50));
    console.log('  TESTE DE LOGIN - StarAgendado');
    console.log('='.repeat(50));
    console.log('');

    const backendOnline = await checkBackend();

    if (backendOnline) {
        await testLogin();
    }

    console.log('\n' + '='.repeat(50));
}

main();
