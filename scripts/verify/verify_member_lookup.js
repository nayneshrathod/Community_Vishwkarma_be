const axios = require('axios');
const mongoose = require('mongoose');

const API_URL = 'http://localhost:3001/api';
// Remote DB
const MONGO_URI = 'mongodb+srv://nayneshrathod_db_user:0yTn8X09Xt1GLRiG@cluster0.jjbbirn.mongodb.net/community_app_db';

async function verifyLookup() {
    try {
        console.log('--- Verifying Member Lookup by ID/MemberID ---');

        // 1. Create a Token (Admin)
        await mongoose.connect(MONGO_URI);
        const User = require('../../src/models/User');
        const Member = require('../../src/models/Member');

        const adminUsername = `VerifyAdmin_${Date.now()}`;
        const admin = new User({
            username: adminUsername,
            password: 'password', // plaintext for quick check if no hash hook? Wait, login requires existing user.
            // I'll just create a user and force a token/login.
            // Actually, verify_full_flow.js did login.
            role: 'SuperAdmin',
            isVerified: true
        });
        // We need bcrypt to login via API, or we can just mock the middleware? No, let's do it real.
        const bcrypt = require('bcryptjs');
        admin.password = await bcrypt.hash('password', 10);
        await admin.save();

        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            username: adminUsername,
            password: 'password'
        });
        const token = loginRes.data.token;
        const config = { headers: { Authorization: `Bearer ${token}` } };
        console.log('   [✓] Admin Logged In');

        // 2. Create a Test Member
        const memberData = {
            firstName: 'TestLookup',
            lastName: 'User',
            gender: 'Male',
            maritalStatus: 'Single',
            dob: '1990-01-01',
            mobile: `70${Date.now().toString().slice(-8)}`,
            familyId: 'FNew'
        };
        const createRes = await axios.post(`${API_URL}/members`, memberData, config);
        const member = createRes.data;
        const mongoId = member._id;
        const customId = member.memberId;
        console.log(`   [✓] Created Member: ${customId} (MongoID: ${mongoId})`);

        // 3. Fetch by Mongo ID
        console.log('   Testing fetch by Mongo ID...');
        try {
            const res1 = await axios.get(`${API_URL}/members/${mongoId}`, config);
            if (res1.data.memberId === customId) console.log('   [✓] Fetch by Mongo ID successful');
        } catch (e) {
            console.error('   [X] Fetch by Mongo ID FAILED:', e.message);
        }

        // 4. Fetch by Custom Member ID (The Fix)
        console.log(`   Testing fetch by Custom ID (${customId})...`);
        try {
            const res2 = await axios.get(`${API_URL}/members/${customId}`, config);
            if (res2.data._id === mongoId) console.log('   [✓] Fetch by Custom ID successful');
            else console.log('   [X] Fetched data mismatch:', res2.data);
        } catch (e) {
            console.error('   [X] Fetch by Custom ID FAILED:', e.message);
            if (e.response) console.error(e.response.data);
            throw e;
        }

        // Cleanup
        await User.deleteOne({ _id: admin._id });
        await Member.deleteOne({ _id: mongoId });
        await User.deleteOne({ username: customId }); // Auto-created user
        console.log('\n--- VERIFICATION COMPLETE ---');

    } catch (err) {
        console.error('Test Failed:', err);
    } finally {
        await mongoose.disconnect();
    }
}

verifyLookup();
