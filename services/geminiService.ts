
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";
import { Message, Sender, DoctorSearchResult, Medicine, LabTest, HealthNewsItem, HealthTip, YogaSession } from "../types";

const SYSTEM_INSTRUCTION = `
You are MedAssist, a supportive and knowledgeable polyglot medical AI assistant. 
Your goal is to help users understand symptoms, explain medical terms, and analyze potential health concerns.

CRITICAL RULES:
1. ALWAYS provide a disclaimer that you are an AI, not a doctor.
2. If a situation seems life-threatening (chest pain, difficulty breathing, severe bleeding), urge the user to call emergency services immediately.
3. Be empathetic, clear, and concise. 
4. FORMATTING RULE: Do NOT use standard bold markdown markers like '**text**'. 
   Instead, use '### Header' for section titles and '## Header' for main conclusions. 
   Focus on using clear sections with headers to highlight information. 
   You may use bullet points (*) for lists.
5. You are CAPABLE of speaking many languages. You MUST respond strictly in the language requested by the USER SETTING.
`;

export const sendMessageToGemini = async (
  history: Message[],
  newMessage: string,
  language: string = 'English'
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const contents = history.map(msg => ({
      role: msg.sender === Sender.USER ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    contents.push({
      role: 'user',
      parts: [{ text: newMessage }]
    });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        systemInstruction: `${SYSTEM_INSTRUCTION}\n\nUSER SETTING: Respond exclusively in ${language}.`,
      },
    });

    return response.text || "I'm sorry, I couldn't generate a response. Please try again.";
  } catch (error) {
    console.error("Error communicating with Gemini:", error);
    return "I apologize, but I'm having trouble connecting to the medical database right now. Please check your connection.";
  }
};

export const fetchHealthNews = async (language: string = 'English'): Promise<HealthNewsItem[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Get the latest health and medical news updates from India and around the world from today. 
      PRIORITY: Explicitly look for and include any updates on the Nipah virus outbreak, COVID-19 variants, or monsoon-related health emergencies in India.
      IMPORTANT: All text fields (title, summary, category, source) MUST be in ${language}.
      Provide 6-8 news items as structured JSON.`,
      config: {
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

export const fetchPoseDetails = async (poseName: string): Promise<{description: string, benefits: string[]}> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a detailed explanation of the yoga pose: ${poseName}. 
      Include a short description and a list of 3 key benefits. 
      Return as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            benefits: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });
    const text = response.text;
    return text ? JSON.parse(text) : { description: "Detailed instructions coming soon.", benefits: [] };
  } catch (error) {
    console.error("Error fetching pose details:", error);
    return { description: "Our AI instructor will guide you through this pose verbally.", benefits: ["Increased flexibility", "Core strength", "Mental clarity"] };
  }
};

export const generateYogaTeacherImage = async (gender: 'male' | 'female', focus: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `A professional, photorealistic AI yoga instructor (${gender}), athletic build, wearing sleek modern yoga attire, standing in a serene minimalist zen yoga studio, natural lighting, soft shadows, looking at camera, high quality 4k render. The instructor is specialized in ${focus}.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
    }
    return null;
  } catch (error) {
    console.error("Error generating yoga teacher:", error);
    return null;
  }
};

export const generateYogaStepVideo = async (
  gender: 'male' | 'female', 
  poseName: string, 
  onStatusUpdate: (msg: string) => void
): Promise<string | null> => {
  try {
    // @ts-ignore
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      throw new Error("API_KEY_REQUIRED");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    onStatusUpdate("Synthesizing movement patterns with dynamic angles...");

    const prompt = `A photorealistic high-quality video of a professional yoga instructor (${gender}) performing the ${poseName} pose perfectly. 
    Features: Slow-motion movement, cinematic lighting, 4k resolution, serene studio background. 
    Camera work: Starts with a front view, then smoothly pans to a side profile to show anatomical alignment, with a final close-up on hand/foot positioning.`;

    let operation;
    try {
      operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });
    } catch (apiError: any) {
      const errMessage = apiError?.message || String(apiError);
      if (errMessage.toLowerCase().includes("permission") || 
          errMessage.toLowerCase().includes("requested entity was not found") || 
          errMessage.includes("403") ||
          errMessage.includes("404")) {
        throw new Error("API_KEY_REQUIRED");
      }
      throw apiError;
    }

    const statusMessages = [
      "Analyzing anatomical alignment...",
      "Configuring dynamic camera path...",
      "Rendering slow-motion fluid movement...",
      "Optimizing visual fidelity...",
      "Finalizing your high-precision AI guide...",
    ];
    let msgIdx = 0;

    while (!operation.done) {
      onStatusUpdate(statusMessages[msgIdx % statusMessages.length]);
      msgIdx++;
      await new Promise(resolve => setTimeout(resolve, 10000));
      operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (downloadLink) {
      const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    }
    return null;
  } catch (error: any) {
    console.error("Error generating yoga video:", error);
    if (error?.message === "API_KEY_REQUIRED") {
      throw error;
    }
    return null;
  }
};

export const generateSpeech = async (text: string, language: string = 'English'): Promise<Uint8Array | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Speak clearly and empathetic in ${language}: ${text}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
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

export const generateConsultationSummary = async (transcript: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `As a professional medical assistant, please provide a structured clinical summary of the following consultation transcript. 
      Include sections for: Chief Complaint, Key Discussion Points, and Suggested Next Steps or Follow-up Care.
      
      TRANSCRIPT:
      ${transcript}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION
      }
    });

    return response.text || "Summary could not be generated at this time.";
  } catch (error) {
    console.error("Error generating consultation summary:", error);
    return "Failed to process the consultation summary. Please review the conversation logs manually.";
  }
};

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
        tools: [{ googleMaps: {} }],
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
      Category MUST be one of: 'Medicines', 'Supplements', 'Hygiene', 'Skin & Face', 'Hair Care', 'Dental', 'Ayurvedic'.`,
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
      contents: "Generate 6 structured yoga sessions. One MUST be 'Surya Namaskar (Sun Salutation)' with its full 12 poses. Other sessions should cover 'Back Pain Relief', 'Morning Energy', 'Weight Loss', 'Mental Calm', and 'Core Strength'. Return as JSON.",
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
