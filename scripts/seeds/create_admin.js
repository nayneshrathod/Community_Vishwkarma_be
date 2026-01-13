const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../../src/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/community_app_db';

async function createAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        const username = 'admin';
        const password = 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);

        let user = await User.findOne({ username });

        if (user) {
            console.log('Admin user exists. Updating role to SuperAdmin...');
            user.role = 'SuperAdmin';
            user.isVerified = true;
            user.password = hashedPassword; // Reset password to be sure
            await user.save();
            console.log('Admin user updated.');
        } else {
            console.log('Creating new Admin user...');
            user = new User({
                username,
                password: hashedPassword,
                name: 'System Admin',
                mobile: '0000000000',
                email: 'admin@system.local',
                role: 'SuperAdmin',
                isVerified: true,
                permissions: [] // SuperAdmin implies all
            });
            await user.save();
            console.log('Admin user created.');
        }

        mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err);
    }
}

createAdmin();
