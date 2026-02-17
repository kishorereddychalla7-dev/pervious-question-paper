const express = require('express');
const router = express.Router();
const Story = require('../models/Story');
const Question = require('../models/Question');
const aiService = require('../services/aiService');

// Generate Story from Paper
router.post('/generate', async (req, res) => {
    try {
        const { paperId, userId } = req.body;
        // 1. Fetch Paper (In real app)
        // const paper = await Paper.findById(paperId);

        // 2. Call AI Service
        const aiData = await aiService.generateStoryFromPaper("Mock Content");

        // 3. Save Questions first
        const savedChapters = [];
        for (const chap of aiData.chapters) {
            const q = new Question({
                paperId, // Optional link
                text: chap.question.text,
                options: chap.question.options,
                correctAnswer: chap.question.correctAnswer,
                hint: chap.question.hint,
                explanation: chap.question.explanation,
                type: chap.question.type
            });
            const savedQ = await q.save();
            savedChapters.push({
                questionId: savedQ._id,
                narrative: chap.narrative,
                recap: chap.recap
            });
        }

        // 4. Save Story
        const newStory = new Story({
            paperId,
            title: aiData.title,
            intro: aiData.intro,
            createdBy: userId,
            chapters: savedChapters
        });
        await newStory.save();
        res.json(newStory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Story by ID
router.get('/:id', async (req, res) => {
    try {
        const story = await Story.findById(req.params.id).populate('chapters.questionId');
        res.json(story);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
