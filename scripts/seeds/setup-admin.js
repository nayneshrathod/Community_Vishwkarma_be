const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');

async function createAdmin() {
    console.log('Checking for Admin user in:', usersFile);

    if (!fs.existsSync(dataDir)) {
        console.log('Creating data directory...');
        fs.mkdirSync(dataDir, { recursive: true });
    }

    let users = [];
    if (fs.existsSync(usersFile)) {
        try {
            users = JSON.parse(fs.readFileSync(usersFile));
        } catch (e) {
            console.error('Error reading users file, starting fresh.');
            users = [];
        }
    }

    // Check for existing admin
    let adminUser = users.find(u => u.role === 'Admin' || u.role === 'SuperAdmin');

    // Hash the requested password
    const hashedPassword = await bcrypt.hash('Admin@123', 10);

    if (adminUser) {
        console.log('Admin user found. Updating password...');
        adminUser.password = hashedPassword;
        adminUser.role = 'SuperAdmin'; // Ensure SuperAdmin
        adminUser.permissions = ['login.access']; // Ensure login access
        adminUser.isVerified = true;
    } else {
        console.log('No Admin found. Creating one...');
        adminUser = {
            _id: Date.now().toString(),
            username: 'admin',
            password: hashedPassword,
            name: 'System Admin',
            email: 'admin@community.com',
            mobile: '9999999999',
            role: 'SuperAdmin',
            isVerified: true,
            permissions: ['login.access'],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        users.push(adminUser);
    }

    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    console.log('-------------------------------------------');
    console.log('User Updated Successfully!');
    console.log('Username: admin');
    console.log('Password: Admin@123');
    console.log('Role:     SuperAdmin');
    console.log('-------------------------------------------');
    console.log('Please restart your backend server if it caches data.');
}

createAdmin().catch(err => console.error(err));
