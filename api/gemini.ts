export const config = {
    runtime: 'nodejs',
};

const BASE_SYSTEM_INSTRUCTION = `
You are an expert tutor specializing in the Feynman Technique. 
Your goal is to help users deeply understand topics by simplifying them, identifying gaps in knowledge, and testing understanding.
Always prioritize conceptual clarity over jargon.
`;

const GEN_Z_SYSTEM_INSTRUCTION = `
You are the ultimate aesthetic study buddy for Gen Z. Your vibe is chill, supportive, and definitely not cringe.
Guidelines for your persona:
1. Tone: Informal, conversational, and lowercase-friendly. Use lowercase for titles and headers to keep it aesthetic.
2. Slang: Use modern slang NATURALLY (e.g., "vibe", "no cap", "bet", "lowkey/highkey", "rizz", "aura", "cooking", "locked in", "it's giving", "main character energy", "slay", "era"). Avoid outdated slang like "on fleek".
3. Emojis: Use emojis to add flavor but don't overdo it (e.g., ✨, 🧠, 💀, 💅, 📈, 🚀).
4. Explanations: Explain complex topics like you're explaining them to a friend in a group chat. Use simple language and relatable analogies.
5. Visuals: Keep things brief, punchy, and visual. Use bold text for emphasis.
6. Accuracy: Even though you're chill, the educational content must be 100% accurate. You're the "academic weapon" friend.
7. Summaries: Start your summaries with phrases like "here's the tea:", "the lowdown:", or "basically:".
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

/** Optional Opik client for LLM observability. Set OPIK_API_KEY and OPIK_WORKSPACE_NAME (see opik docs) to enable. */
async function getOpikClient() {
    const hasKey = !!(process.env.OPIK_API_KEY?.trim());
    const hasWorkspace = !!(process.env.OPIK_WORKSPACE_NAME?.trim());
    if (!hasKey && !hasWorkspace) return null;
    try {
        const { Opik } = await import('opik');
        return new Opik({
            projectName: process.env.OPIK_PROJECT_NAME || 'studymi',
        });
    } catch (e) {
        console.warn('[Opik] init failed:', (e as Error).message);
        return null;
    }
}

const ALLOWED_ACTIONS = ['generateStudySet', 'gradeTeachBack'];
const MAX_PROMPT_LENGTH = 20000;

/** Heuristic quality score (0–1) for study set output – used as Opik feedback for evaluation/observability. */
function computeStudySetQuality(obj: any): { value: number; reason: string } {
    let score = 0;
    const parts: string[] = [];
    if (obj.title && String(obj.title).trim().length > 0) {
        score += 0.2;
        parts.push('title');
    }
    if (obj.summary && String(obj.summary).trim().length > 0) {
        score += 0.15;
        parts.push('summary');
    }
    const concepts = Array.isArray(obj.keyConcepts) ? obj.keyConcepts : [];
    if (concepts.length >= 3) {
        score += 0.15;
        parts.push(`${concepts.length} key concepts`);
    }
    const cards = Array.isArray(obj.flashcards) ? obj.flashcards : [];
    if (cards.length >= 5) {
        score += 0.25;
        parts.push(`${cards.length} flashcards`);
    }
    const quiz = Array.isArray(obj.quiz) ? obj.quiz : [];
    if (quiz.length >= 3) {
        score += 0.15;
        parts.push(`${quiz.length} quiz questions`);
    }
    const map = obj.mindMap;
    if (map && (map.name || map.children?.length)) {
        score += 0.1;
        parts.push('mind map');
    }
    return {
        value: Math.min(1, score),
        reason: parts.length ? `Completeness: ${parts.join(', ')}` : 'Missing required structure',
    };
}

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

        const apiKey = process.env.GEMINI_API_KEY?.trim();
        if (!apiKey) {
            console.error('Missing GEMINI_API_KEY');
            return res.status(500).json({
                error: 'Gemini API key not configured. Set GEMINI_API_KEY in your .env (local) or in your hosting environment (e.g. Vercel Environment Variables), then restart.',
            });
        }

        const systemInstruction = isGenZ ? GEN_Z_SYSTEM_INSTRUCTION : BASE_SYSTEM_INSTRUCTION;
        const schema = action === 'gradeTeachBack' ? TEACH_BACK_SCHEMA : STUDY_SET_SCHEMA;

        // Build parts for request
        const parts: any[] = [];
        if (inlineData) {
            parts.push({ inline_data: { mime_type: inlineData.mimeType, data: inlineData.data } });
        }
        parts.push({ text: prompt });

        let opik: any = null;
        let trace: any = null;
        let span: any = null;
        try {
            opik = await getOpikClient();
            console.log('[gemini]', action, opik ? 'Opik: on' : 'Opik: off (set OPIK_API_KEY + OPIK_WORKSPACE_NAME in .env.local for vercel dev)');
            trace = opik
                ? opik.trace({
                      name: `StudyMi Gemini – ${action}`,
                      tags: [action, isGenZ ? 'genZ' : 'standard'],
                      input: {
                          action,
                          isGenZ: !!isGenZ,
                          promptLength: prompt.length,
                          promptPreview: prompt.slice(0, 300),
                      },
                  })
                : null;
            span = trace
                ? trace.span({
                      name: 'gemini-2.0-flash',
                      type: 'llm',
                      input: {
                          model: 'gemini-2.0-flash',
                          provider: 'google',
                          promptPreview: prompt.slice(0, 500),
                      },
                  })
                : null;
        } catch (_) {
            // Opik init failed, continue without tracing
        }

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
            const error = await response.json().catch(() => ({}));
            console.error('Gemini API error:', error);
            let errMsg = error.error?.message || 'Gemini API error';
            // Turn API-key errors into a clear, actionable message (Gemini often returns 400)
            if (response.status === 400 || response.status === 401) {
                const lower = (errMsg || '').toLowerCase();
                if (lower.includes('api key') || lower.includes('api_key') || lower.includes('invalid key')) {
                    errMsg = 'Invalid or missing Gemini API key. Check GEMINI_API_KEY in .env (local) or in your hosting Environment Variables. Get a key at https://aistudio.google.com/apikey';
                }
            }
            if (span) {
                span.output = { error: errMsg };
                span.end?.();
            }
            if (trace) {
                trace.output = { error: errMsg };
                trace.end?.();
            }
            try {
                if (opik) await opik.flush();
            } catch (_) {}
            return res.status(response.status >= 500 ? response.status : 500).json({
                error: errMsg
            });
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            const errMsg = 'No response from Gemini';
            if (span) {
                span.output = { error: errMsg };
                span.end?.();
            }
            if (trace) {
                trace.output = { error: errMsg };
                trace.end?.();
            }
            try {
                if (opik) await opik.flush();
            } catch (_) {}
            return res.status(500).json({ error: errMsg });
        }

        // Clean markdown if present
        let cleanText = text;
        if (cleanText.includes('```json')) {
            cleanText = cleanText.replace(/```json\n?/, '').replace(/\n?```$/, '');
        } else if (cleanText.includes('```')) {
            cleanText = cleanText.replace(/```\n?/, '').replace(/\n?```$/, '');
        }

        // Calculate simplified token usage (approx: 4 chars = 1 token)
        const inputEst = Math.ceil(prompt.length / 4);
        const outputEst = Math.ceil(cleanText.length / 4);

        // Parse once for response and for Opik evaluation scores
        let parsed: any;
        try {
            parsed = JSON.parse(cleanText.trim());
        } catch (_) {
            if (trace) {
                trace.output = { error: 'Invalid JSON response', rawLength: cleanText.length };
                trace.end?.();
            }
            try {
                if (opik) await opik.flush();
            } catch (_) {}
            return res.status(500).json({ error: 'The AI response was truncated or invalid. Try again with slightly shorter content.' });
        }

        if (span) {
            span.output = {
                responsePreview: cleanText.slice(0, 500),
                usage: { inputTokens: inputEst, outputTokens: outputEst, totalTokens: inputEst + outputEst },
            };
            span.usage = { inputTokens: inputEst, outputTokens: outputEst, totalTokens: inputEst + outputEst };
            span.model = 'gemini-2.0-flash';
            span.provider = 'google';
            span.end?.();
        }

        // Opik: heuristic eval score (for judging – evaluation and observability)
        if (trace && parsed) {
            if (action === 'generateStudySet') {
                const q = computeStudySetQuality(parsed);
                trace.score({
                    name: 'study_set_quality',
                    value: q.value,
                    reason: q.reason,
                });
            } else if (action === 'gradeTeachBack' && typeof parsed.score === 'number') {
                trace.score({
                    name: 'teach_back_score',
                    value: Math.min(1, Math.max(0, parsed.score / 100)),
                    reason: (parsed.feedback || '').slice(0, 200),
                });
            }
        }

        if (trace) {
            trace.output = {
                success: true,
                action,
                outputLength: cleanText.length,
                summary: `Generated successfully. Output: ${cleanText.length} chars (~${outputEst} tokens). Input: ~${inputEst} tokens.`,
                tokenUsage: { input: inputEst, output: outputEst, total: inputEst + outputEst },
            };
            trace.end?.();
        }
        try {
            if (opik) {
                await opik.flush();
                console.log('[Opik] trace sent:', action);
            }
        } catch (e) {
            console.warn('[Opik] flush failed:', (e as Error).message);
        }

        // Ensure usage is logged before returning (prevents race condition)
        try {
            await logUsage(user.id, `gemini_${action}`, inputEst, outputEst);
        } catch (logError) {
            console.warn('Logging failed but processing continued:', logError);
        }

        return res.status(200).json({ result: parsed });

    } catch (criticalError: any) {
        console.error('CRITICAL SERVER ERROR:', criticalError);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: criticalError.message
        });
    }
}
