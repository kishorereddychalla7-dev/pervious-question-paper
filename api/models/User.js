const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'teacher', 'admin'], default: 'student', index: true },
    score: { type: Number, default: 0 }, // Gamification: Total Score
    badges: [{ type: String }], // Gamification: Badges
    createdAt: { type: Date, default: Date.now }
});

// Compound index if needed, e.g., name text search
UserSchema.index({ name: 'text' });

module.exports = mongoose.model('User', UserSchema);
