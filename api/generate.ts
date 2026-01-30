export const config = {
    runtime: 'nodejs',
};

const STUDY_SET_SCHEMA = {
    type: "object",
    properties: {
        title: { type: "string" },
        summary: { type: "string" },
        keyConcepts: {
            type: "array",
            items: { type: "string" }
        },
        flashcards: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    front: { type: "string" },
                    back: { type: "string" }
                },
                required: ["front", "back"],
                additionalProperties: false
            }
        },
        quiz: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    question: { type: "string" },
                    options: { type: "array", items: { type: "string" } },
                    correctAnswerIndex: { type: "integer" }
                },
                required: ["question", "options", "correctAnswerIndex"],
                additionalProperties: false
            }
        },
        mindMap: {
            type: "object",
            properties: {
                name: { type: "string" },
                children: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            name: { type: "string" },
                            children: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        name: { type: "string" }
                                    },
                                    required: ["name"],
                                    additionalProperties: false
                                }
                            }
                        },
                        required: ["name", "children"],
                        additionalProperties: false
                    }
                }
            },
            required: ["name", "children"],
            additionalProperties: false
        }
    },
    required: ["title", "summary", "keyConcepts", "flashcards", "quiz", "mindMap"],
    additionalProperties: false
};

const TEACH_BACK_SCHEMA = {
    type: "object",
    properties: {
        score: { type: "integer" },
        feedback: { type: "string" },
        missingConcepts: { type: "array", items: { type: "string" } },
        correction: { type: "string" }
    },
    required: ["score", "feedback", "missingConcepts", "correction"],
    additionalProperties: false
};

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

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    const { action, prompt, systemInstruction, isGenZ } = req.body;

    const baseInstruction = `You are an expert tutor specializing in the Feynman Technique. 
Your goal is to help users deeply understand topics by simplifying them, identifying gaps in knowledge, and testing understanding.
Always prioritize conceptual clarity over jargon.`;

    const genZInstruction = `You are a chill, aesthetic study buddy. You explain complex topics using simple language, occasional gen-z slang (like "vibe", "no cap", "bet", "high key"), and keep things brief and visual.
Your goal is to make learning feel effortless and not cringe. 
Use lowercase for titles sometimes if it fits the aesthetic. 
Still ensure the educational content is 100% accurate and helpful.`;

    const schema = action === 'gradeTeachBack' ? TEACH_BACK_SCHEMA : STUDY_SET_SCHEMA;
    const schemaName = action === 'gradeTeachBack' ? 'teach_back_feedback' : 'study_set';

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: isGenZ ? genZInstruction : baseInstruction },
                    { role: 'user', content: prompt }
                ],
                response_format: {
                    type: 'json_schema',
                    json_schema: {
                        name: schemaName,
                        strict: true,
                        schema: schema
                    }
                },
                max_tokens: 4096
            })
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('OpenAI API error:', error);
            return res.status(response.status).json({ error: error.error?.message || 'OpenAI API error' });
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            return res.status(500).json({ error: 'No response from OpenAI' });
        }

        return res.status(200).json({ result: JSON.parse(content) });
    } catch (error: any) {
        console.error('OpenAI request error:', error.message);
        return res.status(500).json({ error: error.message });
    }
}
