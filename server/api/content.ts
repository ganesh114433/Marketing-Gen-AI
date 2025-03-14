import { Request, Response } from "express";
import { storage } from "../storage";
import { insertContentSchema } from "@shared/schema";
import { generateContent, generateContentFromEvent } from "../lib/openai";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function getContents(req: Request, res: Response) {
  try {
    const userId = Number(req.query.userId);
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const campaignId = req.query.campaignId ? Number(req.query.campaignId) : undefined;
    const type = req.query.type as string | undefined;
    const status = req.query.status as string | undefined;

    const filters: any = {};
    if (campaignId) filters.campaignId = campaignId;
    if (type) filters.type = type;
    if (status) filters.status = status;

    const contents = await storage.getContents(userId, filters);
    return res.json(contents);
  } catch (error) {
    console.error("Error fetching contents:", error);
    return res.status(500).json({ message: "Failed to fetch contents" });
  }
}

export async function getContent(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid content ID" });
    }

    const content = await storage.getContent(id);
    if (!content) {
      return res.status(404).json({ message: "Content not found" });
    }

    return res.json(content);
  } catch (error) {
    console.error("Error fetching content:", error);
    return res.status(500).json({ message: "Failed to fetch content" });
  }
}

export async function createContent(req: Request, res: Response) {
  try {
    const contentData = insertContentSchema.parse(req.body);
    const content = await storage.createContent(contentData);
    return res.status(201).json(content);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error creating content:", error);
    return res.status(500).json({ message: "Failed to create content" });
  }
}

export async function updateContent(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid content ID" });
    }

    const contentData = req.body;
    const updatedContent = await storage.updateContent(id, contentData);
    
    if (!updatedContent) {
      return res.status(404).json({ message: "Content not found" });
    }

    return res.json(updatedContent);
  } catch (error) {
    console.error("Error updating content:", error);
    return res.status(500).json({ message: "Failed to update content" });
  }
}

export async function deleteContent(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid content ID" });
    }

    const result = await storage.deleteContent(id);
    if (!result) {
      return res.status(404).json({ message: "Content not found" });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting content:", error);
    return res.status(500).json({ message: "Failed to delete content" });
  }
}

export async function generateAiContent(req: Request, res: Response) {
  try {
    const { contentType, topic, tone, additionalContext } = req.body;
    
    if (!contentType || !topic || !tone) {
      return res.status(400).json({ message: "Content type, topic, and tone are required" });
    }

    const generatedContent = await generateContent(contentType, topic, tone, additionalContext);
    return res.json({ content: generatedContent });
  } catch (error) {
    console.error("Error generating AI content:", error);
    return res.status(500).json({ message: "Failed to generate content" });
  }
}

export async function generateContentFromCalendarEvent(req: Request, res: Response) {
  try {
    const { eventId, contentType, tone } = req.body;
    
    if (!eventId || !contentType || !tone) {
      return res.status(400).json({ message: "Event ID, content type, and tone are required" });
    }

    const event = await storage.getEvent(Number(eventId));
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    const generatedContent = await generateContentFromEvent(
      event.title,
      event.description || "",
      event.startDate,
      contentType,
      tone
    );

    return res.json({ content: generatedContent, eventId: event.id });
  } catch (error) {
    console.error("Error generating content from event:", error);
    return res.status(500).json({ message: "Failed to generate content from event" });
  }
}
