const mongoose = require('mongoose');

const PaperSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subject: { type: String, required: true, index: true },
    year: { type: Number },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    content: { type: String }, // Raw text content or link to file
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Paper', PaperSchema);
