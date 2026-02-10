
import { GoogleGenAI, Type } from "@google/genai";

export const getAICommentary = async (lastMultiplier: number, totalWins: number, currentBalance: number) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The player just saw a crash at ${lastMultiplier}x. Their current balance is $${currentBalance}. They have won $${totalWins} in this session. Give a short, witty, 1-sentence commentary like an experienced flight analyst or a casino pit boss. Determine a sentiment.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING },
            sentiment: { type: Type.STRING, enum: ['positive', 'neutral', 'negative', 'danger'] }
          },
          required: ["message", "sentiment"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  } catch (error: any) {
    // Better detection of 429 Resource Exhausted errors
    const errorString = JSON.stringify(error).toLowerCase();
    const isQuotaError = 
      errorString.includes("429") || 
      errorString.includes("quota") || 
      errorString.includes("resource_exhausted") ||
      errorString.includes("limit");
    
    if (isQuotaError) {
      console.warn("Gemini API Quota Exhausted (429). Falling back to system defaults.");
      return { 
        message: "QUOTA_EXHAUSTED", 
        sentiment: "danger" 
      };
    }

    if (errorString.includes("requested entity was not found") || errorString.includes("api_key_invalid")) {
      return { message: "AUTH_REQUIRED", sentiment: "danger" };
    }

    return { message: "Fly safe, pilot.", sentiment: "neutral" };
  }
};
