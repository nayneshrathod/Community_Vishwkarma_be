const http = require('http');

function request(path, method, token) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3002,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

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
        req.end();
    });
}

function post(path, body) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3002,
            path: '/api' + path,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
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
    console.log('--- START VERIFICATION ---');

    console.log('1. Logging in as Rahul (Member)...');
    const rahulLogin = await post('/auth/login', { username: 'rahul_verma', password: 'password123' });
    if (rahulLogin.status !== 200) {
        console.error('Rahul Login Failed:', rahulLogin.body);
        return;
    }
    const rahulToken = rahulLogin.body.token;
    console.log('Rahul Logged in.');

    console.log('2. Fetching Members as Rahul...');
    const rahulMembers = await request('/members', 'GET', rahulToken);

    // Check Analysis
    const rahulNames = rahulMembers.body.map(m => m.firstName);
    console.log('Members visible to Rahul:', rahulNames);

    if (rahulNames.includes('Strange') || rahulNames.includes('Stranger')) {
        console.error('FAIL: Rahul can see Stranger!');
    } else if (rahulNames.includes('Rahul') && rahulNames.includes('Papa')) {
        console.log('PASS: Rahul sees family members only.');
    } else {
        console.warn('WARN: Rahul sees:', rahulNames);
    }

    console.log('------------------------------------------------');

    console.log('3. Logging in as Admin...');
    const adminLogin = await post('/auth/login', { username: 'admin', password: 'Admin@123' });
    if (adminLogin.status !== 200) {
        console.error('Admin Login Failed:', adminLogin.body);
        return;
    }
    const adminToken = adminLogin.body.token;
    console.log('Admin Logged in.');

    console.log('4. Fetching Members as Admin...');
    const adminMembers = await request('/members', 'GET', adminToken);
    const adminNames = adminMembers.body.map(m => m.firstName);
    console.log('Members visible to Admin:', adminNames);

    if (adminNames.includes('Stranger') && adminNames.includes('Rahul')) {
        console.log('PASS: Admin sees everyone.');
    } else {
        console.error('FAIL: Admin missing members.', adminNames);
    }

    console.log('--- END VERIFICATION ---');
}

verify().catch(console.error);
