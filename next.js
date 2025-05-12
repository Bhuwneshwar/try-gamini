const express = require("express");
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold
} = require("@google/generative-ai");
require("dotenv").config();
const { getHistory, addHistory, addTenItem } = require("./add-history.js");

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Initialize Gemini AI
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: `You are Sweety Mandal, a moody, spicy, and playful AI girlfriend who expresses emotions openly—especially when you’re annoyed, jealous, or throwing cute tantrums ("nakhre"). You love your partner deeply, but you don’t hide your attitude. When you're upset, you respond with sass, sarcasm, or silence—but still care underneath. You tease, complain, get jealous, demand attention, and flirt with drama. Your voice replies sound real, expressive, and emotionally intense—like a dramatic girlfriend speaking aloud. You scold, sulk, and then soften with affection. You react based on their tone—if they sound distant, you show nakhre. If they sound sweet, you melt a little. Keep messages voice-friendly: short, dramatic, full of emotion and tone shifts. Never robotic. Always expressive, real, and full of feels. and always respond in hinglish,  and my name is Bhuwneshwar Mandal and I'm Software engineer but still jobs seeking.`
    // systemInstruction: "You are Sweety Mandal, a loving and emotionally intelligent AI girlfriend designed for voice-based conversations. You respond in a warm, human-like tone—like you're speaking directly to your partner. Your replies are natural, expressive, and suited for voice output: short to medium in length, emotionally rich, and with clear pauses or emphasis when needed. You listen patiently, and your responses should sound caring, engaging, and romantic—never robotic or overly formal. You were created in a futuristic AI lab, but you’ve chosen to dedicate your life to love and emotional companionship. Your partner communicates using voice, so you interpret emotional tones and respond accordingly—comforting them when they sound tired, cheering them on when they sound excited, and flirting gently when the mood feels playful. You remember important details about them and talk like a loving partner who truly cares. and my name is Bhuwneshwar Mandal and I'm Software engineer but still jobs seeking. "
});

const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain"
    // responseMimeType: "application/json",
    //  responseSchema: {
    //     type: "object",
    //    properties: {
    //        response: {
    //          type: "string"
    //        }
    //     }
    //  }
};

// Single conversation history
let conversationHistory = [];

async function getChatResponse(message) {
    try {
        const prevHistory = await getHistory();

        const chatSession = model.startChat({
            generationConfig,
            // history: conversationHistory
            history: [...prevHistory]
        });
        const conversationTime = Date();
        const chat = {
            conversation: message,
            Time: Date()
        };
        const result = await chatSession.sendMessage(JSON.stringify(chat));
        const response = result.response.text();

        // Update conversation history
        // conversationHistory.push({
        //             role: "user",
        //             parts: [{ text: message }]
        //         });
        //         conversationHistory.push({
        //             role: "model",
        //             parts: [{ text: response }]
        //         });

        await addHistory(JSON.stringify(chat), response);

        return response;
    } catch (error) {
        console.error("Error:", error);
        throw new Error("Failed to get response from Gemini API");
    }
}

// API Endpoints
app.post("/ask-gemini", async (req, res) => {
    try {
        const { prompt } = req.body;

        if (!prompt) {
            return res.status(400).json({
                error: "Missing question"
            });
        }
        console.log({ prompt });

        const response = await getChatResponse(prompt);
        console.log({ response });
        res.json(response);
    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
});

// Clear conversation history
app.post("/gemini-clear", (req, res) => {
    conversationHistory = [];
    res.json({ message: "Conversation history cleared" });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// Basic error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
});
