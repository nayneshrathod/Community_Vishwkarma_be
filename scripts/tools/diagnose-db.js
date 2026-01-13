const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/community_app_db';

async function diagnose() {
    try {
        console.log(`Connecting to: ${MONGO_URI}`);
        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected Successfully');

        const db = mongoose.connection.db;
        const dbName = db.databaseName;
        console.log(`Current Database Name: [${dbName}]`);

        const collections = await db.listCollections().toArray();
        console.log('\nCollections found:');

        if (collections.length === 0) {
            console.log(' - NO COLLECTIONS FOUND inside this database.');
        } else {
            for (const col of collections) {
                const count = await db.collection(col.name).countDocuments();
                console.log(` - ${col.name}: ${count} documents`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Connection Failed:', err);
        process.exit(1);
    }
}

diagnose();
