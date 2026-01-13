const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../src/models/User');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/community_app_db';

async function seedAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');

        const username = 'admin';
        const password = 'Admin@123';
        const email = 'admin@community.com';

        let user = await User.findOne({ username });

        const hashedPassword = await bcrypt.hash(password, 10);

        if (user) {
            console.log('Admin user exists. Updating password and role...');
            user.password = hashedPassword;
            user.role = 'SuperAdmin';
            user.isVerified = true;
            user.permissions = ['member.view', 'member.create', 'committee.view', 'committee.create', 'funds.view', 'funds.create']; // basic permissions
            await user.save();
            console.log('Admin user updated successfully.');
        } else {
            console.log('Creating new Admin user...');
            user = new User({
                username,
                password: hashedPassword,
                email,
                role: 'SuperAdmin',
                isVerified: true,
                name: 'Super Admin',
                mobile: '0000000000',
                permissions: ['member.view', 'member.create', 'committee.view', 'committee.create', 'funds.view', 'funds.create']
            });
            await user.save();
            console.log('Admin user created successfully.');
        }

        console.log(`Credentials -> Username: ${username}, Password: ${password}`);
        process.exit(0);
    } catch (err) {
        console.error('Error seeding admin:', err);
        process.exit(1);
    }
}

seedAdmin();
