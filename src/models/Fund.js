const mongoose = require('mongoose');

const FundSchema = new mongoose.Schema({
    memberId: { type: String, required: true }, // Store Member ID as string (or ObjectId if using strict refs, but Member is loose in this app)
    // Actually, looking at Member.js, it seems to rely on custom IDs sometimes or Mongo IDs. 
    // Let's stick to string to be safe with the "ProxyMember" setup, or Schema.Types.ObjectId if we are sure.
    // The current app uses string IDs often.
    amount: { type: Number, required: true },
    type: {
        type: String,
        enum: ['General', 'Temple', 'Education', 'Event'],
        required: true
    },
    date: { type: Date, default: Date.now },
    description: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Audit trail
}, {
    timestamps: true
});

module.exports = mongoose.model('Fund', FundSchema);
