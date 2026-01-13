
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:3000/api';
const IMAGE_PATH = path.join(__dirname, 'test_image.jpg');

async function runTest() {
    try {
        console.log('>>> STARTING INDIAN FAMILY VERIFICATION <<<\n');

        // 0. Login
        console.log('1. Logging in as Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        console.log(`   [✓] Logged in.`);

        const TS = Date.now();

        // Data Configuration
        const LAST_NAME = 'Patil';
        const HEAD_FIRST = `Rajesh_${TS}`;
        const SPOUSE_FIRST = `Sunita_${TS}`;
        const CHILD_FIRST = `Amit_${TS}`;
        const CHILD_SPOUSE_FIRST = `Priya_${TS}`;

        const LOCATION = {
            state: 'Maharashtra',
            district: 'Pune',
            taluka: 'Haveli',
            village: 'Wagholi',
            pincode: '412207'
        };

        // 1. Create Main Member (Head)
        console.log('\n2. Creating Head: Rajesh Patil (with Location & Photos)...');
        const mainForm = new FormData();
        mainForm.append('firstName', HEAD_FIRST);
        mainForm.append('lastName', LAST_NAME);
        mainForm.append('gender', 'Male');
        mainForm.append('dob', '1975-06-15');
        mainForm.append('maritalStatus', 'Married');
        mainForm.append('familyId', 'FNew');
        mainForm.append('spouseName', SPOUSE_FIRST);
        mainForm.append('spouseLastName', LAST_NAME); // Optional

        // Location Data
        mainForm.append('state', LOCATION.state);
        mainForm.append('district', LOCATION.district);
        mainForm.append('city', LOCATION.taluka); // Mapping 'city' to Taluka/City
        mainForm.append('village', LOCATION.village);
        mainForm.append('pincode', LOCATION.pincode);

        // Photos
        mainForm.append('photo', fs.createReadStream(IMAGE_PATH));
        mainForm.append('spousePhoto', fs.createReadStream(IMAGE_PATH));

        const mainRes = await axios.post(`${API_URL}/members`, mainForm, { headers: { 'Authorization': `Bearer ${token}`, ...mainForm.getHeaders() } });
        const mainMember = mainRes.data;
        console.log(`   [✓] Created Head: ${mainMember.firstName} ${mainMember.lastName} (${mainMember.memberId})`);
        console.log(`       Location: ${mainMember.state}, ${mainMember.district}, ${mainMember.city || mainMember.taluka}, ${mainMember.village}`);

        // 2. Create Child
        console.log('\n3. Creating Child: Amit Patil...');
        const childForm = new FormData();
        childForm.append('firstName', CHILD_FIRST);
        childForm.append('lastName', LAST_NAME);
        childForm.append('gender', 'Male');
        childForm.append('dob', '2000-08-20');
        childForm.append('maritalStatus', 'Single');
        childForm.append('fatherId', mainMember.id || mainMember._id);
        childForm.append('familyId', mainMember.familyId); // Inheritance

        // Location (Usually inherited or same, but sending explicitly to check)
        childForm.append('state', LOCATION.state);
        childForm.append('district', LOCATION.district);
        childForm.append('city', LOCATION.taluka);

        childForm.append('photo', fs.createReadStream(IMAGE_PATH));

        const childRes = await axios.post(`${API_URL}/members`, childForm, { headers: { 'Authorization': `Bearer ${token}`, ...childForm.getHeaders() } });
        const childMember = childRes.data;
        console.log(`   [✓] Created Child: ${childMember.firstName}`);

        // 3. Child Marriage (Priya)
        console.log('\n4. Amit marries Priya (Adding Child Spouse)...');
        const dilForm = new FormData();
        dilForm.append('firstName', CHILD_SPOUSE_FIRST);
        dilForm.append('lastName', LAST_NAME); // Takes husband's name
        dilForm.append('gender', 'Female');
        dilForm.append('dob', '2002-02-14');
        dilForm.append('maritalStatus', 'Married');
        dilForm.append('spouseId', childMember.id || childMember._id);
        dilForm.append('familyId', mainMember.familyId); // Joins the family
        dilForm.append('spouseName', CHILD_FIRST); // Husband's name

        dilForm.append('photo', fs.createReadStream(IMAGE_PATH));

        const dilRes = await axios.post(`${API_URL}/members`, dilForm, { headers: { 'Authorization': `Bearer ${token}`, ...dilForm.getHeaders() } });
        const dilMember = dilRes.data;
        console.log(`   [✓] Created Spouse: ${dilMember.firstName}`);

        // 4. Update Child Link
        console.log(`\n5. Linking Priya to Amit...`);
        const updateChild = new FormData();
        updateChild.append('maritalStatus', 'Married');
        updateChild.append('spouseId', dilMember.id || dilMember._id);
        updateChild.append('spouseName', CHILD_SPOUSE_FIRST);

        await axios.put(`${API_URL}/members/${childMember.id || childMember._id}`, updateChild, { headers: { 'Authorization': `Bearer ${token}`, ...updateChild.getHeaders() } });
        console.log(`   [✓] Linked.`);

        // 5. Verification
        console.log('\n6. Verifying Family Integrity...');
        const fetchRes = await axios.get(`${API_URL}/members?familyId=${mainMember.familyId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const family = fetchRes.data.data || fetchRes.data;

        console.log(`   [DEBUG] Family Count: ${family.length}`);
        family.forEach(m => {
            console.log(`   - ${m.firstName} ${m.lastName} (${m.memberId})`);
            console.log(`     Photo: ${m.photoUrl ? 'Yes' : 'No'}`);
            if (m.maritalStatus === 'Married' && m.spousePhotoUrl) console.log(`     SpousePhoto: Yes`);
        });

        if (family.length === 3) {
            console.log('\n✅ INDIAN FAMILY TEST PASSED');
        } else {
            console.error('\n❌ TEST FAILED: Count Mismatch');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n❌ ERROR:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

runTest();
