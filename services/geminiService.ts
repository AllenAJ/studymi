import { GoogleGenAI, Type } from "@google/genai";
import { StudySet, TeachBackFeedback, InputType } from "../types";
import { supabase } from "./supabase";

// Check if we're in production (Vercel) or local dev
const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost';

// Get API key from environment
const getApiKey = () => {
  return (process.env as any).GEMINI_API_KEY ||
    (import.meta as any).env?.VITE_GEMINI_API_KEY || '';
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
  return data.result;
}

// For local development, use browser-side Gemini SDK
async function callGeminiLocal(prompt: string, action: string, isGenZ: boolean, inlineData?: { mimeType: string; data: string }): Promise<any> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
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

  return JSON.parse(cleanText.trim());
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

  const data = isProduction
    ? await callGeminiServer(userPrompt, 'generateStudySet', isGenZ, inlineData)
    : await callGeminiLocal(userPrompt, 'generateStudySet', isGenZ, inlineData);

  return {
    ...data,
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    type: inputType,
    flashcards: data.flashcards.map((f: any) => ({ ...f, id: crypto.randomUUID() })),
    quiz: data.quiz.map((q: any) => ({ ...q, id: crypto.randomUUID() }))
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

  return isProduction
    ? await callGeminiServer(prompt, 'gradeTeachBack', isGenZ)
    : await callGeminiLocal(prompt, 'gradeTeachBack', isGenZ);
};