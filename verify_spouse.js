const mongoose = require('mongoose');
const Member = require('./src/models/Member');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/community_app_db')
.then(async () => {
    console.log('Connected');
    const member = await Member.findOne({ maritalStatus: 'Married' }).sort({ createdAt: -1 });
    console.log('Member:', member ? member.firstName : 'None');
    console.log('Spouse Name:', member ? member.spouseName : 'None');
    console.log('Spouse Middle:', member ? member.spouseMiddleName : 'None');
    console.log('Spouse Last:', member ? member.spouseLastName : 'None');
    console.log('Spouse Full Name (DB):', member ? member.spouseFullName : 'MISSING');
    process.exit();
})
.catch(err => {
    console.error(err);
    process.exit(1);
});
