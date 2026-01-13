const mongoose = require('mongoose');
require('dotenv').config();

const CLOUD_URI = process.env.MONGO_URI;
const LOCAL_URI = 'mongodb://127.0.0.1:27017/community_app_db';

async function checkDB(uri, name) {
    try {
        const conn = await mongoose.createConnection(uri).asPromise();
        const users = await conn.collection('users').countDocuments();
        const members = await conn.collection('members').countDocuments();
        const admin = await conn.collection('users').findOne({ username: 'admin' });
        console.log(`\n--- ${name} Database ---`);
        console.log(`URI: ${uri.includes('localhost') || uri.includes('127.0.0.1') ? 'Localhost' : 'Cloud Atlas'}`);
        console.log(`Users: ${users}`);
        console.log(`Members: ${members}`);
        console.log(`Admin User Exists: ${!!admin}`);
        await conn.close();
    } catch (err) {
        console.log(`\n--- ${name} Database ---`);
        console.log(`Could not connect: ${err.message}`);
    }
}

async function compare() {
    console.log('Comparing Databases...');
    await checkDB(CLOUD_URI, 'CURRENT (Cloud)');
    await checkDB(LOCAL_URI, 'LOCAL (Screenshot)');
    process.exit(0);
}

compare();
