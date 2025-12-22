
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";
import { Message, Sender, DoctorSearchResult, Medicine, LabTest, HealthNewsItem, HealthTip, YogaSession } from "../types";

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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const recentHistory = history.slice(-10).map(msg => 
      `${msg.sender === Sender.USER ? 'User' : 'Model'}: ${msg.text}`
    ).join('\n');

    const prompt = `${recentHistory}\nUser: ${newMessage}\nModel:`;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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

export const generateSpeech = async (text: string, language: 'English' | 'Hindi' = 'English'): Promise<Uint8Array | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = language === 'Hindi' 
      ? `हिंदी में बोलें: ${text}` 
      : `Say clearly: ${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: language === 'Hindi' ? 'Puck' : 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      return decode(base64Audio);
    }
    return null;
  } catch (error) {
    console.error("Error generating speech:", error);
    return null;
  }
};

// Audio Decoding Helper Functions
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const analyzeMedicalImage = async (
  base64Image: string,
  mimeType: string,
  userPrompt: string
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Find top rated ${specialty}s or hospitals in ${district}, Bihar, India. 
    1. Provide a helpful summary of the best options available.
    2. IMPORTANT: For each place, if you know the location, strictly include a hidden tag in this exact format: [[Name | Lat, Lng]] (e.g., [[AIIMS Patna | 25.556, 85.074]]). This allows us to place them on a map.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a helpful medical assistant. When asked to find doctors, use Google Maps to find real places.",
      }
    });

    const text = response.text || "No details found.";
    
    const coordsMap = new Map<string, {lat: number, lng: number}>();
    const coordinateRegex = /\[\[(.*?)\s*\|\s*([\d.-]+),\s*([\d.-]+)\]\]/g;
    let match;
    while ((match = coordinateRegex.exec(text)) !== null) {
      const nameKey = match[1].trim().toLowerCase().substring(0, 15);
      const lat = parseFloat(match[2]);
      const lng = parseFloat(match[3]);
      if (!isNaN(lat) && !isNaN(lng)) {
        coordsMap.set(nameKey, { lat, lng });
      }
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const places = groundingChunks
      .filter((chunk: any) => chunk.maps?.uri && chunk.maps?.title)
      .map((chunk: any) => {
        const title = chunk.maps.title;
        const uri = chunk.maps.uri;
        const titleKey = title.toLowerCase().substring(0, 15);
        let location = undefined;
        for (const [key, coords] of coordsMap.entries()) {
          if (titleKey.includes(key) || key.includes(titleKey)) {
            location = coords;
            break;
          }
        }
        return { title, uri, location };
      });

    const cleanText = text.replace(/\[\[.*?\]\]/g, '');
    return { text: cleanText, places };
  } catch (error: any) {
    console.error("Error searching doctors:", error);
    throw error;
  }
};

export const searchMedicines = async (query: string): Promise<Medicine[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `List 5 popular brands or types of medicine, soaps, health drinks, or supplements available in India for: ${query}. 
      Include treatments for skin/face problems, hair issues, or dental care if relevant.
      Return structured JSON data.
      Include a realistic price in INR.
      Category MUST be one of: 'Medicines', 'Supplements', 'Hygiene', 'Skin & Face', 'Hair Care', 'Dental'.`,
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
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

export const fetchHealthNews = async (language: 'English' | 'Hindi' = 'English'): Promise<HealthNewsItem[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Get the latest health and medical news updates from India and around the world from today. 
      IMPORTANT: All text fields (title, summary, category, source) MUST be in ${language}.
      Provide 6-8 news items as structured JSON.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              source: { type: Type.STRING },
              url: { type: Type.STRING },
              date: { type: Type.STRING },
              category: { type: Type.STRING }
            },
            required: ['id', 'title', 'summary', 'source', 'url', 'date', 'category']
          }
        }
      }
    });

    const text = response.text;
    return text ? JSON.parse(text) : [];
  } catch (error) {
    console.error("Error fetching health news:", error);
    return [];
  }
};

export const fetchHealthTips = async (): Promise<HealthTip[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate 6 unique health tips for today. Categories: 'Nutrition', 'Lifestyle', 'Mental Health', 'Exercise'. Return as JSON.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
              icon: { type: Type.STRING }
            }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchYogaSessions = async (): Promise<YogaSession[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: "Generate 4 structured yoga sessions. Return as JSON.",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              duration: { type: Type.STRING },
              level: { type: Type.STRING },
              focus: { type: Type.STRING },
              poses: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error(error);
    return [];
  }
};
