const mongoose = require('mongoose');

const StorySchema = new mongoose.Schema({
    paperId: { type: mongoose.Schema.Types.ObjectId, ref: 'Paper', index: true },
    title: { type: String, required: true },
    intro: { type: String },
    chapters: [{
        questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
        narrative: { type: String }, // Story part before question
        recap: { type: String } // Summary after answering
    }], // Array of chapters linking to questions
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Story', StorySchema);
