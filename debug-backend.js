
async function checkEndpoint(name, url) {
    console.log(`\n--- Checking ${name} (${url}) ---`);
    try {
        const response = await fetch(url);
        console.log(`Status: ${response.status} ${response.statusText}`);

        const text = await response.text();
        try {
            const json = JSON.parse(text);
            console.log('Response JSON:', JSON.stringify(json, null, 2));
        } catch (e) {
            console.log('Response Text:', text);
        }
    } catch (error) {
        console.error(`Fetch error: ${error.message}`);
    }
}

async function run() {
    // await checkEndpoint('Plans', 'http://127.0.0.1:3000/planos');
    await checkEndpoint('Stores', 'http://127.0.0.1:3000/lojas');
}

run();
