const fs = require('fs');
const path = require('path');

const usersFile = path.join(__dirname, 'data/users.json');

function cleanupUsers() {
    console.log('Cleaning up users.json...');
    if (!fs.existsSync(usersFile)) {
        console.log('No users file found.');
        return;
    }

    let users = [];
    try {
        users = JSON.parse(fs.readFileSync(usersFile));
    } catch (e) {
        console.error('Error reading users file.');
        return;
    }

    console.log(`Initial User Count: ${users.length}`);

    // Filter out ALL users with username 'admin'
    const nonAdmins = users.filter(u => u.username !== 'admin');

    // Find the LAST added admin (which is likely the one we created with 'SuperAdmin' and 'Admin@123')
    // OR just creating a fresh one is safer to be sure.
    // Let's keep the one that has role 'SuperAdmin'.
    const correctAdmin = users.reverse().find(u => u.username === 'admin' && u.role === 'SuperAdmin');

    if (correctAdmin) {
        console.log('Found correct SuperAdmin user. Keeping it.');
        nonAdmins.unshift(correctAdmin); // Put it at the beginning
    } else {
        console.log('No correct SuperAdmin found during cleanup! Please run setup-admin.js again after this.');
    }

    fs.writeFileSync(usersFile, JSON.stringify(nonAdmins, null, 2));
    console.log(`Final User Count: ${nonAdmins.length}`);
    console.log('Cleanup Complete.');
}

cleanupUsers();
