const mongoose = require('mongoose');

const NoticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    fileUrl: { type: String }, // Optional attachment (Patrika/Image)
    type: {
        type: String,
        enum: ['General', 'Event', 'Urgent'],
        default: 'General'
    },
    target: {
        type: String,
        enum: ['All', 'Selected'],
        default: 'All'
    },
    recipients: [{ type: String }], // Array of Member IDs if target is 'Selected'
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Track who has read this notice
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});

module.exports = mongoose.model('Notice', NoticeSchema);
