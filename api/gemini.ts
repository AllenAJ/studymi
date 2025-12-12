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
        detailedNotes: { type: "STRING" },
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
    required: ["title", "summary", "detailedNotes", "keyConcepts", "flashcards", "quiz", "mindMap"]
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

import { getUser } from './_utils/auth.js';
import { rateLimit } from './_utils/rate-limit.js';
import { logUsage, checkUsageLimit, getProfile, getMonthlyGenerationCount } from './_utils/db.js';

const ALLOWED_ACTIONS = ['generateStudySet', 'gradeTeachBack'];
const MAX_PROMPT_LENGTH = 20000;

export default async function handler(req: any, res: any) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Global Error Handler
    try {
        if (req.method === 'OPTIONS') {
            return res.status(200).end();
        }

        if (req.method !== 'POST') {
            return res.status(405).json({ error: 'Method not allowed' });
        }

        // Security Check
        let user;
        try {
            user = await getUser(req);
        } catch (e) {
            console.error('Auth check crashed:', e);
            return res.status(500).json({ error: 'Authentication service unavailable' });
        }

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

        // Monthly Quota Check
        if (user.id) {
            const profile = await getProfile(user.id);
            const isPremium = profile?.is_premium;
            const tokenLimit = isPremium ? 50000000 : 2000000;

            // 1. Check Token Limit (Cost)
            if (!(await checkUsageLimit(user.id, tokenLimit))) {
                return res.status(403).json({ error: 'Monthly usage limit exceeded. Please upgrade or wait until next month.' });
            }

            // 2. Check Generation Count Limit (Strict "3 per month" for Free)
            if (action === 'generateStudySet' && !isPremium) {
                const genCount = await getMonthlyGenerationCount(user.id);
                if (genCount >= 3) {
                    return res.status(403).json({ error: 'Free plan limit reached (3 sets/month). Upgrade for unlimited.' });
                }
            }
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('Missing GEMINI_API_KEY');
            return res.status(500).json({ error: 'Server misconfiguration: Missing API Key' });
        }

        const systemInstruction = isGenZ ? GEN_Z_SYSTEM_INSTRUCTION : BASE_SYSTEM_INSTRUCTION;
        const schema = action === 'gradeTeachBack' ? TEACH_BACK_SCHEMA : STUDY_SET_SCHEMA;

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

        // Calculate simplified token usage (approx: 4 chars = 1 token)
        const inputEst = prompt.length / 4;
        const outputEst = cleanText.length / 4;

        // Ensure usage is logged before returning (prevents race condition)
        try {
            await logUsage(user.id, `gemini_${action}`, Math.ceil(inputEst), Math.ceil(outputEst));
        } catch (logError) {
            console.warn('Logging failed but processing continued:', logError);
        }

        return res.status(200).json({ result: JSON.parse(cleanText.trim()) });

    } catch (criticalError: any) {
        console.error('CRITICAL SERVER ERROR:', criticalError);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: criticalError.message
        });
    }
}
