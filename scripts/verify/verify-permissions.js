const http = require('http');

function post(path, body, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/auth' + path,
            method: 'POST',
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
        req.write(JSON.stringify(body));
        req.end();
    });
}

function put(path, body, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: '/api/auth' + path,
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        };

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
        req.write(JSON.stringify(body));
        req.end();
    });
}

async function verify() {
    console.log('--- PERMISSION VERIFICATION ---');

    // 1. Login as Admin
    console.log('1. Admin Login...');
    const adminRes = await post('/login', { username: 'admin', password: 'Admin@123' });
    if (adminRes.status !== 200) {
        console.error('Admin Login Failed', adminRes.body);
        return;
    }
    const adminToken = adminRes.body.token;
    console.log('Admin Logged in.');

    // 2. Register/Reset Test User
    // We'll use our existing 'rahul_verma' for testing permissions
    // First, verify his current permissions (should be empty from previous setup)
    console.log('2. User Login (Rahul)...');
    let rahulRes = await post('/login', { username: 'rahul_verma', password: 'password123' });
    if (rahulRes.status !== 200) {
        console.error('Rahul Login Failed', rahulRes.body);
        return;
    }
    console.log('Rahul Initial Permissions:', rahulRes.body.user.permissions);

    // 3. Grant 'committee.view' permission to Rahul
    console.log('3. Granting committee.view...');
    const rahulId = rahulRes.body.user.id;
    const updateRes = await put(`/users/${rahulId}/permissions`, {
        permissions: ['committee.view'],
        role: 'Member'
    }, adminToken);

    if (updateRes.status !== 200) {
        console.error('Update Failed', updateRes.body);
        return;
    }
    console.log('Update Response:', updateRes.body.message);

    // 4. Login Rahul Again and Check Permissions
    console.log('4. Relogin Rahul...');
    rahulRes = await post('/login', { username: 'rahul_verma', password: 'password123' });
    console.log('Rahul New Permissions:', rahulRes.body.user.permissions);

    if (rahulRes.body.user.permissions.includes('committee.view')) {
        console.log('PASS: Permission successfully assigned and returned.');
    } else {
        console.error('FAIL: Permission not found.');
    }

    console.log('--- END ---');
}

verify().catch(console.error);
