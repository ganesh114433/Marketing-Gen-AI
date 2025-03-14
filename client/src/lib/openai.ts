import { apiRequest } from "./queryClient";

export type ContentGenerationOptions = {
  contentType: string;
  topic: string;
  tone: string;
  length: string;
};

export async function generateContent(options: ContentGenerationOptions): Promise<string> {
  try {
    const response = await apiRequest('POST', '/api/ai/generate-content', options);
    const data = await response.json();
    return data.content;
  } catch (error: any) {
    throw new Error(`Content generation failed: ${error.message}`);
  }
}

export type ImageGenerationOptions = {
  prompt: string;
  style: string;
  size: string;
};

export async function generateImage(options: ImageGenerationOptions): Promise<string> {
  try {
    const response = await apiRequest('POST', '/api/ai/generate-image', options);
    const data = await response.json();
    return data.imageUrl;
  } catch (error: any) {
    throw new Error(`Image generation failed: ${error.message}`);
  }
}
