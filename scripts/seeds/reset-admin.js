const mongoose = require('mongoose');
const User = require('../../src/models/User');
const bcrypt = require('bcryptjs');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/community_app_db')
    .then(async () => {
        console.log('Connected to MongoDB');

        let user = await User.findOne({ username: 'admin' });
        if (!user) {
            console.log('Admin user not found, creating...');
            user = new User({
                username: 'admin',
                role: 'Admin',
                name: 'Admin User'
            });
        }

        const hashedPassword = await bcrypt.hash('Admin@123', 10);
        user.password = hashedPassword;
        await user.save();
        console.log('Admin password reset to: Admin@123');

        mongoose.disconnect();
    })
    .catch(err => {
        console.error(err);
        mongoose.disconnect();
    });
