require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../../src/models/User');
const Member = require('../../src/models/Member');

// Force real DB
global.useMockDb = false;

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://nayneshrathod_db_user:0yTn8X09Xt1GLRiG@cluster0.jjbbirn.mongodb.net/community_app_db';

async function setup() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Setup Rahul User
        let user = await User.findOne({ username: 'rahul_verma' });
        if (!user) {
            console.log('Creating rahul_verma user...');
            // Simple hash for 'password123'
            const pass = '$2b$10$YourHashHereOrUseAuthRouteToRegister';
            // Better to assume user exists from previous steps or create basics
            // For now, let's assume he exists from previous agent tasks
        }

        if (user) {
            console.log('Updating rahul_verma with memberId: M_TEST_RAHUL');
            user.memberId = 'M_TEST_RAHUL';
            // Make sure he is Member
            user.role = 'Member';
            await user.save();
        } else {
            console.error('User rahul_verma not found! Please register him first.');
        }

        // 2. Setup Rahul Member Profile
        let member = await Member.findOne({ memberId: 'M_TEST_RAHUL' });
        if (!member) {
            console.log('Creating Member Profile for Rahul...');
            member = new Member({
                memberId: 'M_TEST_RAHUL',
                firstName: 'Rahul',
                lastName: 'Verma',
                gender: 'Male',
                dob: new Date('1990-01-01'),
                maritalStatus: 'Single',
                familyId: 'F_TEST_FAMILY_A'
            });
            await member.save();
        }

        // 3. Setup Family Member (Papa)
        let father = await Member.findOne({ memberId: 'M_TEST_PAPA' });
        if (!father) {
            console.log('Creating Father Profile...');
            father = new Member({
                memberId: 'M_TEST_PAPA',
                firstName: 'Papa',
                lastName: 'Verma',
                gender: 'Male',
                dob: new Date('1960-01-01'),
                maritalStatus: 'Married',
                familyId: 'F_TEST_FAMILY_A' // Same family
            });
            await father.save();
        }

        // 4. Setup Stranger
        let stranger = await Member.findOne({ memberId: 'M_TEST_STRANGER' });
        if (!stranger) {
            console.log('Creating Stranger Profile...');
            stranger = new Member({
                memberId: 'M_TEST_STRANGER',
                firstName: 'Stranger',
                lastName: 'Person',
                gender: 'Male',
                dob: new Date('1990-01-01'),
                maritalStatus: 'Single',
                familyId: 'F_TEST_FAMILY_B' // Different family
            });
            await stranger.save();
        }

        console.log('Setup Complete');
        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

setup();
