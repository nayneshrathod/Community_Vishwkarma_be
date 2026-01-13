const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');

async function createPendingUser() {
    console.log('Adding a Pending User to:', usersFile);

    let users = [];
    if (fs.existsSync(usersFile)) {
        try {
            users = JSON.parse(fs.readFileSync(usersFile));
        } catch (e) {
            users = [];
        }
    }

    // Check if demo user exists
    if (users.find(u => u.username === 'rahul_verma')) {
        console.log('Demo user "rahul_verma" already exists.');
        return;
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    const pendingUser = {
        _id: Date.now().toString(),
        username: 'rahul_verma',
        password: hashedPassword,
        name: 'Rahul Verma',
        email: 'rahul@example.com',
        mobile: '9876543210',
        role: 'Member',
        isVerified: false, // PENDING APPROVAL
        permissions: [],
        createdAt: new Date(),
        updatedAt: new Date()
    };

    users.push(pendingUser);
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    console.log('-------------------------------------------');
    console.log('Pending User Created Successfully!');
    console.log('Name:     Rahul Verma');
    console.log('Username: rahul_verma');
    console.log('Status:   Pending Approval');
    console.log('-------------------------------------------');
}

createPendingUser().catch(err => console.error(err));
