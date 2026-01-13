
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const API_URL = 'http://localhost:3000/api';
const IMAGE_PATH = path.join(__dirname, 'test_image.jpg');

async function runTest() {
    try {
        console.log('>>> STARTING FULL SYSTEM VERIFICATION <<<\n');

        // 0. Login
        console.log('1. Logging in as Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            username: 'admin',
            password: 'admin123'
        });
        const token = loginRes.data.token;
        console.log(`   [✓] Logged in. Token: ${token.substring(0, 10)}...`);

        const authHeaders = {
            headers: {
                'Authorization': `Bearer ${token}`,
                ...new FormData().getHeaders()
            }
        };

        const TS = Date.now();
        const HEAD_NAME = `VerifyHead_${TS}`;
        const CHILD_NAME = `VerifyChild_${TS}`;
        const SPOUSE_NAME = `VerifyWife_${TS}`;
        const CHILD_SPOUSE_NAME = `VerifyDIL_${TS}`;

        // 1. Create Main Member (Head of Family) with Spouse
        console.log('\n2. Creating Main Member (Head) + Spouse Photo...');
        const mainForm = new FormData();
        mainForm.append('firstName', HEAD_NAME);
        mainForm.append('lastName', 'TestFamily');
        mainForm.append('gender', 'Male');
        mainForm.append('dob', '1980-01-01');
        mainForm.append('maritalStatus', 'Married');
        mainForm.append('familyId', 'FNew');
        mainForm.append('spouseName', SPOUSE_NAME);
        mainForm.append('photo', fs.createReadStream(IMAGE_PATH));
        mainForm.append('spousePhoto', fs.createReadStream(IMAGE_PATH));

        const mainRes = await axios.post(`${API_URL}/members`, mainForm, { headers: { 'Authorization': `Bearer ${token}`, ...mainForm.getHeaders() } });
        const mainMember = mainRes.data;
        console.log(`   [✓] Created Main Member: ${mainMember.firstName} (${mainMember.memberId})`);

        if (mainMember.photoUrl && mainMember.spousePhotoUrl) {
            console.log(`   [✓] Photos Saved: \n       - Self: ${mainMember.photoUrl}\n       - Spouse: ${mainMember.spousePhotoUrl}`);
        } else {
            console.error('   [X] FAILED: Photos missing for Main Member!');
            process.exit(1);
        }

        // 2. Create Child
        console.log('\n3. Creating Child Member...');
        const childForm = new FormData();
        childForm.append('firstName', CHILD_NAME);
        childForm.append('lastName', 'TestFamily');
        childForm.append('gender', 'Male');
        childForm.append('dob', '2005-01-01');
        childForm.append('maritalStatus', 'Single'); // Initially Single
        childForm.append('fatherId', mainMember.id); // Valid ObjectId
        childForm.append('familyId', mainMember.familyId); // Same Family
        childForm.append('photo', fs.createReadStream(IMAGE_PATH));

        const childRes = await axios.post(`${API_URL}/members`, childForm, { headers: { 'Authorization': `Bearer ${token}`, ...childForm.getHeaders() } });
        const childMember = childRes.data;
        console.log(`   [✓] Created Child: ${childMember.firstName} (${childMember.memberId})`);

        if (childMember.photoUrl) {
            console.log(`   [✓] Child Photo Saved: ${childMember.photoUrl}`);
        } else {
            console.error('   [X] FAILED: Photo missing for Child!');
        }

        // 3. Update Child to be Married (Add Spouse + Spouse Photo)
        // Note: In our app, adding a spouse to a child creates a NEW member for the spouse.
        // We need to simulate the "Update" payload the frontend sends.
        // Actually, the Frontend logic for "Child Spouse" is:
        // 1. Create Child Member
        // 2. Check if Child is Married.
        // 3. If so, call API to create Spouse Member.
        // 4. Update Child with `spouseId`.

        console.log('\n4. Simulating Child Marriage (Adding Spouse)...');
        // A. Create Child's Spouse
        const childSpouseForm = new FormData();
        childSpouseForm.append('firstName', CHILD_SPOUSE_NAME);
        childSpouseForm.append('lastName', 'TestFamily');
        childSpouseForm.append('gender', 'Female');
        childSpouseForm.append('dob', '2006-01-01');
        childSpouseForm.append('maritalStatus', 'Married');
        childSpouseForm.append('spouseId', childMember.id); // Link to child
        childSpouseForm.append('familyId', mainMember.familyId);
        childSpouseForm.append('photo', fs.createReadStream(IMAGE_PATH)); // Values mapped to photoUrl

        const csRes = await axios.post(`${API_URL}/members`, childSpouseForm, { headers: { 'Authorization': `Bearer ${token}`, ...childSpouseForm.getHeaders() } });
        const childSpouse = csRes.data;
        console.log(`   [✓] Created Child's Spouse: ${childSpouse.firstName} (${childSpouse.memberId})`);

        // B. Update Child to Link Spouse
        console.log('\n5. Updating Child to Link Spouse...');
        const updateChildForm = new FormData();
        updateChildForm.append('maritalStatus', 'Married');
        updateChildForm.append('spouseId', childSpouse.id);

        await axios.put(`${API_URL}/members/${childMember.id}`, updateChildForm, { headers: { 'Authorization': `Bearer ${token}`, ...updateChildForm.getHeaders() } });
        console.log(`   [✓] Linked Spouse to Child.`);

        // 4. Verification: Fetch Family
        console.log('\n6. Final Verification: Fetching All Members to check Data...');
        const fetchRes = await axios.get(`${API_URL}/members?familyId=${mainMember.familyId}`, { headers: { 'Authorization': `Bearer ${token}` } });
        const familyMembers = fetchRes.data.data ? fetchRes.data.data : fetchRes.data; // Handle pagination structure if present

        console.log(`   [✓] Retrieved ${familyMembers.length} family members.`);

        console.log(`\n   [DEBUG] Retrieved Members:`);
        familyMembers.forEach(m => console.log(`       - ${m.firstName} (${m.memberId}) Family: ${m.familyId}`));

        const retrievedHead = familyMembers.find(m => m.memberId === mainMember.memberId);
        const retrievedChild = familyMembers.find(m => m.memberId === childMember.memberId);
        const retrievedSpouse = familyMembers.find(m => m.memberId === childSpouse.memberId);

        if (!retrievedHead) console.error('   ❌ Head not found');
        if (!retrievedChild) console.error('   ❌ Child not found');
        if (!retrievedSpouse) console.error('   ❌ Child Spouse not found');

        console.log('\n   [RESULTS]');
        console.log(`   - Head Photo: ${retrievedHead.photoUrl ? 'OK' : 'MISSING'}`);
        console.log(`   - Head Spouse Photo: ${retrievedHead.spousePhotoUrl ? 'OK' : 'MISSING'}`);
        console.log(`   - Child Photo: ${retrievedChild.photoUrl ? 'OK' : 'MISSING'}`);
        console.log(`   - Child Spouse Photo: ${retrievedSpouse.photoUrl ? 'OK' : 'MISSING'}`);

        if (retrievedHead.photoUrl && retrievedHead.spousePhotoUrl && retrievedChild.photoUrl && retrievedSpouse.photoUrl) {
            console.log('\n✅ SUCCESS: All photos verified properly.');
        } else {
            console.error('\n❌ FAILURE: Some photos are missing.');
            process.exit(1);
        }

    } catch (error) {
        console.error('\n❌ Test Failed:', error.response ? error.response.data : error.message);
        process.exit(1);
    }
}

runTest();
