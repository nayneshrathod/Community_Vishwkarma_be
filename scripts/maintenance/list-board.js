const mongoose = require('mongoose');
require('dotenv').config();
const BoardMember = require('../../src/models/BoardMember');

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/community_db')
    .then(async () => {
        console.log('Connected to MongoDB');

        const members = await BoardMember.find({}).sort({ year: -1 });
        console.log('Current Board Members:');
        members.forEach(m => {
            console.log(`- [${m.year}] ${m.name} (${m.role})`);
        });

        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
