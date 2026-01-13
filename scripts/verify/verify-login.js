const http = require('http');

function login(username, password) {
    const data = JSON.stringify({ username, password });

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/auth/login',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
            console.log(`Status: ${res.statusCode}`);
            console.log('Body:', body);
        });
    });

    req.on('error', error => {
        console.error('Error:', error);
    });

    req.write(data);
    req.end();
}

console.log('Attempting login with admin/Admin@123...');
login('admin', 'Admin@123');
