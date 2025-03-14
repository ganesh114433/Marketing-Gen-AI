import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  insertCampaignSchema, 
  insertEventSchema, 
  insertContentSchema, 
  insertImageSchema, 
  insertAnalyticsSchema 
} from "@shared/schema";
import { generateContent, generateImage } from "./openai";
import { 
  getGoogleAuthUrl, 
  getGoogleTokens, 
  getAnalyticsData, 
  getAdsData, 
  getCalendarEvents 
} from "./googleApi";

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // Authentication routes (simplified for demo)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // In a real app, you would create and return a JWT token here
      res.json({ 
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role
      });
    } catch (error) {
      res.status(500).json({ error: "Authentication error" });
    }
  });

  // Campaign routes
  app.get("/api/campaigns", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Valid user ID is required" });
      }
      
      const campaigns = await storage.getCampaignsByUserId(userId);
      res.json(campaigns);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const campaignData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(campaignData);
      res.status(201).json(campaign);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create campaign" });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getCampaign(id);
      
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      
      res.json(campaign);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch campaign" });
    }
  });

  app.put("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const updatedCampaign = await storage.updateCampaign(id, updateData);
      
      if (!updatedCampaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      
      res.json(updatedCampaign);
    } catch (error) {
      res.status(500).json({ error: "Failed to update campaign" });
    }
  });

  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCampaign(id);
      
      if (!success) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete campaign" });
    }
  });

  // Event routes
  app.get("/api/events", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Valid user ID is required" });
      }
      
      const events = await storage.getEventsByUserId(userId);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch events" });
    }
  });

  app.post("/api/events", async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const event = await storage.getEvent(id);
      
      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  app.put("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const updatedEvent = await storage.updateEvent(id, updateData);
      
      if (!updatedEvent) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      res.json(updatedEvent);
    } catch (error) {
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  app.delete("/api/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteEvent(id);
      
      if (!success) {
        return res.status(404).json({ error: "Event not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  // Content routes
  app.get("/api/contents", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const campaignId = req.query.campaignId ? parseInt(req.query.campaignId as string) : undefined;
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Valid user ID is required" });
      }
      
      let contents;
      if (campaignId && !isNaN(campaignId)) {
        contents = await storage.getContentsByCampaignId(campaignId);
      } else {
        contents = await storage.getContentsByUserId(userId);
      }
      
      res.json(contents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contents" });
    }
  });

  app.post("/api/contents", async (req, res) => {
    try {
      const contentData = insertContentSchema.parse(req.body);
      const content = await storage.createContent(contentData);
      res.status(201).json(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create content" });
    }
  });

  app.get("/api/contents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const content = await storage.getContent(id);
      
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }
      
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  app.put("/api/contents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const updatedContent = await storage.updateContent(id, updateData);
      
      if (!updatedContent) {
        return res.status(404).json({ error: "Content not found" });
      }
      
      res.json(updatedContent);
    } catch (error) {
      res.status(500).json({ error: "Failed to update content" });
    }
  });

  app.delete("/api/contents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteContent(id);
      
      if (!success) {
        return res.status(404).json({ error: "Content not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete content" });
    }
  });

  // Image routes
  app.get("/api/images", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const campaignId = req.query.campaignId ? parseInt(req.query.campaignId as string) : undefined;
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Valid user ID is required" });
      }
      
      let images;
      if (campaignId && !isNaN(campaignId)) {
        images = await storage.getImagesByCampaignId(campaignId);
      } else {
        images = await storage.getImagesByUserId(userId);
      }
      
      res.json(images);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch images" });
    }
  });

  app.post("/api/images", async (req, res) => {
    try {
      const imageData = insertImageSchema.parse(req.body);
      const image = await storage.createImage(imageData);
      res.status(201).json(image);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create image" });
    }
  });

  app.get("/api/images/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const image = await storage.getImage(id);
      
      if (!image) {
        return res.status(404).json({ error: "Image not found" });
      }
      
      res.json(image);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch image" });
    }
  });

  app.put("/api/images/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;
      const updatedImage = await storage.updateImage(id, updateData);
      
      if (!updatedImage) {
        return res.status(404).json({ error: "Image not found" });
      }
      
      res.json(updatedImage);
    } catch (error) {
      res.status(500).json({ error: "Failed to update image" });
    }
  });

  app.delete("/api/images/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteImage(id);
      
      if (!success) {
        return res.status(404).json({ error: "Image not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete image" });
    }
  });

  // Analytics routes
  app.get("/api/analytics", async (req, res) => {
    try {
      const userId = parseInt(req.query.userId as string);
      const campaignId = req.query.campaignId ? parseInt(req.query.campaignId as string) : undefined;
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: "Valid user ID is required" });
      }
      
      let analytics;
      if (campaignId && !isNaN(campaignId)) {
        analytics = await storage.getAnalyticsByCampaignId(campaignId);
      } else {
        analytics = await storage.getAnalyticsByUserId(userId);
      }
      
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.post("/api/analytics", async (req, res) => {
    try {
      const analyticsData = insertAnalyticsSchema.parse(req.body);
      const analytics = await storage.createAnalytics(analyticsData);
      res.status(201).json(analytics);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create analytics" });
    }
  });

  // AI Content Generation route
  app.post("/api/ai/generate-content", async (req, res) => {
    try {
      const { contentType, topic, tone, length } = req.body;
      
      if (!contentType || !topic || !tone || !length) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      const generatedContent = await generateContent({ contentType, topic, tone, length });
      res.json({ content: generatedContent });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Content generation failed" });
    }
  });

  // AI Image Generation route
  app.post("/api/ai/generate-image", async (req, res) => {
    try {
      const { prompt, style, size } = req.body;
      
      if (!prompt || !style || !size) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      const result = await generateImage({ prompt, style, size });
      res.json({ imageUrl: result.url });
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Image generation failed" });
    }
  });

  // Google OAuth routes
  app.get("/api/google/auth-url", (_req, res) => {
    try {
      const url = getGoogleAuthUrl();
      res.json({ url });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate authentication URL" });
    }
  });

  app.post("/api/google/callback", async (req, res) => {
    try {
      const { code } = req.body;
      
      if (!code) {
        return res.status(400).json({ error: "Authorization code is required" });
      }
      
      const tokens = await getGoogleTokens(code);
      
      // In a real app, you would save these tokens to the user's record
      res.json({ success: true, tokens });
    } catch (error) {
      res.status(500).json({ error: "Failed to exchange authorization code" });
    }
  });

  // Google Analytics data route
  app.get("/api/google/analytics", async (req, res) => {
    try {
      // In a real app, you would get these tokens from the user's record
      const tokens = req.headers.authorization?.split(" ")[1]; // Example: Bearer {tokens}
      const viewId = req.query.viewId as string;
      const startDate = req.query.startDate as string || "7daysAgo";
      const endDate = req.query.endDate as string || "today";
      
      if (!tokens || !viewId) {
        return res.status(400).json({ error: "Authentication tokens and view ID are required" });
      }
      
      const data = await getAnalyticsData(tokens, viewId, startDate, endDate);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch analytics data" });
    }
  });

  // Google Ads data route
  app.get("/api/google/ads", async (req, res) => {
    try {
      // In a real app, you would get these tokens from the user's record
      const tokens = req.headers.authorization?.split(" ")[1]; // Example: Bearer {tokens}
      const customerId = req.query.customerId as string;
      const startDate = req.query.startDate as string || "7daysAgo";
      const endDate = req.query.endDate as string || "today";
      
      if (!tokens || !customerId) {
        return res.status(400).json({ error: "Authentication tokens and customer ID are required" });
      }
      
      const data = await getAdsData(tokens, customerId, startDate, endDate);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch ads data" });
    }
  });

  // Google Calendar events route
  app.get("/api/google/calendar", async (req, res) => {
    try {
      // In a real app, you would get these tokens from the user's record
      const tokens = req.headers.authorization?.split(" ")[1]; // Example: Bearer {tokens}
      const calendarId = req.query.calendarId as string || "primary";
      const timeMin = req.query.timeMin as string || new Date().toISOString();
      const timeMax = req.query.timeMax as string || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      
      if (!tokens) {
        return res.status(400).json({ error: "Authentication tokens are required" });
      }
      
      const events = await getCalendarEvents(tokens, calendarId, timeMin, timeMax);
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ error: error.message || "Failed to fetch calendar events" });
    }
  });

  // Create default data route (for demo purposes)
  app.post("/api/seed", async (_req, res) => {
    try {
      // Create a default user if not already created
      let user = await storage.getUserByUsername("demo");
      
      if (!user) {
        user = await storage.createUser({
          username: "demo",
          password: "password",
          email: "demo@example.com",
          name: "Sarah Johnson",
          role: "Marketing Manager"
        });
      }
      
      // Create default campaigns
      const campaign1 = await storage.createCampaign({
        userId: user.id,
        name: "Summer Collection Launch",
        description: "Launch campaign for the new summer collection",
        startDate: new Date("2023-07-15"),
        endDate: new Date("2023-08-15"),
        status: "active",
        budget: 5000,
        platform: "multiple"
      });
      
      const campaign2 = await storage.createCampaign({
        userId: user.id,
        name: "Special Offer Campaign",
        description: "Limited time special offers promotion",
        startDate: new Date("2023-07-18"),
        endDate: new Date("2023-07-25"),
        status: "draft",
        budget: 2000,
        platform: "social"
      });
      
      // Create default events
      await storage.createEvent({
        userId: user.id,
        title: "Product Promotion",
        description: "Promotion of new product line",
        date: new Date("2023-07-19T10:00:00"),
        type: "marketing",
        status: "pending"
      });
      
      await storage.createEvent({
        userId: user.id,
        title: "Summer Sale Launch",
        description: "Official launch of summer sale",
        date: new Date("2023-07-22T09:00:00"),
        type: "sale",
        status: "confirmed"
      });
      
      await storage.createEvent({
        userId: user.id,
        title: "Email Newsletter",
        description: "Monthly newsletter sending",
        date: new Date("2023-07-28T16:00:00"),
        type: "email",
        status: "scheduled"
      });
      
      // Create default content
      await storage.createContent({
        userId: user.id,
        campaignId: campaign1.id,
        title: "Summer Collection Blog Post",
        description: "Blog post with product showcase",
        contentType: "blog",
        content: "# Summer Collection Launch\n\nIntroducing our latest summer collection...",
        status: "draft",
        scheduledFor: new Date("2023-07-15")
      });
      
      await storage.createContent({
        userId: user.id,
        campaignId: campaign2.id,
        title: "Special Offer Social Post",
        description: "Social media post for special offers",
        contentType: "social",
        content: "Don't miss our limited time special offers! Up to 50% off on selected items...",
        status: "ready",
        scheduledFor: new Date("2023-07-18")
      });
      
      await storage.createContent({
        userId: user.id,
        campaignId: campaign1.id,
        title: "Monthly Newsletter",
        description: "Email campaign with product updates",
        contentType: "email",
        content: "Dear valued customer,\n\nWe're excited to share our latest updates...",
        status: "scheduled",
        scheduledFor: new Date("2023-07-22")
      });
      
      // Create default analytics data
      const now = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        await storage.createAnalytics({
          userId: user.id,
          campaignId: campaign1.id,
          date,
          impressions: Math.floor(Math.random() * 100000) + 50000,
          clicks: Math.floor(Math.random() * 5000) + 2000,
          conversions: Math.floor(Math.random() * 200) + 100,
          revenue: Math.floor(Math.random() * 5000) + 2000,
          source: "google_ads"
        });
        
        await storage.createAnalytics({
          userId: user.id,
          campaignId: campaign2.id,
          date,
          impressions: Math.floor(Math.random() * 80000) + 30000,
          clicks: Math.floor(Math.random() * 3000) + 1000,
          conversions: Math.floor(Math.random() * 100) + 50,
          revenue: Math.floor(Math.random() * 3000) + 1000,
          source: "facebook_ads"
        });
      }
      
      res.json({ success: true, message: "Demo data created successfully" });
    } catch (error) {
      console.error("Error creating demo data:", error);
      res.status(500).json({ error: "Failed to create demo data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
