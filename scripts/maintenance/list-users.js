const mongoose = require('mongoose');
const User = require('../../src/models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/community_app_db';

async function listUsers() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');

        const users = await User.find({}, 'username email role isVerified mobile'); // Select specific fields
        console.log('--- Existing Users ---');
        console.table(users.map(u => ({
            id: u._id.toString(),
            username: u.username,
            role: u.role,
            verified: u.isVerified,
            mobile: u.mobile
        })));
        console.log('----------------------');

        process.exit(0);
    } catch (err) {
        console.error('Error listing users:', err);
        process.exit(1);
    }
}

listUsers();
