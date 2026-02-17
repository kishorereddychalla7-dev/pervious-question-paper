const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'mock-key',
});

exports.generateStoryFromPaper = async (paperContent) => {
    // Mock Implementation for MVP/No Key
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
        console.log("Using Mock AI Service");
        return {
            title: " The Galactic Physics Adventure",
            intro: "Year 3050. You are the commander of the Starship Newton. Your mission: Restore gravity to the floating city of Jupiter.",
            chapters: [
                {
                    narrative: "As you approach the city, the navigation system fails. You need to calculate the gravitational force to land safely.",
                    recap: "Great job! A successful landing allowed you to dock safely.",
                    question: {
                        text: "If the mass of the ship is 1000kg and gravity is 10m/s^2, what is the weight?",
                        options: ["100N", "10000N", "10N", "1000N"],
                        correctAnswer: "10000N",
                        hint: "Weight = Mass * Gravity",
                        explanation: "W = mg = 1000 * 10 = 10000N",
                        type: "mcq"
                    }
                },
                {
                    narrative: "The city's power core is unstable. You encounter a locked door with a mathematical cipher.",
                    recap: "The door slides open, revealing the pulsating core.",
                    question: {
                        text: "Solve for x: 2x + 5 = 15",
                        options: ["5", "10", "2", "7"],
                        correctAnswer: "5",
                        hint: "Subtract 5 from both sides, then divide by 2.",
                        explanation: "2x = 10 => x = 5",
                        type: "mcq"
                    }
                }
            ]
        };
    }

    // Real OpenAI Implementation (Commented out for now or ready to enable)
    /*
    const prompt = `Convert the following question paper into a story ... : ${paperContent}`;
    const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
    });
    return JSON.parse(response.choices[0].message.content);
    */
};
