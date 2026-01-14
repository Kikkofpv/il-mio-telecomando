
import { GoogleGenAI, Type } from "@google/genai";
import { DisplayUnit } from "../types";

// Schema for the expected output from Gemini
const patternSchema = {
  type: Type.OBJECT,
  properties: {
    activeIndices: {
      type: Type.ARRAY,
      items: { type: Type.INTEGER },
      description: "Array of display IDs (1-200) that should be turned ON."
    },
    values: {
      type: Type.ARRAY,
      items: { 
        type: Type.OBJECT,
        properties: {
            id: { type: Type.INTEGER },
            val: { type: Type.STRING, description: "Value to show: '00'-'99' or 'F'" }
        }
      },
      description: "Optional specific values for displays. Can be numbers or 'F'."
    }
  },
  required: ["activeIndices"]
};

/**
 * Generates a pattern of active displays based on a text prompt using Gemini.
 */
export const generatePattern = async (
  prompt: string, 
  currentDisplays: DisplayUnit[]
): Promise<DisplayUnit[]> => {
  try {
    // Initialize Gemini AI client with API key from environment
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-3-flash-preview for pattern generation tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        Hai una matrice di 200 display numerici (ID da 1 a 200).
        L'utente vuole attivare un pattern basato su questa richiesta: "${prompt}".
        Restituisci JSON indicando quali ID attivare e opzionalmente che valore assegnare (0-99 oppure la lettera 'F').
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: patternSchema
      }
    });

    // Extracting text output from GenerateContentResponse
    const text = response.text;
    const result = JSON.parse(text?.trim() || "{}");
    const activeIndices = new Set(result.activeIndices || []);
    const valueMap = new Map();
    
    if (result.values) {
        result.values.forEach((v: any) => valueMap.set(v.id, v.val));
    }

    // Create new state based on AI response
    return currentDisplays.map(d => ({
      ...d,
      isOn: activeIndices.has(d.id),
      value: valueMap.has(d.id) ? String(valueMap.get(d.id)) : d.value
    }));

  } catch (error) {
    console.error("Errore generazione pattern AI:", error);
    throw error;
  }
};