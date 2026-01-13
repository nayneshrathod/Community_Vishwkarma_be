
// Actually, since this is a backend env, likely no axios installed. I'll use standard http or just require if I can.
// Better: Use 'http' module to be dependency-free.

const http = require('http');

function request(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, body: body ? JSON.parse(body) : {} });
                } catch (e) {
                    resolve({ status: res.statusCode, body });
                }
            });
        });
        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function runTest() {
    console.log('1. Logging in as Admin...');
    const loginRes = await request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, { username: 'admin', password: 'Admin@123' });

    if (loginRes.status !== 200) {
        console.error('Login Failed:', loginRes.body);
        process.exit(1);
    }
    console.log('Login Success. Token acquired.');
    const token = loginRes.body.token;
    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    console.log('2. Fetching Pending Users...');
    const usersRes = await request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/users',
        method: 'GET',
        headers
    });

    console.log('Users API Response:', JSON.stringify(usersRes.body).substring(0, 200) + '...');
    const rahul = usersRes.body.find(u => u.username === 'rahul_verma');
    if (!rahul) {
        console.error('Test User "rahul_verma" not found! Did you run seed-pending-user.js?');
        process.exit(1);
    }
    console.log(`Found User: ${rahul.username} (Verified: ${rahul.isVerified})`);

    if (rahul.isVerified) {
        console.log('User is already verified. Test Complete (Nothing to approve).');
        return;
    }

    console.log('3. Approving User...');
    const approveRes = await request({
        hostname: 'localhost',
        port: 3000,
        path: `/api/auth/approve-user/${rahul._id}`, // Using _id/id mismatch handling if any
        method: 'PUT',
        headers
    }, {
        role: 'Member',
        permissions: ['login.access', 'member.view']
    });

    if (approveRes.status !== 200) {
        console.error('Approval Failed:', approveRes.body);
        process.exit(1);
    }
    console.log('Approval Request Success.');

    console.log('4. Verifying Status...');
    const verifyRes = await request({
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/users',
        method: 'GET',
        headers
    });

    const rahulUpdated = verifyRes.body.find(u => u.username === 'rahul_verma');
    if (rahulUpdated.isVerified) {
        console.log('SUCCESS: User is now Verified!');
        console.log('Permissions:', rahulUpdated.permissions);
    } else {
        console.error('FAILURE: User is still not verified.');
        process.exit(1);
    }
}

runTest().catch(console.error);
