const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI;

async function checkFunds() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to DB');

        // Define minimal schema to read 'funds' collection
        // Note: The collection name in Atlas might be 'funds' or 'donations' depending on the model.
        // Let's list collections first to be sure, then query.
        const db = mongoose.connection.db;
        const collections = await db.listCollections().toArray();
        const fundCol = collections.find(c => c.name === 'funds' || c.name === 'donations');

        if (!fundCol) {
            console.log('No funds/donations collection found!');
        } else {
            console.log(`Found collection: ${fundCol.name}`);
            const funds = await db.collection(fundCol.name).find({}).toArray();
            console.log(`Total Funds/Donations: ${funds.length}`);
            funds.forEach(f => {
                console.log(`- Amount: ${f.amount}, Type: ${f.type}, MemberID: ${f.memberId}, Date: ${f.date}`);
            });
        }
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkFunds();
