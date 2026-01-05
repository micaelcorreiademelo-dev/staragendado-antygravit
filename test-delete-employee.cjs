const axios = require('axios');

async function testDelete() {
    try {
        console.log('🔐 Logging in as admin...');
        const loginRes = await axios.post('http://127.0.0.1:3000/auth/login', {
            email: 'admin@staragendado.com',
            password: 'Admin@123'
        });
        const token = loginRes.data.session.access_token;
        console.log('✅ Login successful');

        console.log('➕ Creating dummy employee to delete...');
        const createRes = await axios.post(
            'http://127.0.0.1:3000/employees',
            {
                full_name: 'Delete Me',
                email: 'delete.me.test@staragendado.com',
                password: 'password123',
                permissions: { dashboard: true },
                role: 'admin'
            },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        const empId = createRes.data.id;
        console.log(`✅ Dummy employee created: ${empId}`);

        console.log(`🗑️ Deleting employee ${empId}...`);
        const deleteRes = await axios.delete(
            `http://127.0.0.1:3000/employees/${empId}`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('✅ Delete response:', deleteRes.data);
        console.log('🎉 DELETE API IS WORKING CORRECTLY!');

    } catch (error) {
        console.error('❌ Error testing delete:');
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', error.response.data);
        } else {
            console.error('   Message:', error.message);
        }
    }
}

testDelete();
