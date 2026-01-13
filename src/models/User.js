const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed
    email: { type: String, unique: true, sparse: true },
    mobile: { type: String },
    role: { type: String, enum: ['SuperAdmin', 'Admin', 'Member'], default: 'Member' },
    isVerified: { type: Boolean, default: false },
    permissions: { type: [String], default: [] }, // e.g. ['create', 'read', 'update', 'delete']
    otp: { type: String, select: false }, // Don't return by default
    otpExpires: { type: Date, select: false },
    name: { type: String },
    memberId: { type: String }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', UserSchema);
