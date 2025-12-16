import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { Message, Sender, DoctorSearchResult, Medicine, LabTest } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are MedAssist, a supportive and knowledgeable medical AI assistant. 
Your goal is to help users understand symptoms, explain medical terms, and analyze potential health concerns based on their input.

CRITICAL RULES:
1. ALWAYS provide a disclaimer that you are an AI, not a doctor, and that your advice does not replace professional medical evaluation.
2. If a situation seems life-threatening (chest pain, difficulty breathing, severe bleeding), urge the user to call emergency services immediately.
3. Be empathetic, clear, and concise. Use markdown for readability.
4. When analyzing medical reports (images), explain the findings in simple terms but remain objective.
`;

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string
): Promise<string> => {
  try {
    // Convert app history to Gemini format (simplistic approach for context)
    // We strictly use the last few messages to keep context relevant and save tokens
    const recentHistory = history.slice(-10).map(msg => 
      `${msg.sender === Sender.USER ? 'User' : 'Model'}: ${msg.text}`
    ).join('\n');

    const prompt = `${recentHistory}\nUser: ${newMessage}\nModel:`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });

    return response.text || "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    return "I apologize, but I'm having trouble connecting to the medical database right now. Please check your connection.";
  }
};

export const analyzeMedicalImage = async (
  base64Image: string,
  mimeType: string,
  userPrompt: string
): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: userPrompt || "Analyze this medical image/report. Explain what it shows in simple terms and flag any abnormal values."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });

    return response.text || "Could not analyze the image.";
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "Failed to process the image. Please ensure it is a clear medical report or photo.";
  }
};

export const searchDoctors = async (
  district: string,
  specialty: string
): Promise<DoctorSearchResult> => {
  try {
    // We ask for a structured format within the text to attempt extraction of coordinates
    const prompt = `Find top rated ${specialty}s or hospitals in ${district}, Bihar, India. 
    1. Provide a helpful summary of the best options available.
    2. IMPORTANT: For each place, if you know the location, strictly include a hidden tag in this exact format: [[Name | Lat, Lng]] (e.g., [[AIIMS Patna | 25.556, 85.074]]). This allows us to place them on a map.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        systemInstruction: "You are a helpful medical assistant. When asked to find doctors, use Google Maps to find real places.",
      }
    });

    const text = response.text || "No details found.";
    
    // Parse coordinates from text if available
    const coordsMap = new Map<string, {lat: number, lng: number}>();
    const coordinateRegex = /\[\[(.*?)\s*\|\s*([\d.-]+),\s*([\d.-]+)\]\]/g;
    let match;
    while ((match = coordinateRegex.exec(text)) !== null) {
      // Normalize name for matching
      const nameKey = match[1].trim().toLowerCase().substring(0, 15); // Use first 15 chars for fuzzy matching
      const lat = parseFloat(match[2]);
      const lng = parseFloat(match[3]);
      if (!isNaN(lat) && !isNaN(lng)) {
        coordsMap.set(nameKey, { lat, lng });
      }
    }

    // Extract map links and merge with coordinates
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const places = groundingChunks
      .filter((chunk: any) => chunk.maps?.uri && chunk.maps?.title)
      .map((chunk: any) => {
        const title = chunk.maps.title;
        const uri = chunk.maps.uri;
        
        // Attempt to find coordinates for this place
        const titleKey = title.toLowerCase().substring(0, 15);
        let location = undefined;
        
        // Try exact substring match keys
        for (const [key, coords] of coordsMap.entries()) {
          if (titleKey.includes(key) || key.includes(titleKey)) {
            location = coords;
            break;
          }
        }

        return { title, uri, location };
      });

    // Clean up the text by removing the coord tags for display
    const cleanText = text.replace(/\[\[.*?\]\]/g, '');

    return { text: cleanText, places };
  } catch (error) {
    console.error("Error searching doctors:", error);
    return { 
      text: "I apologize, but I couldn't connect to the location service right now. Please try again later.", 
      places: [] 
    };
  }
};

export const searchMedicines = async (query: string): Promise<Medicine[]> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `List 5 popular brands or types of medicine, health drinks, or supplements available in India for: ${query}. 
      Return structured JSON data.
      Include a realistic price in INR.
      Category should be one of: 'General', 'Supplements', 'Healthy Drinks', 'Allergy', 'Digestion', 'Pain Relief', 'First Aid'.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              price: { type: Type.NUMBER },
              category: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    return text ? JSON.parse(text) : [];
  } catch (error) {
    console.error("Error searching medicines:", error);
    return [];
  }
};

export const searchLabTests = async (query: string): Promise<LabTest[]> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `List 5 common diagnostic lab tests related to: ${query}. 
      Return structured JSON data. 
      Include a realistic price in INR and preparation instructions.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              price: { type: Type.NUMBER },
              preparation: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    return text ? JSON.parse(text) : [];
  } catch (error) {
    console.error("Error searching lab tests:", error);
    return [];
  }
};