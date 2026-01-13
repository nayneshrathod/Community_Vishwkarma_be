const mongoose = require('mongoose');

const DonationSchema = new mongoose.Schema({
    memberId: { type: String, required: false }, // Can be null if external donation
    memberName: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    type: { type: String, enum: ['General', 'Event', 'Temple', 'Education'], default: 'General' },
    notes: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('Donation', DonationSchema);
