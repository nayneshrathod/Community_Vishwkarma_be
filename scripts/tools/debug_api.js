const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();
const User = require('../../src/models/User');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/community_app_db';
const API_URL = 'http://localhost:3000/api';

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Find a user or create one
        let dbUser = await User.findOne({});
        if (!dbUser) {
            console.log('No users found in DB. Will create a test user.');
        } else {
            console.log(`Found User: ${dbUser.username}`);
        }


        // We don't know the plain password easily unless we reset it or know it.
        // Most passwords were set to mobile number or '123456'.
        // Let's try '123456' first, then mobile.
        // Or we can manually create a test user with known password.

        // Let's create a temporary test user
        const testUser = {
            username: 'debug_test_user',
            password: 'password123',
            name: 'Debug User',
            mobile: '9999999999',
            email: 'debug@test.com', // Added email
            role: 'Admin',
            isVerified: true
        };

        // Check if exists
        dbUser = await User.findOne({ username: testUser.username });
        if (!dbUser) {
            try {
                await axios.post(`${API_URL}/auth/register`, testUser);
                console.log('Registered test user');
            } catch (err) {
                console.error('Register failed:', err.response?.data || err.message);
            }
        }

        // Ensure user is verified and has role Admin for testing
        // Need to refetch or use the one found
        dbUser = await User.findOne({ username: testUser.username });
        if (dbUser) {
            dbUser.isVerified = true;
            dbUser.role = 'Admin';
            dbUser.permissions = ['member.view', 'member.create', 'member.edit', 'member.delete']; // Grant all permissions
            await dbUser.save();
            console.log('Manually verified user and granted Admin role.');
        }

        // Login
        console.log('Attempting Login...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            username: testUser.username,
            password: testUser.password
        });

        console.log('Login Success! Token received.');
        const token = loginRes.data.token;

        // Test Protected Endpoint
        console.log(`Testing GET ${API_URL}/members?limit=0 with token...`);
        try {
            const memberRes = await axios.get(`${API_URL}/members?limit=0`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log(`Success! Status: ${memberRes.status}`);
            console.log(`Data count: ${memberRes.data.data ? memberRes.data.data.length : '?'}`);
        } catch (err) {
            console.error('Member Fetch Failed:', err.response ? err.response.status : err.message);
            if (err.response?.status === 401) console.error('ERROR 401: Unauthorized');
            if (err.response?.status === 403) console.error('ERROR 403: Forbidden (Check Permissions)');
        }

    } catch (err) {
        console.error('Global Error:', err.message);
        if (err.response) {
            console.error('Response Status:', err.response.status);
            console.error('Response Data:', err.response.data);
        }
    } finally {
        await mongoose.disconnect();
    }
}

run();
