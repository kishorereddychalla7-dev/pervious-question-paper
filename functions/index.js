const { onRequest, onCall } = require("firebase-functions/v2/https");
const { onObjectFinalized } = require("firebase-functions/v2/storage");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const OpenAI = require("openai");
const pdf = require("pdf-parse");

admin.initializeApp();
setGlobalOptions({ region: "us-central1" });

const db = admin.firestore();

/**
 * AI Conversion Cloud Function
 * Triggered when a new PDF is uploaded to Storage
 */
exports.convertPaper = onObjectFinalized(async (event) => {
    const filePath = event.data.name;
    const bucketName = event.data.bucket;

    if (!filePath.endsWith(".pdf") || !filePath.startsWith("papers/")) {
        console.log("Not a PDF or not in papers directory. Skipping.");
        return null;
    }

    const bucket = admin.storage().bucket(bucketName);
    const file = bucket.file(filePath);

    try {
        // 1. Download PDF
        const [buffer] = await file.download();

        // 2. Extract Text
        const data = await pdf(buffer);
        const text = data.text;

        if (!text || text.trim().length === 0) {
            throw new Error("No text found in PDF");
        }

        // 3. Call OpenAI to process questions
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const prompt = `
        You are an expert educator. Convert the following question paper text into multiple-choice questions for a story-based learning platform.
        Output MUST be a JSON array of questions, where each question has:
        - narrative: A short story intro for the question
        - questionText: The actual question
        - options: Array of 4 options
        - correctAnswer: The correct option
        - hint: A helpful hint for the student
        - explanation: A clear explanation of the answer
        - recap: A short story wrap-up for this part

        Format:
        {
          "title": "Story Title",
          "intro": "Overall Story Intro",
          "chapters": [
            {
              "narrative": "...",
              "question": {
                "text": "...",
                "options": ["...", "...", "...", "..."],
                "correctAnswer": "...",
                "hint": "...",
                "explanation": "..."
              },
              "recap": "..."
            }
          ]
        }

        Text:
        ${text.substring(0, 10000)} // Limiting to first 10k chars for safety
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-4-turbo-preview",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });

        const result = JSON.parse(response.choices[0].message.content);

        // 4. Save to Firestore
        const paperId = filePath.split("/").pop().replace(".pdf", "");
        const userId = filePath.split("/")[1]; // Assuming path is papers/{userId}/{filename}

        const storyRef = db.collection("stories").doc();
        await storyRef.set({
            paperId,
            title: result.title,
            intro: result.intro,
            chapters: result.chapters,
            createdBy: userId,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            pdfUrl: `https://storage.googleapis.com/${bucketName}/${filePath}`
        });

        // 5. Update paper status in Firestore
        // Note: Assumes a record was created in 'papers' collection when uploading
        const paperQuery = await db.collection("papers").where("pdfPath", "==", filePath).get();
        if (!paperQuery.empty) {
            await paperQuery.docs[0].ref.update({ status: "processed", storyId: storyRef.id });
        }

        console.log(`Successfully converted ${filePath} to story ${storyRef.id}`);
        return { success: true, storyId: storyRef.id };

    } catch (error) {
        console.error("Error converting paper:", error);
        return { error: error.message };
    }
});
