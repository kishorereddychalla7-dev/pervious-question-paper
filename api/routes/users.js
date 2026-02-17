const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Update Score
router.put('/:id/score', async (req, res) => {
    try {
        const { points } = req.body;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { $inc: { score: points } },
            { new: true }
        );
        res.json({ score: user.score, badges: user.badges });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get User Profile
router.get('/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
