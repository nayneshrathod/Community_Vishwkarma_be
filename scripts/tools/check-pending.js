const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function checkPendingUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const db = mongoose.connection.db;
        const users = await db.collection('users').find({ isVerified: false }).toArray();

        console.log(`Pending (Unverified) Users: ${users.length}`);
        users.forEach(u => {
            console.log(`- Username: ${u.username}, Email: ${u.email}, Role: ${u.role}, MemberID: ${u.memberId}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkPendingUsers();
