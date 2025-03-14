import OpenAI from "openai";
import { ContentGenerationRequest, ImageGenerationRequest } from "@shared/schema";

// Initialize OpenAI with API key
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || 'YOUR_OPENAI_API_KEY' 
});

// Function to generate content using OpenAI
export async function generateContent(request: ContentGenerationRequest): Promise<string> {
  try {
    // Build prompt based on request parameters
    let prompt = `Please generate ${request.type} content about ${request.topic}`;
    
    if (request.platform) {
      prompt += ` for ${request.platform}`;
    }
    
    if (request.tone) {
      prompt += ` in a ${request.tone} tone`;
    }
    
    if (request.length) {
      const lengthMap = {
        short: "concise and brief (around 50-100 words)",
        medium: "moderately detailed (around 200-300 words)",
        long: "comprehensive and detailed (around 500-800 words)"
      };
      prompt += `, ${lengthMap[request.length]}`;
    }
    
    if (request.keywords) {
      prompt += `, incorporating these keywords: ${request.keywords}`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are an expert digital marketing content creator that specializes in creating engaging, persuasive, and effective marketing content."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "Unable to generate content";
  } catch (error) {
    console.error("Error generating content with OpenAI:", error);
    throw new Error(`Failed to generate content: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Function to generate image using DALL-E
export async function generateImage(request: ImageGenerationRequest): Promise<{ url: string }> {
  try {
    let prompt = request.prompt;
    
    if (request.style) {
      prompt += `, in ${request.style} style`;
    }

    const size = request.size === "small" ? "1024x1024" : 
                request.size === "medium" ? "1024x1024" : "1024x1024";

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: size,
      quality: "standard",
    });

    if (!response.data[0].url) {
      throw new Error("No image URL returned from OpenAI");
    }

    return { url: response.data[0].url };
  } catch (error) {
    console.error("Error generating image with DALL-E:", error);
    throw new Error(`Failed to generate image: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Function to analyze content sentiment
export async function analyzeSentiment(text: string): Promise<{ 
  sentiment: string,
  score: number,
  feedback: string 
}> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a marketing content analyzer. Analyze the sentiment and effectiveness of marketing content and respond with JSON containing a sentiment (positive, neutral, negative), a score from 0-100, and brief feedback for improvement."
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      sentiment: result.sentiment || "neutral",
      score: result.score || 50,
      feedback: result.feedback || "No feedback available"
    };
  } catch (error) {
    console.error("Error analyzing sentiment with OpenAI:", error);
    return {
      sentiment: "neutral",
      score: 50,
      feedback: "Error analyzing content"
    };
  }
}

// Function to generate content ideas based on upcoming events
export async function generateContentIdeas(events: string[], marketingGoals: string[]): Promise<string[]> {
  try {
    const prompt = `Based on these upcoming events: ${events.join(", ")} and these marketing goals: ${marketingGoals.join(", ")}, suggest 5 content ideas that would be effective for marketing campaigns.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        {
          role: "system",
          content: "You are a creative marketing strategist. Generate innovative content ideas based on events and goals. Return a JSON array of idea strings."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return result.ideas || [];
  } catch (error) {
    console.error("Error generating content ideas with OpenAI:", error);
    return ["Failed to generate content ideas"];
  }
}
