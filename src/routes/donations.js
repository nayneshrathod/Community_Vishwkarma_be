const express = require('express');
const Donation = require('../models/Donation');
const { verifyToken, checkPermission } = require('../middleware/authMiddleware');
const router = express.Router();

// Get All Donations
router.get('/', async (req, res) => {
    try {
        const donations = await Donation.find().sort({ date: -1 });
        res.json(donations);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add Donation
router.post('/', verifyToken, async (req, res) => {
    try {
        const newDonation = new Donation(req.body);
        const savedDonation = await newDonation.save();
        res.status(201).json(savedDonation);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete Donation
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await Donation.findByIdAndDelete(req.params.id);
        res.json({ message: 'Donation deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
