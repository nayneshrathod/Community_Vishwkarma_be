const express = require('express');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Locations
 *   description: Location Data (States, Districts, etc.)
 */
const axios = require('axios');

const EXTERNAL_API = 'https://india-location-hub.in/api';

// Helper for proxying
const proxyRequest = async (endpoint, params, res) => {
    try {
        const response = await axios.get(`${EXTERNAL_API}/${endpoint}`, { params });
        // Forward the specific data array if possible, or usually just the whole response
        // User's frontend expects arrays directly? 
        // My previous mock returned arrays.
        // The external API returns { success: true, states: [...] }
        // So I need to map it.

        if (response.data && response.data.success) {
            if (response.data.states) return res.json(response.data.states);
            if (response.data.districts) return res.json(response.data.districts);
            if (response.data.talukas) return res.json(response.data.talukas);
            if (response.data.villages) return res.json(response.data.villages);
        }

        res.json(response.data || []);
    } catch (error) {
        console.error(`Proxy Error [${endpoint}]:`, error.message);
        // Fallback to empty array on error to not break frontend
        res.json([]);
    }
};

/**
 * @swagger
 * /api/locations/states:
 *   get:
 *     summary: Get all states
 *     tags: [Locations]
 *     responses:
 *       200:
 *         description: List of states
 */
router.get('/states', async (req, res) => {
    await proxyRequest('states', {}, res);
});

/**
 * @swagger
 * /api/locations/districts:
 *   get:
 *     summary: Get districts by state
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: state_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of districts
 */
router.get('/districts', async (req, res) => {
    // External API uses 'state_code'
    await proxyRequest('districts', { state_code: req.query.state_id }, res);
});

/**
 * @swagger
 * /api/locations/talukas:
 *   get:
 *     summary: Get talukas by district
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: district_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of talukas
 */
router.get('/talukas', async (req, res) => {
    // External API uses 'district_code'
    await proxyRequest('talukas', { district_code: req.query.district_id }, res);
});

/**
 * @swagger
 * /api/locations/villages:
 *   get:
 *     summary: Get villages by taluka
 *     tags: [Locations]
 *     parameters:
 *       - in: query
 *         name: taluka
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of villages
 */
router.get('/villages', async (req, res) => {
    // External API uses 'taluka_code'
    // Frontend sends 'taluka' (which is the ID/Code from the dropdown)
    await proxyRequest('villages', { taluka_code: req.query.taluka }, res);
});

module.exports = router;
