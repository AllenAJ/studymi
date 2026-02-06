import { GoogleGenAI, Type } from "@google/genai";
import { StudySet, TeachBackFeedback, InputType } from "../types";
import { supabase } from "./supabase";

// Use server API on production domain, or on localhost when ?useServer=1 (to test Opik locally with `vercel dev`)
const isProduction =
  typeof window !== 'undefined' &&
  ((window.location.hostname === 'www.studymi.xyz' || window.location.hostname === 'studymi.xyz') ||
   (['localhost', '127.0.0.1'].includes(window.location.hostname) && (window.location.search.includes('useServer=1') || (import.meta as any).env?.VITE_USE_SERVER_API === 'true')));

// Injected at build time by Vite from .env (GEMINI_API_KEY or VITE_GEMINI_API_KEY)
const GEMINI_API_KEY_INJECTED = import.meta.env.VITE_GEMINI_API_KEY ?? '';

const getApiKey = () => {
  const key = typeof GEMINI_API_KEY_INJECTED === 'string' ? GEMINI_API_KEY_INJECTED.trim() : '';
  return key || '';
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

// For production, use server-side API route
async function callGeminiServer(prompt: string, action: string, isGenZ: boolean, inlineData?: { mimeType: string; data: string }): Promise<any> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error('You must be logged in to use this feature.');
  }

  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ action, prompt, isGenZ, inlineData })
  });

  let data;
  try {
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch {
      console.error('API returned non-JSON:', text.substring(0, 100));
      throw new Error(`Server error (${response.status})`);
    }
  } catch (e: any) {
    throw new Error(e.message || 'Network response was not ok');
  }

  if (!response.ok) {
    throw new Error(data.error || 'API request failed');
  }
  return data;
}

// For local development, use browser-side Gemini SDK
async function callGeminiLocal(prompt: string, action: string, isGenZ: boolean, inlineData?: { mimeType: string; data: string }): Promise<any> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error(
      'Gemini API key not found. Add GEMINI_API_KEY to your .env file and restart the dev server (npm run dev).'
    );
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.0-flash";
  const systemInstruction = isGenZ ? GEN_Z_SYSTEM_INSTRUCTION : BASE_SYSTEM_INSTRUCTION;

  const parts: any[] = [];

  if (inlineData) {
    parts.push({ inlineData });
    parts.push({ text: prompt });
  } else {
    parts.push({ text: prompt });
  }

  const schema = action === 'gradeTeachBack' ? {
    type: Type.OBJECT,
    properties: {
      score: { type: Type.INTEGER, description: "0 to 100" },
      feedback: { type: Type.STRING, description: "Constructive feedback on clarity and accuracy." },
      missingConcepts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Concepts from the source that were missed." },
      correction: { type: Type.STRING, description: "A better or corrected version of their explanation." }
    },
    required: ["score", "feedback", "missingConcepts", "correction"]
  } : {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING },
      summary: { type: Type.STRING },
      detailedNotes: { type: Type.STRING },
      keyConcepts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "5 core concepts" },
      flashcards: {
        type: Type.ARRAY,
        description: "Flashcards (minimum 5)",
        items: {
          type: Type.OBJECT,
          properties: { front: { type: Type.STRING }, back: { type: Type.STRING } },
          required: ["front", "back"]
        }
      },
      quiz: {
        type: Type.ARRAY,
        description: "Quiz questions (minimum 3)",
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswerIndex: { type: Type.INTEGER }
          },
          required: ["question", "options", "correctAnswerIndex"]
        }
      },
      mindMap: {
        type: Type.OBJECT,
        description: "Simple mind map",
        properties: {
          name: { type: Type.STRING },
          children: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                children: {
                  type: Type.ARRAY,
                  items: { type: Type.OBJECT, properties: { name: { type: Type.STRING } } }
                }
              }
            }
          }
        },
        required: ["name", "children"]
      }
    },
    required: ["title", "summary", "detailedNotes", "keyConcepts", "flashcards", "quiz", "mindMap"]
  };

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      systemInstruction,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      responseSchema: schema
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from Gemini");

  // Clean markdown if present
  let cleanText = text;
  if (cleanText.includes('```json')) {
    cleanText = cleanText.replace(/```json\n?/, '').replace(/\n?```$/, '');
  } else if (cleanText.includes('```')) {
    cleanText = cleanText.replace(/```\n?/, '').replace(/\n?```$/, '');
  }
  cleanText = cleanText.trim();

  // Log usage if logged in
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    try {
      // Gemini SDK provides usage metadata
      const inputTokens = response.usageMetadata?.promptTokenCount || Math.ceil(prompt.length / 4);
      const outputTokens = response.usageMetadata?.candidatesTokenCount || Math.ceil(cleanText.length / 4);

      await supabase.from('usage_logs').insert({
        user_id: session.user.id,
        feature: `gemini_${action}`,
        input_tokens: inputTokens,
        output_tokens: outputTokens,
        details: { environment: 'local' }
      });
    } catch (e) {
      console.warn('Failed to log usage locally:', e);
    }
  }

  try {
    return JSON.parse(cleanText);
  } catch (parseErr: any) {
    if (parseErr instanceof SyntaxError) {
      const repaired = tryRepairTruncatedJson(cleanText);
      if (repaired !== null) return repaired;
      throw new Error(
        'The AI response was truncated or invalid. Try again with slightly shorter content, or try again in a moment.'
      );
    }
    throw parseErr;
  }
}

