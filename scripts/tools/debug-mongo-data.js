require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../../src/models/User');
const Member = require('../../src/models/Member');

// Force real DB behavior for Proxy
global.useMockDb = false;

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://nayneshrathod_db_user:0yTn8X09Xt1GLRiG@cluster0.jjbbirn.mongodb.net/community_app_db';

async function debug() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        const user = await User.findOne({ username: 'rahul_verma' });
        console.log('User:', user ? {
            username: user.username,
            role: user.role,
            memberId: user.memberId,
            _id: user._id
        } : 'Not Found');

        if (user && user.memberId) {
            const member = await Member.findOne({ memberId: user.memberId });
            console.log('Member:', member ? {
                firstName: member.firstName,
                memberId: member.memberId,
                familyId: member.familyId
            } : 'Member Profile Not Found');

            if (member && member.familyId) {
                const familyMembers = await Member.find({ familyId: member.familyId });
                console.log(`Found ${familyMembers.length} members in family ${member.familyId}:`, familyMembers.map(m => m.firstName));
            }
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

debug();
