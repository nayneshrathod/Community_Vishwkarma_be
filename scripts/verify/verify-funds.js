const http = require('http');

function request(method, path, body, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    resolve({ status: res.statusCode, body: json });
                } catch (e) {
                    resolve({ status: res.statusCode, body: data });
                }
            });
        });

        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function verify() {
    console.log('--- FUND MANAGEMENT VERIFICATION ---');

    // 1. Login as Admin
    console.log('1. Admin Login...');
    const adminRes = await request('POST', '/auth/login', { username: 'admin', password: 'Admin@123' });
    if (adminRes.status !== 200) {
        console.error('Admin Login Failed', adminRes.body);
        return;
    }
    const token = adminRes.body.token;
    console.log('Admin Logged in.');

    // 2. Fetch Members to get an ID
    console.log('2. Fetching Members...');
    const membersRes = await request('GET', '/members', null, token);
    const memberId = membersRes.body[0]?._id; // Assumes at least one member
    if (!memberId) {
        console.error('No members found to assign fund to.');
        return; // Can't proceed
    }
    console.log(`Using Member ID: ${memberId}`);

    // 3. Add Fund (Admin)
    const fundData = {
        memberId: memberId,
        amount: 5001,
        type: 'Temple',
        date: new Date().toISOString(),
        description: 'Test Donation'
    };
    console.log('3. Adding Fund...');
    const addRes = await request('POST', '/funds', fundData, token);
    if (addRes.status === 201) {
        console.log('PASS: Fund added successfully.', addRes.body);
    } else {
        console.error('FAIL: Fund add failed.', addRes.body);
    }

    // 4. Get Funds (Public/Member)
    console.log('4. fetching Funds...');
    const getRes = await request('GET', '/funds', null, null);
    if (getRes.status === 200 && Array.isArray(getRes.body)) {
        const found = getRes.body.find(f => f.amount === 5001);
        if (found) {
            console.log('PASS: Fund found in list.');
        } else {
            console.error('FAIL: Fund NOT found in list.', getRes.body);
        }
    } else {
        console.error('FAIL: Get Funds failed.', getRes.body);
    }

    console.log('--- END ---');
}

verify().catch(console.error);