/** Try to repair JSON truncated mid-string (e.g. hit token limit). */
function tryRepairTruncatedJson(raw: string): any {
  if (!raw || raw.length < 10) return null;
  const suffixes = ['"', '"}', '"]', '"]}', '"]}}', '"}', ']', '}', '}}', ']}', '}]'];
  for (const suf of suffixes) {
    try {
      return JSON.parse(raw + suf);
    } catch (_) {}
  }
  // Try closing open braces by count
  const open = (raw.match(/\{/g) || []).length - (raw.match(/\}/g) || []).length;
  const openBracket = (raw.match(/\[/g) || []).length - (raw.match(/\]/g) || []).length;
  if (open >= 0 && openBracket >= 0) {
    try {
      return JSON.parse(raw + '"]'.repeat(openBracket) + '}'.repeat(open));
    } catch (_) {}
  }
  return null;
}

export const generateStudySet = async (
  content: string,
  inputType: InputType,
  isGenZ: boolean = false,
  mimeType: string = 'text/plain'
): Promise<StudySet> => {

  let userPrompt = '';
  let inlineData: { mimeType: string; data: string } | undefined;

  if (inputType === 'audio' || inputType === 'pdf') {
    // Gemini can process raw PDFs and audio directly!
    inlineData = { mimeType, data: content };
    userPrompt = inputType === 'audio'
      ? `Listen to this audio and create a comprehensive study set with:
- Title
- Summary (max 50 words)
- Detailed Notes (RAW HTML format): Return ONLY valid HTML. Use <h3> for section headers, <ul>/<ol> for lists, and <table class="w-full text-left border-collapse"> for classifications. DO NOT use markdown. Structure: Definition, Epidemiology, Classification (Table), Risk Factors, Pathophysiology, Clinical Features, Diagnosis, Management.
- 5 Key Concepts
- Flashcards (short Q&A): Create 5-15 flashcards depending on the content capability.
- Quiz Questions (multiple choice): Create 3-10 questions depending on the content capability.
- Mind Map: Create a mind map with the main topic and sufficient branches to cover the key areas (minimum 3).`
      : `Read this document and create a comprehensive study set with:
- Title
- Summary (max 50 words)
- Detailed Notes (RAW HTML format): Return ONLY valid HTML. Use <h3> for section headers, <ul>/<ol> for lists, and <table class="w-full text-left border-collapse"> for classifications. DO NOT use markdown. Structure: Definition, Epidemiology, Classification (Table), Risk Factors, Pathophysiology, Clinical Features, Diagnosis, Management.
- 5 Key Concepts
- Flashcards (short Q&A): Create 5-15 flashcards depending on the content capability.
- Quiz Questions (multiple choice): Create 3-10 questions depending on the content capability.
- Mind Map: Create a mind map with the main topic and sufficient branches to cover the key areas (minimum 3).`;
  } else if (inputType === 'youtube') {
    const videoIdMatch = content.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    let transcript = '';

    if (videoId) {
      try {
        console.log('Fetching transcript for:', videoId);
        const response = await fetch(`/api/transcript/${videoId}`);
        if (response.ok) {
          try {
            const data = await response.json();
            if (data.success && data.transcript && data.transcript.length > 50) {
              transcript = data.transcript
                .replace(/&amp;/g, '&')
                .replace(/&#39;/g, "'")
                .replace(/&quot;/g, '"');
              console.log('✅ Fetched YouTube transcript via server');
            } else if (data.error) {
              console.warn('⚠️ Transcript API error:', data.error);
            }
          } catch (e) {
            console.warn('⚠️ Transcript API returned invalid JSON');
          }
        } else {
          console.warn('⚠️ Transcript API failed with status:', response.status);
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch transcript:', error);
      }
    }

    if (transcript && transcript.length > 500) {
      const truncatedTranscript = transcript.substring(0, 12000);
      userPrompt = `Analyze this video transcript and create a comprehensive study set.
        
TRANSCRIPT:
${truncatedTranscript}

Create:
- Title
- Summary (max 50 words)
- Detailed Notes (RAW HTML format): Return ONLY valid HTML. Use <h3> for headers, <ul>/<ol> for lists, and <table class="w-full text-left border-collapse">. DO NOT use markdown. Include sections like Definition, History, Key Players, Timeline, Impact, etc.
- 5 Key Concepts (max 10 words each)
- Flashcards (short Q&A): Create 5-15 flashcards depending on the content capability.
- Quiz Questions (multiple choice): Create 3-10 questions depending on the content capability.
- Mind Map: Create a mind map with the main topic and sufficient branches to cover the key areas (minimum 3).`;
    } else {
      userPrompt = `I want to learn about the topic from this YouTube video: https://www.youtube.com/watch?v=${videoId || 'unknown'}

Please create a comprehensive study set based on what you know about this topic. Include:
- Title
- Summary (max 50 words)
- Detailed Notes (RAW HTML format): Return ONLY valid HTML. Use <h3> for headers, <ul>/<ol> for lists, and <table class="w-full text-left border-collapse">. DO NOT use markdown.
- 5 Key Concepts
- Flashcards: Create 5-15 flashcards depending on the content capability.
- Quiz Questions: Create 3-10 questions depending on the content capability.
- Mind Map: Create a mind map with the main topic and sufficient branches to cover the key areas (minimum 3).`;
    }
  } else {
    // TEXT
    userPrompt = `Analyze the following text and create a comprehensive study set. Include:
- Title
- Summary (max 50 words)
- Detailed Notes (RAW HTML format): Return ONLY valid HTML. Use <h3> for section headers, <ul>/<ol> for lists, and <table class="w-full text-left border-collapse"> for classifications. DO NOT use markdown. Structure: Definition, Epidemiology, Classification (Table), Risk Factors, Pathophysiology, Clinical Features, Diagnosis, Management.
- 5 Key Concepts
- Flashcards (short Q&A pairs): Create 5-15 flashcards depending on the content capability.
- Quiz Questions (multiple choice): Create 3-10 questions depending on the content capability.
- Mind Map: Create a mind map with the main topic and sufficient branches to cover the key areas (minimum 3).

TEXT:
${content.substring(0, 15000)}`;
  }

  const response = isProduction
    ? await callGeminiServer(userPrompt, 'generateStudySet', isGenZ, inlineData)
    : await callGeminiLocal(userPrompt, 'generateStudySet', isGenZ, inlineData);
  const data = isProduction ? (response as { result: any; traceId?: string }).result : response;

  return {
    ...data,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    type: inputType,
    flashcards: data.flashcards.map((f: any) => ({ ...f, id: crypto.randomUUID() })),
    quiz: data.quiz.map((q: any) => ({ ...q, id: crypto.randomUUID() })),
    opikTraceId: isProduction ? (response as { traceId?: string }).traceId : undefined,
  };
};

export const gradeTeachBack = async (
  originalTopic: string,
  originalSummary: string,
  userExplanation: string,
  isGenZ: boolean = false
): Promise<TeachBackFeedback> => {
  const prompt = `
Topic: ${originalTopic}
Source Summary: ${originalSummary}

Student's Explanation: ${userExplanation}

Evaluate the student's explanation based on the Feynman technique. 
Did they simplify it correctly? Did they miss key points? 
Provide a score (0-100), constructive feedback, a list of missing concepts, and a corrected simplified version if theirs was inaccurate.
  `;

  const response = isProduction
    ? await callGeminiServer(prompt, 'gradeTeachBack', isGenZ)
    : await callGeminiLocal(prompt, 'gradeTeachBack', isGenZ);
  if (isProduction) {
    const { result, traceId } = response as { result: TeachBackFeedback; traceId?: string };
    return { ...result, traceId };
  }
  return response as TeachBackFeedback;
};