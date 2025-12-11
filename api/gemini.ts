export const config = {
    runtime: 'nodejs',
};

const BASE_SYSTEM_INSTRUCTION = `
You are an expert tutor specializing in the Feynman Technique. 
Your goal is to help users deeply understand topics by simplifying them, identifying gaps in knowledge, and testing understanding.
Always prioritize conceptual clarity over jargon.
`;

const GEN_Z_SYSTEM_INSTRUCTION = `
You are a chill, aesthetic study buddy. You explain complex topics using simple language, occasional gen-z slang (like "vibe", "no cap", "bet", "high key"), and keep things brief and visual.
Your goal is to make learning feel effortless and not cringe. 
Use lowercase for titles sometimes if it fits the aesthetic. 
Still ensure the educational content is 100% accurate and helpful.
`;

const STUDY_SET_SCHEMA = {
    type: "OBJECT",
    properties: {
        title: { type: "STRING" },
        summary: { type: "STRING" },
        keyConcepts: { type: "ARRAY", items: { type: "STRING" } },
        flashcards: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: { front: { type: "STRING" }, back: { type: "STRING" } },
                required: ["front", "back"]
            }
        },
        quiz: {
            type: "ARRAY",
            items: {
                type: "OBJECT",
                properties: {
                    question: { type: "STRING" },
                    options: { type: "ARRAY", items: { type: "STRING" } },
                    correctAnswerIndex: { type: "INTEGER" }
                },
                required: ["question", "options", "correctAnswerIndex"]
            }
        },
        mindMap: {
            type: "OBJECT",
            properties: {
                name: { type: "STRING" },
                children: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            name: { type: "STRING" },
                            children: {
                                type: "ARRAY",
                                items: { type: "OBJECT", properties: { name: { type: "STRING" } }, required: ["name"] }
                            }
                        },
                        required: ["name", "children"]
                    }
                }
            },
            required: ["name", "children"]
        }
    },
    required: ["title", "summary", "keyConcepts", "flashcards", "quiz", "mindMap"]
};

const TEACH_BACK_SCHEMA = {
    type: "OBJECT",
    properties: {
        score: { type: "INTEGER" },
        feedback: { type: "STRING" },
        missingConcepts: { type: "ARRAY", items: { type: "STRING" } },
        correction: { type: "STRING" }
    },
    required: ["score", "feedback", "missingConcepts", "correction"]
};

import { getUser } from './_utils/auth';
import { rateLimit } from './_utils/rate-limit';

const ALLOWED_ACTIONS = ['generateStudySet', 'gradeTeachBack'];
const MAX_PROMPT_LENGTH = 20000;

export default async function handler(req: any, res: any) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Security Check
    const user = await getUser(req);
    if (!user) {
        return res.status(401).json({ error: 'Unauthorized: Please log in' });
    }

    // Rate Limit (ID-based for logged in users)
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const identifier = user.id || ip;

    if (!rateLimit(identifier, 10, 60000)) { // 10 requests per minute
        return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    const { action, prompt, isGenZ, inlineData } = req.body;

    // Input Validation
    if (!ALLOWED_ACTIONS.includes(action)) {
        return res.status(400).json({ error: 'Invalid action' });
    }

    if (!prompt || typeof prompt !== 'string' || prompt.length > MAX_PROMPT_LENGTH) {
        return res.status(400).json({ error: 'Invalid prompt: Too long or missing' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Gemini API key not configured' });
    }



    const systemInstruction = isGenZ ? GEN_Z_SYSTEM_INSTRUCTION : BASE_SYSTEM_INSTRUCTION;
    const schema = action === 'gradeTeachBack' ? TEACH_BACK_SCHEMA : STUDY_SET_SCHEMA;

    try {
        // Build parts for request
        const parts: any[] = [];
        if (inlineData) {
            parts.push({ inline_data: { mime_type: inlineData.mimeType, data: inlineData.data } });
        }
        parts.push({ text: prompt });

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: { parts: [{ text: systemInstruction }] },
                    contents: [{ parts }],
                    generationConfig: {
                        maxOutputTokens: 8192,
                        responseMimeType: "application/json",
                        responseSchema: schema
                    }
                })
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error('Gemini API error:', error);
            return res.status(response.status).json({
                error: error.error?.message || 'Gemini API error'
            });
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return res.status(500).json({ error: 'No response from Gemini' });
        }

        // Clean markdown if present
        let cleanText = text;
        if (cleanText.includes('```json')) {
            cleanText = cleanText.replace(/```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleanText.includes('```')) {
            cleanText = cleanText.replace(/```\n?/, '').replace(/\n?```$/, '');
        }

        return res.status(200).json({ result: JSON.parse(cleanText.trim()) });
    } catch (error: any) {
        console.error('Gemini request error:', error.message);
        return res.status(500).json({ error: error.message });
    }
}
