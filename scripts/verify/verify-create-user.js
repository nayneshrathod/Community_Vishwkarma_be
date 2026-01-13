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

async function verify() {
    console.log('--- CREATE USER VERIFICATION ---');

    // 1. Login as Admin (SuperAdmin)
    console.log('1. SuperAdmin Login...');
    const adminRes = await post('/login', { username: 'admin', password: 'Admin@123' });
    if (adminRes.status !== 200) {
        console.error('Admin Login Failed', adminRes.body);
        return;
    }
    const token = adminRes.body.token;
    console.log('SuperAdmin Logged in.');

    // 2. Create New Admin User
    const newAdminUser = {
        username: `newadmin_${Date.now()}`,
        password: 'password123',
        name: 'New Admin User',
        email: `newadmin_${Date.now()}@example.com`,
        mobile: '9876543210',
        role: 'Admin'
    };

    console.log(`2. Creating User: ${newAdminUser.username}...`);
    const createRes = await post('/create-user', newAdminUser, token);

    if (createRes.status === 201) {
        console.log('PASS: User created successfully.', createRes.body);
    } else {
        console.error('FAIL: User creation failed.', createRes.body);
    }

    // 3. Verify New User Login
    console.log('3. Verifying New User Login...');
    const loginRes = await post('/login', { username: newAdminUser.username, password: newAdminUser.password });

    if (loginRes.status === 200) {
        console.log('PASS: New Admin logged in successfully.');
        if (loginRes.body.user.role === 'Admin' && loginRes.body.user.isVerified) {
            console.log('PASS: User Role and Verification Status correct.');
        } else {
            console.error('FAIL: Indirect User Check failed', loginRes.body.user);
        }
    } else {
        console.error('FAIL: New User Login Failed', loginRes.body);
    }

    console.log('--- END ---');
}

verify().catch(console.error);
