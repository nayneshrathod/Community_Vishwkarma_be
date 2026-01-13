const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../src/models/User');

const MONGO_URI = 'mongodb+srv://nayneshrathod_db_user:0yTn8X09Xt1GLRiG@cluster0.jjbbirn.mongodb.net/community_app_db';

async function seedPending() {
    try {
        await mongoose.connect(MONGO_URI);
        global.useMockDb = false;

        const username = 'rahul_verma';
        const existing = await User.findOne({ username });
        if (existing) {
            console.log('User rahul_verma already exists. Deleting to re-seed pending state...');
            await User.deleteOne({ username });
        }

        const hashedPwd = await bcrypt.hash('password123', 10);
        const newUser = new User({
            username,
            password: hashedPwd,
            name: 'Rahul Verma',
            email: 'rahul@example.com',
            mobile: '9876543210',
            role: 'Member',
            isVerified: false,
            permissions: []
        });
        await newUser.save();

        console.log('Pending User Seeded: rahul_verma');

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

seedPending();
