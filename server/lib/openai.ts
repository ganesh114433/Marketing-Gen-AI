import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate marketing content based on parameters
 */
export async function generateContent(
  contentType: string,
  topic: string, 
  tone: string,
  additionalContext?: string
): Promise<string> {
  try {
    const prompt = `
      Create ${contentType} content about "${topic}" with a ${tone} tone. 
      ${additionalContext ? `Additional context: ${additionalContext}` : ''}
      
      Please craft professional marketing content suitable for a business audience.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "Could not generate content";
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error(`Failed to generate content: ${error.message}`);
  }
}

/**
 * Generate content based on a calendar event
 */
export async function generateContentFromEvent(
  eventTitle: string,
  eventDescription: string,
  eventDate: Date,
  contentType: string,
  tone: string
): Promise<string> {
  try {
    const dateFormatted = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const prompt = `
      Create ${contentType} for an upcoming event: 
      Event title: "${eventTitle}"
      Event description: "${eventDescription}"
      Event date: ${dateFormatted}
      
      The content should have a ${tone} tone and be optimized for marketing purposes.
      Include relevant details about the event and call-to-actions appropriate for the event type.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "Could not generate content";
  } catch (error) {
    console.error("Error generating content from event:", error);
    throw new Error(`Failed to generate content from event: ${error.message}`);
  }
}

/**
 * Generate an image prompt based on marketing parameters
 */
export async function generateImagePrompt(
  topic: string,
  style: string,
  industry: string
): Promise<string> {
  try {
    const prompt = `
      Create a detailed image prompt for DALL-E to generate a marketing image for:
      Topic: "${topic}"
      Style: ${style}
      Industry: ${industry}
      
      The prompt should describe a professional, high-quality marketing image 
      suitable for a business context. Don't use any trademarked elements.
      Make the description detailed and specific for best results.
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 500,
    });

    return response.choices[0].message.content || "Professional marketing image for business use";
  } catch (error) {
    console.error("Error generating image prompt:", error);
    throw new Error(`Failed to generate image prompt: ${error.message}`);
  }
}

/**
 * Generate an image using DALL-E
 */
export async function generateImage(prompt: string): Promise<{ url: string }> {
  try {
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return { url: response.data[0].url || "" };
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error(`Failed to generate image: ${error.message}`);
  }
}
