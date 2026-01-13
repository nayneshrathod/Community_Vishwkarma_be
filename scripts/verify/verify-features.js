const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function runTests() {
    try {
        console.log('--- Starting Verification ---');

        // 1. Login as Admin
        console.log('\n[1] Logging in as Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            username: 'admin',
            password: 'Admin@123'
        });

        if (!loginRes.data.token) throw new Error('Login failed: No token');
        const token = loginRes.data.token;
        const headers = { Authorization: `Bearer ${token}` };
        console.log('✅ Login Successful');

        // 2. Test Board Member - Range Year
        console.log('\n[2] Adding PROPOSED Board Member (Range Year)...');
        const boardRange = {
            year: '2020-2022',
            role: 'Secretary',
            name: 'Test Secretary',
            description: 'Served for 2 years dedicatedly.',
            city: 'Mumbai',
            contact: '9876543210'
        };
        // Use FormData simulation since endpoint uses multer
        // Actually, axios handles this better if we don't use FormData object directly in node if not uploading files, 
        // but backend expects multipart/form-data logic if upload.single is used?
        // Express multer will just ignore file if not present but body parser for json might not work if content-type is json
        // WAIT: Multer middleware processes multipart/form-data. If I send JSON, req.body might be empty if body-parser json is not used, 
        // BUT server.js has `app.use(bodyParser.json())`. 
        // Let's try sending JSON first. If multer logic requires multipart, we'll see.
        // Correction: Multer populates req.body ONLY for multipart forms. If I send JSON, it might skip multer body parsing and use body-parser.
        // Let's assume standard JSON works if no file, OR force multipart.

        // Actually best to force multipart to be safe as usually endpoints with upload.single expect it.
        // We will skip file upload for simplicity or mock it if needed.
        // Let's try axios JSON post first, typically modern setups handle both if configured right.

        try {
            await axios.post(`${API_URL}/board`, boardRange, { headers });
            console.log('✅ Added Range Year Board Member');
        } catch (e) {
            console.warn('⚠️ JSON Post failed, trying verify if it was multer issue: ' + e.message);
        }

        // 3. Test Board Member - Single Year
        console.log('\n[3] Adding PROPOSED Board Member (Single Year)...');
        const boardSingle = {
            year: '2023',
            role: 'Treasurer',
            name: 'Test Treasurer',
            description: 'Managed finances 2023.',
            city: 'Pune'
        };
        await axios.post(`${API_URL}/board`, boardSingle, { headers });
        console.log('✅ Added Single Year Board Member');


        // 4. Verify Board Data
        console.log('\n[4] Verifying Board Data retrieval...');
        const boardRes = await axios.get(`${API_URL}/board`);
        const members = boardRes.data;
        console.log('DEBUG: Fetched Members:', JSON.stringify(members, null, 2));

        const rangeMember = members.find(m => m.year === '2020-2022' && m.name === 'Test Secretary');
        const singleMember = members.find(m => m.year === '2023' && m.name === 'Test Treasurer');

        if (rangeMember && rangeMember.description === 'Served for 2 years dedicatedly.') {
            console.log('✅ Verified Range Member & Description: FOUND');
        } else {
            console.error('❌ Failed to verify Range Member');
        }

        if (singleMember) {
            console.log('✅ Verified Single Year Member: FOUND');
        } else {
            console.error('❌ Failed to verify Single Year Member');
        }


        // 5. Test Notice Creation
        console.log('\n[5] Creating Test Notice...');
        const noticeData = {
            title: 'Test General Notice',
            message: 'This is a test notice from verification script.',
            type: 'General',
            target: 'All'
        };
        await axios.post(`${API_URL}/notices`, noticeData, { headers });
        console.log('✅ Notice Created');

        // 6. Verify Notices
        console.log('\n[6] Verifying Notices...');
        const noticeRes = await axios.get(`${API_URL}/notices/my-notices`, { headers });
        const notices = noticeRes.data;
        const foundNotice = notices.find(n => n.title === 'Test General Notice');

        if (foundNotice) {
            console.log('✅ Verified Notice Retrieval: FOUND');
        } else {
            console.error('❌ Failed to verify Notice Retrieval');
        }

        console.log('\n--- Verification Complete ---');

    } catch (err) {
        console.error('FATAL ERROR:', err.response ? err.response.data : err.message);
    }
}

runTests();
