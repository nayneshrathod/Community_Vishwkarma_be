const mongoose = require('mongoose');
require('dotenv').config({ path: '../../.env' }); // Adjust path to .env
const Member = require('../../src/models/Member');
const User = require('../../src/models/User');
const bcrypt = require('bcryptjs');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/community_app_db';

const migrate = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Get all unique familyIds (excluding 'FNew' which is default for new unassigned)
        const members = await Member.find({});
        const familyIds = [...new Set(members.map(m => m.familyId).filter(id => id && id !== 'FNew'))];

        console.log(`Found ${familyIds.length} unique families.`);

        let processedFamilies = 0;
        let usersCreated = 0;
        let primaryUpdated = 0;

        for (const familyId of familyIds) {
            const familyMembers = members.filter(m => m.familyId === familyId);

            if (familyMembers.length === 0) continue;

            // 2. Identify Primary Member
            // Logic:
            // - Prefer explicitly marked 'isPrimary' if exists (and valid) - skip for now as we are migrating
            // - Prefer Male
            // - Prefer No Father in same family (Root)
            // - Oldest

            let candidates = familyMembers;

            // Filter for Root (No father or Father not in list)
            const roots = candidates.filter(m => {
                if (!m.fatherId) return true;
                const fatherInFamily = familyMembers.find(f => f._id.equals ? f._id.equals(m.fatherId) : f._id == m.fatherId);
                return !fatherInFamily;
            });

            if (roots.length > 0) {
                candidates = roots;
            }

            // Prefer Male among candidates
            const males = candidates.filter(m => m.gender === 'Male');
            if (males.length > 0) {
                candidates = males;
            }

            // Pick Oldest
            candidates.sort((a, b) => new Date(a.dob) - new Date(b.dob));
            const primary = candidates[0];

            if (!primary) {
                console.warn(`No primary candidate found for family ${familyId}`);
                continue;
            }

            // 3. Update Members
            // Set primary's isPrimary = true
            if (!primary.isPrimary) {
                primary.isPrimary = true;
                await primary.save();
                primaryUpdated++;
            }

            // Set others isPrimary = false
            for (const m of familyMembers) {
                if (m._id.toString() !== primary._id.toString() && m.isPrimary) {
                    m.isPrimary = false;
                    await m.save();
                }
            }

            // 4. Create User Account
            const existingUser = await User.findOne({
                $or: [{ username: primary.memberId }, { memberId: primary.memberId }]
            });

            if (!existingUser) {
                const hashedPassword = await bcrypt.hash('123456', 10);
                const newUser = new User({
                    username: primary.memberId,
                    password: hashedPassword,
                    role: 'Member',
                    isVerified: true,
                    memberId: primary.memberId,
                    name: `${primary.firstName} ${primary.lastName}`
                });
                await newUser.save();
                usersCreated++;
                console.log(`Created User for Family ${familyId}: ${newUser.username}`);
            }

            processedFamilies++;
        }

        console.log('Migration Complete');
        console.log(`Processed Families: ${processedFamilies}`);
        console.log(`Primary Flags Set: ${primaryUpdated}`);
        console.log(`Users Created: ${usersCreated}`);

        process.exit(0);

    } catch (err) {
        console.error('Migration Failed:', err);
        process.exit(1);
    }
};

migrate();
