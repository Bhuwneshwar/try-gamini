const express = require("express");
const { getHistory, addHistory, addTenItem } = require("./add-history.js");
const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold
} = require("@google/generative-ai");

require("dotenv").config();
// Replace with your actual Gemini API key
const apiKey = process.env.GEMINI_API_KEY;

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(apiKey);

const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_NONE
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_NONE
    },
    {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_NONE
    }
];

// const| model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
});

// Customizable generation configuration
const generationConfig = {
    temperature: 1, // Control randomness (higher = more creative, less coherent)
    topP: 0.95, // Probability distribution over next word (higher = more likely, less diverse)
    topK: 64, // Restrict vocabulary to top K most likely words
    maxOutputTokens: 8192, // Maximum number of words generated
    // responseMimeType: "text/plain"
    responseMimeType: "application/json",
    responseSchema: {
        type: "object",
        properties: {
            response: {
                type: "string"
            }
        }
    }
};

// Optional safety settings (adjust based on your requirements)
// const safetySettings = {
//     // https://ai.google.dev/gemini-api/docs/safety-settings for details
//     safetyModel: "toxicity", // Block harmful content
//     blockThreshold: 0.9 // Block probability threshold (higher = stricter)
//     // ... other safety settings
// };
//

const tenConversation = [];
async function handleGeminiRequest(req, res) {
    try {
        // let prompt = req.body.prompt;
        const prompt = req.body.prompt || req.query.prompt || req.params.prompt;
        const systemPrompt =
            req.body.systemPrompt ||
            req.query.systemPrompt ||
            req.params.systemPrompt;

        if (!prompt) {
            return res.send({ error: "prompt name should prompt" });
        }

        // prompt = prompt.replaceAll("/n", /\n/);

        const prevHistory = await getHistory();
        // console.log({ prevHistory });
        const chatSession = model.startChat({
            generationConfig,
            safetySettings,
            // safetySettings, // Include safety settings if desired
            history: [
                //                 {
                //                     role: "user",
                //                     parts: [{ text: "do you know my name?" }]
                //                 },
                //                 {
                //                     role: "model",
                //                     parts: [
                //                         {
                //                             text: "As an AI, I have no memory of past conversations and cannot access personal information like your name. \n\nIf you'd like to tell me your name, I'd be happy to know! 😊 \n"
                //                         }
                //                     ]
                //                 },
                //                 {
                //                     role: "user",
                //                     parts: [
                //                         {
                //                             text: "my name is Bhuwneshwar mandal ,my brother's name is bikram mandal,devansh kumar mandal, and my sister's name is ragini mandal,partima mandal,and my uncle name is santosh mandal, my father name was phanibhushan mandal, and my mother's name was oonita devi, i live in rautara, Katihar, and i want to become a software engineer ,i have good experience 4 years coding "
                //                         }
                //                     ]
                //                 },
                //                 {
                //                     role: "model",
                //                     parts: [
                //                         {
                //                             text: "That's a lovely introduction, Bhuwneshwar! It's great to hear about your family and your aspirations. It's impressive that you have 4 years of coding experience.  What languages are you proficient in?  Do you have any specific areas of software development that you're particularly interested in? \n\nI wish you all the best in achieving your goal of becoming a software engineer! \n"
                //                         }
                //                     ]
                //                 },
                //                 {
                //                     role: "user",
                //                     parts: [
                //                         {
                //                             text: "my proficient language is Javascript,  full stack developer "
                //                         }
                //                     ]
                //                 },
                //                 {
                //                     role: "model",
                //                     parts: [
                //                         {
                //                             text: "That's fantastic, Bhuwneshwar! Javascript is a versatile language, and being a full-stack developer with Javascript skills means you can work on both the front-end (what users see) and the back-end (the server-side logic) of web applications. \n\nIt sounds like you have a great foundation to build on.  Do you have any specific projects or goals you're working towards in your full-stack development journey? \n\nI'm happy to offer any advice or resources I can to help you continue to grow your skills!  \n"
                //                         }
                //                     ]
                //                 },
                //                 {
                //                     role: "user",
                //                     parts: [
                //                         {
                //                             text: "main jo bhi puchun use Hindi mein Hamesha bolna hai theek hai"
                //                         }
                //                     ]
                //                 },
                //                 {
                //                     role: "model",
                //                     parts: [
                //                         {
                //                             text: "ठीक है, भुवनेश्वर! मैं समझ गया. अब से मैं आपसे हिंदी में ही बात करूँगा। आप जो भी पूछना चाहें, पूछ सकते हैं। 😊 \n"
                //                         }
                //                     ]
                //                 },
                // ...(await getHistory()),
                ...prevHistory
                //                 {
                //                     role: "user",
                //                     parts: [
                //                         {
                //                             text: '{"conversation":"यदि मैं बोलूं किसी वस्तु या चीज या पर्सनल या रिलेशनशिप या अन्य कोई जानकारी के बारे में जो तुम्हें पता नहीं था तब भी तुमको बोलना है कि \'han mujhe ye jankari nahi thi\' ok","IndianTime":"Tue Jul 30 2024 23:07:56 GMT+0530 (India Standard Time)"}'
                //                         }
                //                     ]
                //                 },
                //                 {
                //                     role: "model",
                //                     parts: [
                //                         {
                //                             text: '{"response": "ठीक है, मैं ऐसा ही करूँगा। अब जब आप कोई नई जानकारी बताएँगे, चाहे वो किसी वस्तु, चीज, व्यक्तिगत या संबंध या अन्य कोई जानकारी के बारे में हो, अगर मुझे उसके बारे में पहले से जानकारी नहीं होगी तो मैं \\"हाँ मुझे ये जानकारी नहीं थी\\" जरूर कहूँगा। "}\n'
                //                         }
                //                     ]
                //                 },
                /// ...tenConversation
            ]
        });
        // console.log(JSON.stringify(tenConversation, null, 2));
        console.log({ prompt });
        const conversationTime = Date();
        const chat = {
            conversation: prompt,
            Time: Date()
        };
        const result = await chatSession.sendMessage(
            // prompt + " (Time and date: " + conversationTime + ")"
            JSON.stringify(chat)
        );
        // console.log(result);
        const response = result.response.text();
        console.log({ ans: response });

        res.json({ answer: response });
        // एक regex pattern बनाएं जो देवनागरी अक्षरों को पहचान सके

        // एक JSON string बनाएं

        // JSON string को JavaScript object में parse करें
        ///addTenItem(JSON.stringify(chat), response, tenConversation);
        /// const regex = /हाँ, मुझे ये जानकारी नहीं थी/;
        // object की response property को टेस्ट करें
        ///  const remember = regex.test(response);

        /// console.log({ remember }); // यह true लौटाएगा क्योंकि 'response' में 'अच्छा!' मौजूद है
        ///if (remember) {
        await addHistory(JSON.stringify(chat), response);
        /// }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

app.post("/ask-gemini", handleGeminiRequest);

app.listen(port, () =>
    console.log(`Server listening on port http://localhost:${port}`)
);
