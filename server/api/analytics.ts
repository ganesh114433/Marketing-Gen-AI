import { Request, Response } from "express";
import { storage } from "../storage";
import { insertAnalyticsSchema } from "@shared/schema";
import { getAnalyticsData, getAdsData } from "../lib/google";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function getAnalytics(req: Request, res: Response) {
  try {
    const userId = Number(req.query.userId);
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const campaignId = req.query.campaignId ? Number(req.query.campaignId) : undefined;
    const analytics = await storage.getAnalytics(userId, campaignId);
    return res.json(analytics);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return res.status(500).json({ message: "Failed to fetch analytics" });
  }
}

export async function createAnalytics(req: Request, res: Response) {
  try {
    const analyticsData = insertAnalyticsSchema.parse(req.body);
    const analytics = await storage.createAnalytics(analyticsData);
    return res.status(201).json(analytics);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error creating analytics:", error);
    return res.status(500).json({ message: "Failed to create analytics" });
  }
}

export async function getGoogleAnalyticsData(req: Request, res: Response) {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date();
    startDate.setDate(startDate.getDate() - 30); // Default to 30 days ago
    
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    
    const analyticsData = await getAnalyticsData({ startDate, endDate });
    return res.json(analyticsData);
  } catch (error) {
    console.error("Error fetching Google Analytics data:", error);
    return res.status(500).json({ message: "Failed to fetch Google Analytics data" });
  }
}

export async function getGoogleAdsData(req: Request, res: Response) {
  try {
    const startDate = req.query.startDate ? new Date(req.query.startDate as string) : new Date();
    startDate.setDate(startDate.getDate() - 30); // Default to 30 days ago
    
    const endDate = req.query.endDate ? new Date(req.query.endDate as string) : new Date();
    
    const campaignIds = req.query.campaignIds ? (req.query.campaignIds as string).split(',') : undefined;
    
    const adsData = await getAdsData(campaignIds, { startDate, endDate });
    return res.json(adsData);
  } catch (error) {
    console.error("Error fetching Google Ads data:", error);
    return res.status(500).json({ message: "Failed to fetch Google Ads data" });
  }
}

export async function getDashboardAnalytics(req: Request, res: Response) {
  try {
    const userId = Number(req.query.userId);
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Get the latest analytics entry
    const analyticsData = await storage.getAnalytics(userId);
    const latestAnalytics = analyticsData.length > 0 ? analyticsData[0] : null;
    
    // Get all active campaigns
    const campaigns = await storage.getCampaigns(userId);
    const activeCampaigns = campaigns.filter(campaign => campaign.status === 'active');
    
    return res.json({
      metrics: latestAnalytics?.metrics || {},
      activeCampaignsCount: activeCampaigns.length,
      campaigns: activeCampaigns.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        platform: campaign.platform,
        status: campaign.status,
        metrics: campaign.metrics || {}
      }))
    });
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    return res.status(500).json({ message: "Failed to fetch dashboard analytics" });
  }
}
