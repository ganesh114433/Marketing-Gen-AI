import { Request, Response } from "express";
import { generateImagePrompt, generateImage } from "../lib/openai";

export async function createImagePrompt(req: Request, res: Response) {
  try {
    const { topic, style, industry } = req.body;
    
    if (!topic || !style || !industry) {
      return res.status(400).json({ message: "Topic, style, and industry are required" });
    }

    const prompt = await generateImagePrompt(topic, style, industry);
    return res.json({ prompt });
  } catch (error) {
    console.error("Error creating image prompt:", error);
    return res.status(500).json({ message: "Failed to create image prompt" });
  }
}

export async function createImage(req: Request, res: Response) {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    const result = await generateImage(prompt);
    return res.json({ imageUrl: result.url });
  } catch (error) {
    console.error("Error creating image:", error);
    return res.status(500).json({ message: "Failed to create image" });
  }
}

export async function generateMarketingImage(req: Request, res: Response) {
  try {
    const { topic, style, industry } = req.body;
    
    if (!topic || !style || !industry) {
      return res.status(400).json({ message: "Topic, style, and industry are required" });
    }

    // First generate the prompt
    const prompt = await generateImagePrompt(topic, style, industry);
    
    // Then generate the image
    const result = await generateImage(prompt);
    
    return res.json({ 
      imageUrl: result.url,
      prompt 
    });
  } catch (error) {
    console.error("Error generating marketing image:", error);
    return res.status(500).json({ message: "Failed to generate marketing image" });
  }
}
