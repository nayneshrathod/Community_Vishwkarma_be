const mongoose = require('mongoose');
require('dotenv').config();
const BoardMember = require('../../src/models/BoardMember');

const currentMembers = [
    {
        name: 'Shri. Amit Vishwakarma',
        role: 'President', // Should be 1st
        year: '2025',
        contact: '9876543210',
        city: 'Mumbai',
        description: 'Leading the community with vision.'
    },
    {
        name: 'Shri. Rahul Sharma',
        role: 'Vice President', // Should be 2nd
        year: '2025',
        contact: '9876543211',
        city: 'Pune'
    },
    {
        name: 'Shri. Sunil Sutar',
        role: 'Secretary', // Should be 3rd
        year: '2025',
        contact: '9876543212',
        city: 'Nashik'
    },
    {
        name: 'Shri. Vijay Panchal',
        role: 'Treasurer', // Should be 4th
        year: '2025',
        contact: '9876543213',
        city: 'Thane'
    },
    {
        name: 'Shri. Deepak Mistry',
        role: 'Committee Member', // Should be last
        year: '2025',
        contact: '9876543214',
        city: 'Nagpur'
    }
];

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/community_db')
    .then(async () => {
        console.log('Connected to MongoDB');

        // Optional: Clear existing 2025 data to avoid duplicates if re-run
        await BoardMember.deleteMany({ year: '2025' });
        console.log('Cleared existing 2025 data');

        for (const member of currentMembers) {
            await BoardMember.create(member);
            console.log(`Added: ${member.name} as ${member.role}`);
        }

        console.log('Seed completed successfully');
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
