import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface MinecraftAddonFile {
  path: string;
  content: string;
}

export interface GeneratedAddon {
  name: string;
  description: string;
  files: MinecraftAddonFile[];
}

const addonSchema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "The name of the addon" },
    description: { type: Type.STRING, description: "A brief description of the addon" },
    files: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          path: { type: Type.STRING, description: "The file path within the addon (e.g., 'manifest.json', 'items/my_item.json')" },
          content: { type: Type.STRING, description: "The content of the file (usually JSON or text)" }
        },
        required: ["path", "content"]
      }
    }
  },
  required: ["name", "description", "files"]
};

export async function generateMinecraftAddon(prompt: string): Promise<GeneratedAddon> {
  const systemInstruction = `
    You are an expert Minecraft Bedrock Edition (MCPE) addon creator.
    Your task is to generate the necessary files for a Minecraft Bedrock addon based on a user prompt.
    
    You must generate:
    1. A 'manifest.json' file for the Behavior Pack.
    2. Relevant JSON files for items, blocks, or entities requested.
    3. Basic scripts if necessary.
    
    The 'manifest.json' must include:
    - A unique UUID (generate a random-looking one).
    - Version [1, 0, 0].
    - Minimum engine version [1, 20, 0].
    
    Example file structure:
    - manifest.json
    - items/custom_item.json
    - entities/custom_entity.json
    
    Ensure all JSON is valid and follows the Minecraft Bedrock documentation.
    Return the result as a JSON object matching the requested schema.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: addonSchema,
    },
  });

  return JSON.parse(response.text);
}
