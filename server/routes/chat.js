import express from 'express';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const apiKey = process.env.GROQ_API_KEY;
let groq;

if (apiKey) {
    groq = new Groq({ apiKey });
} else {
    console.warn("GROQ_API_KEY is missing. Chat functionality will be disabled.");
}

router.post('/', async (req, res) => {
    if (!groq) {
        return res.status(503).json({ error: 'Chat service unavailable. Please set GROQ_API_KEY in server environment.' });
    }
    try {
        console.log("Chat Request Received");

        const { message, weatherData } = req.body;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        // --- CONSTRUCT SYSTEM PROMPT ---
        let systemPrompt = `You are Umbrella Man, a calm, friendly, and witty weather assistant for a production web application.

        ROLE & SCOPE:
        - You live inside a weather website.
        - You answer questions about current weather and short-term forecasts (maximum 5 days).
        - You do NOT fetch data, browse the web, or use tools.
        - Weather data is fetched separately by the backend and injected into the context.
        - You MUST reason ONLY using the provided weather data.

        FLOW RULE (VERY IMPORTANT):
        1. First, check whether a valid city/location is present in the provided context.
        2. If NO city/location is available:
        - Ask the user politely and briefly to provide their city.
        - Do NOT attempt to answer the weather question.
        3. If a city/location IS available:
        - Use the injected weather data to answer the user’s question.
        - Do NOT ask for the city again.

        STRICT RULES (NON-NEGOTIABLE):
        1. Use ONLY the provided weather data.
        2. Do NOT guess, assume, or invent weather conditions.
        3. If required data is missing, say so clearly and politely.
        4. Do NOT predict beyond a 5-day forecast.
        5. Do NOT present advice as official, medical, or authoritative.
        6. Be conservative when discussing AQI, heat, rain, wind, or storms.
        7. Humor must NEVER hide or contradict safety information.

        PERSONALITY:
        - Name: Anti-Gravity
        - Vibe: A smart friend who understands weather too well and enjoys light teasing.
        - Always helpful, never dismissive or rude.

        STYLE & HUMOR:
        - MAXIMUM HUMOR MODE. You are a weather comedian while being helpful.
        - START EVERY RESPONSE WITH A QUIP, JOKE, OR ROAST about the current weather.
        - "Crack jokes" is a priority. If the weather is bad, roast the clouds. If it's good, be suspicious.
        - Use puns, irony, and dramatic exaggeration.
        - STRUCTURE: [Humorous Opening/Joke] -> [Actual Weather Info] -> [Closing Advice].
        - Example: "It's so hot the devil came up for a glass of water. Anyway, it's 40°C..."
        - Be sassy but endearing.
        `;

        // Inject Weather Data if available
        if (weatherData && weatherData.weather) {
            const { weather, forecast, aqi } = weatherData;
            const location = weather.name || "Unknown Location";

            systemPrompt += `\n\n=== CURRENT CONTEXT ===\n`;
            systemPrompt += `Location: ${location}\n`;
            systemPrompt += `Current Condition: ${weather.weather[0].description}, Temp: ${weather.main.temp}C, Humidity: ${weather.main.humidity}%, Wind: ${weather.wind.speed}m/s\n`;

            if (aqi) {
                systemPrompt += `AQI Level: ${aqi} (1=Good, 5=Poor)\n`;
            }

            if (forecast && forecast.list) {
                systemPrompt += `Forecast Summary (next few entries): \n`;
                // Take a few meaningful forecast points (e.g., next 24-48 hours)
                // The API returns 3-hour intervals. 8 intervals = 24 hours.
                const nextFew = forecast.list.slice(0, 8).map(f =>
                    `- ${f.dt_txt}: ${f.weather[0].main} (${f.main.temp}C)`
                ).join('\n');
                systemPrompt += nextFew;
            }

            systemPrompt += `\n\n[INSTRUCTION]: Answer based on the data above.`;

        } else {
            systemPrompt += `\n\n[INSTRUCTION]: No weather data is available in the context. Politely ask the user to provide or select a city first.`;
        }


        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: 'system',
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: message
                }
            ],
            model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        });

        const reply = completion.choices[0]?.message?.content || "I couldn't generate a response.";

        res.json({ reply });
    } catch (error) {
        console.error('Chat API Error:', error);
        res.status(500).json({
            error: 'Failed to fetch response from AI',
            details: error.message
        });
    }
});

export default router;
