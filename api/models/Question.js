const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    paperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper' },
    text: { type: String, required: true },
    options: [{ type: String }], // For MCQs
    correctAnswer: { type: String, required: true },
    hint: { type: String },
    explanation: { type: String },
    type: { type: String, enum: ['mcq', 'text'], default: 'mcq' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' }
});

module.exports = mongoose.model('Question', QuestionSchema);
