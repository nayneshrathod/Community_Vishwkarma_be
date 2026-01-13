const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function checkMembers() {
    try {
        await mongoose.connect(MONGO_URI);
        const db = mongoose.connection.db;
        const members = await db.collection('members').find({}).toArray();

        console.log(`Total Members: ${members.length}`);
        members.slice(0, 5).forEach(m => {
            console.log(`- _id: ${m._id}, memberId: ${m.memberId}, Name: ${m.firstName} ${m.lastName}`);
        });

        // Check for specific IDs from the funds
        const fundMemberIds = ['69498d7083e75ededf608675', '69498d7083e75ededf60866a'];
        console.log('\nChecking for Fund Member IDs:');
        fundMemberIds.forEach(id => {
            // Try matching as string and ObjectId
            // Note: MongoDB driver returns _id as ObjectId, need to compare string wise
            const match = members.find(m => m._id.toString() === id);
            console.log(`- ID ${id}: ${match ? 'FOUND (' + match.firstName + ')' : 'NOT FOUND'}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkMembers();
