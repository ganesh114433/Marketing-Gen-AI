import { Request, Response } from "express";
import { storage } from "../storage";
import { insertCampaignSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function getCampaigns(req: Request, res: Response) {
  try {
    const userId = Number(req.query.userId);
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const campaigns = await storage.getCampaigns(userId);
    return res.json(campaigns);
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return res.status(500).json({ message: "Failed to fetch campaigns" });
  }
}

export async function getCampaign(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }

    const campaign = await storage.getCampaign(id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    return res.json(campaign);
  } catch (error) {
    console.error("Error fetching campaign:", error);
    return res.status(500).json({ message: "Failed to fetch campaign" });
  }
}

export async function createCampaign(req: Request, res: Response) {
  try {
    const campaignData = insertCampaignSchema.parse(req.body);
    const campaign = await storage.createCampaign(campaignData);
    return res.status(201).json(campaign);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error creating campaign:", error);
    return res.status(500).json({ message: "Failed to create campaign" });
  }
}

export async function updateCampaign(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }

    const campaignData = req.body;
    const updatedCampaign = await storage.updateCampaign(id, campaignData);
    
    if (!updatedCampaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    return res.json(updatedCampaign);
  } catch (error) {
    console.error("Error updating campaign:", error);
    return res.status(500).json({ message: "Failed to update campaign" });
  }
}

export async function deleteCampaign(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }

    const result = await storage.deleteCampaign(id);
    if (!result) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting campaign:", error);
    return res.status(500).json({ message: "Failed to delete campaign" });
  }
}

export async function getCampaignContents(req: Request, res: Response) {
  try {
    const campaignId = Number(req.params.id);
    if (isNaN(campaignId)) {
      return res.status(400).json({ message: "Invalid campaign ID" });
    }

    const userId = Number(req.query.userId);
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const campaign = await storage.getCampaign(campaignId);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found" });
    }

    const contents = await storage.getContents(userId, { campaignId });
    return res.json(contents);
  } catch (error) {
    console.error("Error fetching campaign contents:", error);
    return res.status(500).json({ message: "Failed to fetch campaign contents" });
  }
}
