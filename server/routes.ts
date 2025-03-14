import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

// Import API handlers
import * as contentApi from "./api/content";
import * as imagesApi from "./api/images";
import * as campaignsApi from "./api/campaigns";
import * as analyticsApi from "./api/analytics";
import * as calendarApi from "./api/calendar";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/user/:id", async (req, res) => {
    const id = Number(req.params.id);
    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.json(user);
  });

  // For demo purposes, get the first user
  app.get("/api/user", async (req, res) => {
    const demoUser = await storage.getUser(1);
    if (!demoUser) {
      return res.status(404).json({ message: "Demo user not found" });
    }
    return res.json(demoUser);
  });

  // Content routes
  app.get("/api/contents", contentApi.getContents);
  app.get("/api/contents/:id", contentApi.getContent);
  app.post("/api/contents", contentApi.createContent);
  app.put("/api/contents/:id", contentApi.updateContent);
  app.delete("/api/contents/:id", contentApi.deleteContent);
  app.post("/api/contents/generate", contentApi.generateAiContent);
  app.post("/api/contents/generate-from-event", contentApi.generateContentFromCalendarEvent);

  // Image generation routes
  app.post("/api/images/prompt", imagesApi.createImagePrompt);
  app.post("/api/images/generate", imagesApi.createImage);
  app.post("/api/images/marketing", imagesApi.generateMarketingImage);

  // Campaign routes
  app.get("/api/campaigns", campaignsApi.getCampaigns);
  app.get("/api/campaigns/:id", campaignsApi.getCampaign);
  app.post("/api/campaigns", campaignsApi.createCampaign);
  app.put("/api/campaigns/:id", campaignsApi.updateCampaign);
  app.delete("/api/campaigns/:id", campaignsApi.deleteCampaign);
  app.get("/api/campaigns/:id/contents", campaignsApi.getCampaignContents);

  // Analytics routes
  app.get("/api/analytics", analyticsApi.getAnalytics);
  app.post("/api/analytics", analyticsApi.createAnalytics);
  app.get("/api/analytics/google", analyticsApi.getGoogleAnalyticsData);
  app.get("/api/analytics/ads", analyticsApi.getGoogleAdsData);
  app.get("/api/analytics/dashboard", analyticsApi.getDashboardAnalytics);

  // Calendar routes
  app.get("/api/events", calendarApi.getEvents);
  app.get("/api/events/:id", calendarApi.getEvent);
  app.post("/api/events", calendarApi.createEvent);
  app.put("/api/events/:id", calendarApi.updateEvent);
  app.delete("/api/events/:id", calendarApi.deleteEvent);
  app.get("/api/events/upcoming", calendarApi.getUpcomingEvents);

  const httpServer = createServer(app);
  return httpServer;
}
