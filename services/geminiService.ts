import { GoogleGenAI, Type } from "@google/genai";
import { StudySet, TeachBackFeedback, InputType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

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

export const generateStudySet = async (
  content: string, 
  inputType: InputType,
  isGenZ: boolean = false,
  mimeType: string = 'text/plain'
): Promise<StudySet> => {
  
  const model = "gemini-2.5-flash";
  const systemInstruction = isGenZ ? GEN_Z_SYSTEM_INSTRUCTION : BASE_SYSTEM_INSTRUCTION;
  
  const parts: any[] = [];

  if (inputType === 'audio' || inputType === 'pdf') {
    parts.push({
      inlineData: {
        mimeType: mimeType, 
        data: content // Base64 string
      }
    });
    const promptText = inputType === 'audio' 
      ? "Listen to this audio. Create a comprehensive study set." 
      : "Read this document. Create a comprehensive study set.";
    parts.push({ text: promptText });
  } else if (inputType === 'youtube') {
    parts.push({
      text: `Analyze the content of this YouTube video URL (or the topic it likely covers): ${content}. 
             If you cannot access the transcript directly, infer the key educational concepts based on the title and likely content of such a video.
             Create a comprehensive study set.`
    });
  } else {
    // TEXT
    parts.push({
      text: `Analyze the following text and create a comprehensive study set based on it: \n\n${content}`
    });
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      systemInstruction: systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "A short, catchy title for the study set" },
          summary: { type: Type.STRING, description: "A simpler explanation of the topic (ELI5 style)" },
          keyConcepts: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "List of 5-7 core concepts extracted from the material"
          },
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING },
                back: { type: Type.STRING }
              },
              required: ["front", "back"]
            }
          },
          quiz: {
            type: Type.ARRAY,
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
            description: "A hierarchical structure representing the topic. Root node is the main topic.",
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
                       items: {
                         type: Type.OBJECT,
                         properties: {
                            name: { type: Type.STRING }
                         }
                       }
                     }
                   }
                }
              }
            },
            required: ["name", "children"]
          }
        },
        required: ["title", "summary", "keyConcepts", "flashcards", "quiz", "mindMap"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate study set");
  }

  const data = JSON.parse(response.text);
  
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
  const model = "gemini-2.5-flash";
  const systemInstruction = isGenZ ? GEN_Z_SYSTEM_INSTRUCTION : BASE_SYSTEM_INSTRUCTION;

  const response = await ai.models.generateContent({
    model,
    contents: `
      Topic: ${originalTopic}
      Source Summary: ${originalSummary}
      
      Student's Explanation: ${userExplanation}
      
      Evaluate the student's explanation based on the Feynman technique. 
      Did they simplify it correctly? Did they miss key points? 
      Provide a score (0-100), constructive feedback, a list of missing concepts, and a corrected simplified version if theirs was inaccurate.
    `,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER, description: "0 to 100" },
          feedback: { type: Type.STRING, description: "Constructive feedback on clarity and accuracy." },
          missingConcepts: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Concepts from the source that were missed." },
          correction: { type: Type.STRING, description: "A better or corrected version of their explanation." }
        },
        required: ["score", "feedback", "missingConcepts", "correction"]
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to grade explanation");
  }

  return JSON.parse(response.text);
};