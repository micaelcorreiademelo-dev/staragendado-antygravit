const axios = require('axios');

async function testAdminLogin() {
    try {
        console.log('🔐 Testando login do admin...\n');

        const response = await axios.post('http://127.0.0.1:3000/auth/login', {
            email: 'admin@staragendado.com',
            password: 'Admin@123'
        });

        console.log('✅ Login bem-sucedido!\n');
        console.log('📋 Dados do usuário:');
        console.log('   - ID:', response.data.user.id);
        console.log('   - Email:', response.data.user.email);
        console.log('   - Nome:', response.data.user.full_name);
        console.log('   - Role:', response.data.user.role);
        console.log('   - Permissões:', JSON.stringify(response.data.user.permissions, null, 2));
        console.log('\n🎉 O login do admin está funcionando corretamente!');

    } catch (error) {
        console.error('❌ Erro ao fazer login:');
        if (error.response) {
            console.error('   - Status:', error.response.status);
            console.error('   - Mensagem:', error.response.data.error || error.response.data);
        } else {
            console.error('   - Erro:', error.message);
        }
        console.log('\n⚠️  O login do admin NÃO está funcionando. Verifique os logs do backend.');
    }
}

testAdminLogin();
