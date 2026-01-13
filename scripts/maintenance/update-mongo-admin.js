const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../../src/models/User');

const MONGO_URI = 'mongodb+srv://nayneshrathod_db_user:0yTn8X09Xt1GLRiG@cluster0.jjbbirn.mongodb.net/community_app_db';

async function updateAdmin() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Force use of Real DB in the model proxy
        global.useMockDb = false;

        const admin = await User.findOne({ username: 'admin' });

        if (!admin) {
            console.log('Admin user not found in MongoDB. Creating...');
            const hashedPwd = await bcrypt.hash('Admin@123', 10);
            await User.create({
                username: 'admin',
                email: 'admin@community.com',
                password: hashedPwd,
                name: 'System Admin',
                role: 'SuperAdmin',
                isVerified: true,
                permissions: ['login.access']
            });
            console.log('Admin created.');
        } else {
            console.log(`Found Admin: ${admin.username} (Role: ${admin.role})`);

            const hashedPwd = await bcrypt.hash('Admin@123', 10);
            admin.password = hashedPwd;
            admin.role = 'SuperAdmin';
            admin.isVerified = true;
            admin.permissions = ['login.access'];

            // If it's a Mongoose document, save it.
            // But User is a Proxy class... 
            // The Proxy static findOne returns a Mongoose Document directly because lines 30: return RealUser.findOne(...args);
            await admin.save();
            console.log('Admin updated to SuperAdmin / Admin@123');
        }

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected');
    }
}

updateAdmin();
