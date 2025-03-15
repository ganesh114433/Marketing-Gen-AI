import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "sk-dummy-key",
  maxRetries: 3,
  timeout: 30000
});

export type ContentGenerationOptions = {
  contentType: string;
  topic: string;
  tone: string;
  length: string;
};

export async function generateContent(options: ContentGenerationOptions): Promise<string> {
  const { contentType, topic, tone, length } = options;
  
  let wordCount = 150;
  if (length.includes("Medium")) {
    wordCount = 300;
  } else if (length.includes("Long")) {
    wordCount = 600;
  }
  
  const prompt = `
    Generate ${contentType} content about "${topic}".
    Use a ${tone.toLowerCase()} tone.
    The content should be approximately ${wordCount} words.
    
    Make sure the content is engaging, well-structured, and focused on ${topic}.
    Include relevant calls-to-action appropriate for a ${contentType.toLowerCase()}.
  `;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are an expert digital marketer specializing in creating compelling content." },
        { role: "user", content: prompt }
      ],
    });

    return response.choices[0].message.content || "Failed to generate content. Please try again.";
  } catch (error: any) {
    console.error("OpenAI content generation error:", error);
    throw new Error(`Content generation failed: ${error.message}`);
  }
}

export type ImageGenerationOptions = {
  prompt: string;
  style: string;
  size: string;
};

export async function generateImage(options: ImageGenerationOptions): Promise<{ url: string }> {
  const { prompt, style, size } = options;
  
  let dimensions = "1024x1024";
  if (size.includes("4:5")) {
    dimensions = "1024x1280";
  } else if (size.includes("16:9")) {
    dimensions = "1792x1024";
  } else if (size.includes("9:16")) {
    dimensions = "1024x1792";
  }
  
  const enhancedPrompt = `${prompt}. Style: ${style}.`;
  
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: enhancedPrompt,
      n: 1,
      size: dimensions as any,
      quality: "standard",
    });

    return { url: response.data[0].url || "" };
  } catch (error: any) {
    console.error("OpenAI image generation error:", error);
    throw new Error(`Image generation failed: ${error.message}`);
  }
}
