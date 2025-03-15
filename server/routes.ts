import express, { Request, Response, NextFunction } from "express";
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  contentGenerationSchema, 
  imageGenerationSchema, 
  insertCalendarEventSchema,
  insertContentEntrySchema,
  insertImageEntrySchema
} from "@shared/schema";
import { generateContent, generateImage } from "./api/openai";
import { getAuthUrl, getTokensFromCode, getGoogleAdsData, getGoogleAnalyticsData } from "./api/google";
import { 
  getAutomationStatus, 
  toggleAutoPosting, 
  toggleEventScheduler, 
  addCompanySpecialDates, 
  forceCheckEvents, 
  getAutomationActivity 
} from "./api/automation";
import { ZodError } from "zod";
import { salesPredictionService } from "./api/salesPrediction"; // Import the sales prediction service
import chatbotRoutes from './api/chatbot'; // Import chatbot routes


export async function registerRoutes(app: Express): Promise<Server> {
  const router = express.Router();

  // Error handling middleware for API routes
  const handleApiError = (err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);

    if (err instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: err.errors,
      });
    }

    return res.status(500).json({
      message: err.message || "Internal server error",
    });
  };

  // User endpoints
  router.post("/users", async (req, res, next) => {
    try {
      const user = await storage.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      next(error);
    }
  });

  router.get("/users/:id", async (req, res, next) => {
    try {
      const user = await storage.getUser(Number(req.params.id));
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      next(error);
    }
  });

  // Content generation endpoints
  router.post("/content/generate", async (req, res, next) => {
    try {
      const validatedRequest = contentGenerationSchema.parse(req.body);
      const generatedContent = await generateContent(validatedRequest);

      res.json({
        content: generatedContent,
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/content", async (req, res, next) => {
    try {
      const validatedData = insertContentEntrySchema.parse(req.body);
      const content = await storage.createContentEntry(validatedData);
      res.status(201).json(content);
    } catch (error) {
      next(error);
    }
  });

  router.get("/content", async (req, res, next) => {
    try {
      const userId = Number(req.query.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }

      const contents = await storage.getContentEntriesByUserId(userId);
      res.json(contents);
    } catch (error) {
      next(error);
    }
  });

  router.get("/content/:id", async (req, res, next) => {
    try {
      const content = await storage.getContentEntry(Number(req.params.id));
      if (!content) {
        return res.status(404).json({ message: "Content not found" });
      }
      res.json(content);
    } catch (error) {
      next(error);
    }
  });

  // Image generation endpoints
  router.post("/images/generate", async (req, res, next) => {
    try {
      const validatedRequest = imageGenerationSchema.parse(req.body);
      const generatedImage = await generateImage(validatedRequest);

      res.json({
        imageUrl: generatedImage.url,
      });
    } catch (error) {
      next(error);
    }
  });

  router.post("/images", async (req, res, next) => {
    try {
      const validatedData = insertImageEntrySchema.parse(req.body);
      const image = await storage.createImageEntry(validatedData);
      res.status(201).json(image);
    } catch (error) {
      next(error);
    }
  });

  router.get("/images", async (req, res, next) => {
    try {
      const userId = Number(req.query.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }

      const images = await storage.getImageEntriesByUserId(userId);
      res.json(images);
    } catch (error) {
      next(error);
    }
  });

  // Calendar events endpoints
  router.post("/events", async (req, res, next) => {
    try {
      const validatedData = insertCalendarEventSchema.parse(req.body);
      const event = await storage.createCalendarEvent(validatedData);
      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  });

  router.get("/events", async (req, res, next) => {
    try {
      const userId = Number(req.query.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }

      const events = await storage.getCalendarEventsByUserId(userId);
      res.json(events);
    } catch (error) {
      next(error);
    }
  });

  router.get("/events/:id", async (req, res, next) => {
    try {
      const event = await storage.getCalendarEvent(Number(req.params.id));
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      res.json(event);
    } catch (error) {
      next(error);
    }
  });

  router.patch("/events/:id", async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      const event = await storage.getCalendarEvent(id);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      const updatedEvent = await storage.updateCalendarEvent(id, req.body);
      res.json(updatedEvent);
    } catch (error) {
      next(error);
    }
  });

  // Campaign metrics endpoints
  router.get("/metrics", async (req, res, next) => {
    try {
      const userId = Number(req.query.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }

      const metrics = await storage.getCampaignMetricsByUserId(userId);
      res.json(metrics);
    } catch (error) {
      next(error);
    }
  });

  // Google integrations endpoints
  router.get("/auth/google/:service", async (req, res, next) => {
    try {
      const service = req.params.service as 'google_ads' | 'google_analytics';
      if (service !== 'google_ads' && service !== 'google_analytics') {
        return res.status(400).json({ message: "Invalid service" });
      }

      const authUrl = getAuthUrl(service);
      res.json({ authUrl });
    } catch (error) {
      next(error);
    }
  });

  router.get("/auth/google/callback", async (req, res, next) => {
    try {
      const { code, state } = req.query;
      if (!code || !state) {
        return res.status(400).json({ message: "Missing code or state" });
      }

      const service = state.toString();
      if (service !== 'google_ads' && service !== 'google_analytics') {
        return res.status(400).json({ message: "Invalid service" });
      }

      const tokens = await getTokensFromCode(code.toString());

      // In a real app, you would associate these tokens with a user
      // For this example, we'll just return them to the client
      res.json({
        service,
        ...tokens
      });
    } catch (error) {
      next(error);
    }
  });

  router.get("/integrations", async (req, res, next) => {
    try {
      const userId = Number(req.query.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }

      const integrations = await storage.getIntegrationsByUserId(userId);
      res.json(integrations);
    } catch (error) {
      next(error);
    }
  });

  router.post("/integrations", async (req, res, next) => {
    try {
      const integration = await storage.createIntegration(req.body);
      res.status(201).json(integration);
    } catch (error) {
      next(error);
    }
  });

  // Google Ads data endpoint
  router.get("/google/ads", async (req, res, next) => {
    try {
      const userId = Number(req.query.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }

      const integrations = await storage.getIntegrationsByUserIdAndService(userId, 'google_ads');
      if (integrations.length === 0) {
        return res.status(404).json({ message: "Google Ads integration not found" });
      }

      const adsData = await getGoogleAdsData(integrations[0]);
      res.json(adsData);
    } catch (error) {
      next(error);
    }
  });

  // Google Analytics data endpoint
  router.get("/google/analytics", async (req, res, next) => {
    try {
      const userId = Number(req.query.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }

      const integrations = await storage.getIntegrationsByUserIdAndService(userId, 'google_analytics');
      if (integrations.length === 0) {
        return res.status(404).json({ message: "Google Analytics integration not found" });
      }

      const analyticsData = await getGoogleAnalyticsData(integrations[0]);
      res.json(analyticsData);
    } catch (error) {
      next(error);
    }
  });

  // Dashboard summary endpoint
  router.get("/dashboard/summary", async (req, res, next) => {
    try {
      const userId = Number(req.query.userId);
      if (isNaN(userId)) {
        return res.status(400).json({ message: "Valid userId is required" });
      }

      // Get all the data needed for the dashboard
      const [contentEntries, imageEntries, calendarEvents, campaignMetrics] = await Promise.all([
        storage.getContentEntriesByUserId(userId),
        storage.getImageEntriesByUserId(userId),
        storage.getCalendarEventsByUserId(userId),
        storage.getCampaignMetricsByUserId(userId)
      ]);

      // Calculate campaign performance (example formula)
      const totalImpressions = campaignMetrics.reduce((sum, metric) => sum + (metric.impressions || 0), 0);
      const totalClicks = campaignMetrics.reduce((sum, metric) => sum + (metric.clicks || 0), 0);
      const totalConversions = campaignMetrics.reduce((sum, metric) => sum + (metric.conversions || 0), 0);
      const totalAdSpend = campaignMetrics.reduce((sum, metric) => sum + (metric.adSpend || 0), 0);

      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      const conversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;
      const costPerConversion = totalConversions > 0 ? totalAdSpend / totalConversions : 0;

      // Filter upcoming calendar events
      const now = new Date();
      const upcomingEvents = calendarEvents
        .filter(event => {
          const startDate = event.startDate;
          return startDate instanceof Date && startDate > now;
        })
        .sort((a, b) => {
          const aDate = a.startDate instanceof Date ? a.startDate : new Date(a.startDate);
          const bDate = b.startDate instanceof Date ? b.startDate : new Date(b.startDate);
          return aDate.getTime() - bDate.getTime();
        })
        .slice(0, 5);

      // Recent content
      const recentContent = contentEntries
        .filter(content => content.createdAt instanceof Date)
        .sort((a, b) => {
          const aDate = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt || 0);
          const bDate = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt || 0);
          return bDate.getTime() - aDate.getTime();
        })
        .slice(0, 5);

      res.json({
        metrics: {
          campaignPerformance: {
            value: ((ctr + conversionRate) / 2).toFixed(1), // Simple average of CTR and conversion rate
            change: "+12.5%", // Example value
          },
          contentCount: {
            value: contentEntries.length,
            recent: contentEntries.filter(c => {
              if (!c.createdAt) return false;
              const createdAt = c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt);
              return createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000);
            }).length,
          },
          adSpend: {
            value: (totalAdSpend / 100).toFixed(2), // Convert cents to dollars
            change: "+2.3%", // Example value
          },
          scheduledPosts: {
            value: upcomingEvents.length,
            nextIn: upcomingEvents.length > 0 ? 
              Math.ceil((new Date(upcomingEvents[0].startDate).getTime() - now.getTime()) / (60 * 60 * 1000)) + 'h' : 
              'N/A',
          },
        },
        campaignPerformance: {
          impressions: totalImpressions,
          clicks: totalClicks,
          conversions: totalConversions,
          ctr: ctr.toFixed(2),
          conversionRate: conversionRate.toFixed(2),
          costPerConversion: costPerConversion.toFixed(2),
        },
        upcomingEvents,
        recentContent,
      });
    } catch (error) {
      next(error);
    }
  });

  // Automation endpoints
  router.get("/automation/status", getAutomationStatus);
  router.post("/automation/toggle-autoposting", toggleAutoPosting);
  router.post("/automation/toggle-scheduler", toggleEventScheduler);
  router.post("/automation/add-special-dates", addCompanySpecialDates);
  router.post("/automation/check-events", forceCheckEvents);
  router.get("/automation/activity", getAutomationActivity);

  // Sales prediction routes
  router.get('/api/sales/predictions', async (req, res) => {
    try {
      const { startDate = '7daysAgo', endDate = 'today' } = req.query;
      const predictions = await salesPredictionService.predictSales(
        req.user?.tokens,
        startDate as string,
        endDate as string
      );
      res.json(predictions);
    } catch (error) {
      console.error('Error getting sales predictions:', error);
      res.status(500).json({ error: 'Failed to get sales predictions' });
    }
  });

  router.use('/chatbot', chatbotRoutes); // Add chatbot routes

  // Register all routes with the /api prefix
  app.use("/api", router);

  // API error handling
  app.use("/api", handleApiError);

  // Create HTTP server
  const httpServer = createServer(app);

  return httpServer;
}