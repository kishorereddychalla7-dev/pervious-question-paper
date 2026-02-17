const express = require('express');
const router = express.Router();
const Paper = require('../models/Paper');

// Upload Paper (Text only for MVP)
router.post('/upload', async (req, res) => {
    try {
        const { title, subject, year, content, userId } = req.body;
        const newPaper = new Paper({ title, subject, year, content, uploadedBy: userId });
        await newPaper.save();
        res.json(newPaper);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get All Papers with Pagination
router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const papers = await Paper.find()
            .populate('uploadedBy', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(); // Performance: Lean query

        const total = await Paper.countDocuments();

        res.json({
            data: papers,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPapers: total
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
