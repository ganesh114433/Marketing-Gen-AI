import { 
  users, type User, type InsertUser,
  campaigns, type Campaign, type InsertCampaign,
  contents, type Content, type InsertContent,
  events, type Event, type InsertEvent,
  analytics, type Analytics, type InsertAnalytics,
  integrations, type Integration, type InsertIntegration
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Campaign operations
  getCampaigns(userId: number): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<Campaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;
  
  // Content operations
  getContents(userId: number, filters?: Partial<Content>): Promise<Content[]>;
  getContent(id: number): Promise<Content | undefined>;
  createContent(content: InsertContent): Promise<Content>;
  updateContent(id: number, content: Partial<Content>): Promise<Content | undefined>;
  deleteContent(id: number): Promise<boolean>;
  
  // Event operations
  getEvents(userId: number): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Analytics operations
  getAnalytics(userId: number, campaignId?: number): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  
  // Integration operations
  getIntegrations(userId: number): Promise<Integration[]>;
  getIntegration(id: number): Promise<Integration | undefined>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: number, integration: Partial<Integration>): Promise<Integration | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private campaigns: Map<number, Campaign>;
  private contents: Map<number, Content>;
  private events: Map<number, Event>;
  private analytics: Map<number, Analytics>;
  private integrations: Map<number, Integration>;
  
  private currentUserId: number;
  private currentCampaignId: number;
  private currentContentId: number;
  private currentEventId: number;
  private currentAnalyticsId: number;
  private currentIntegrationId: number;

  constructor() {
    this.users = new Map();
    this.campaigns = new Map();
    this.contents = new Map();
    this.events = new Map();
    this.analytics = new Map();
    this.integrations = new Map();
    
    this.currentUserId = 1;
    this.currentCampaignId = 1;
    this.currentContentId = 1;
    this.currentEventId = 1;
    this.currentAnalyticsId = 1;
    this.currentIntegrationId = 1;
    
    // Add demo user
    this.createUser({
      username: "demo",
      password: "password",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      role: "Marketing Manager"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  // Campaign operations
  async getCampaigns(userId: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(
      (campaign) => campaign.userId === userId,
    );
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.currentCampaignId++;
    const campaign: Campaign = { ...insertCampaign, id, createdAt: new Date() };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: number, campaignUpdate: Partial<Campaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;

    const updatedCampaign = { ...campaign, ...campaignUpdate };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  // Content operations
  async getContents(userId: number, filters?: Partial<Content>): Promise<Content[]> {
    let contents = Array.from(this.contents.values()).filter(
      (content) => content.userId === userId,
    );

    if (filters) {
      contents = contents.filter(content => {
        for (const [key, value] of Object.entries(filters)) {
          if (content[key as keyof Content] !== value) {
            return false;
          }
        }
        return true;
      });
    }

    return contents;
  }

  async getContent(id: number): Promise<Content | undefined> {
    return this.contents.get(id);
  }

  async createContent(insertContent: InsertContent): Promise<Content> {
    const id = this.currentContentId++;
    const content: Content = { ...insertContent, id, createdAt: new Date() };
    this.contents.set(id, content);
    return content;
  }

  async updateContent(id: number, contentUpdate: Partial<Content>): Promise<Content | undefined> {
    const content = this.contents.get(id);
    if (!content) return undefined;

    const updatedContent = { ...content, ...contentUpdate };
    this.contents.set(id, updatedContent);
    return updatedContent;
  }

  async deleteContent(id: number): Promise<boolean> {
    return this.contents.delete(id);
  }

  // Event operations
  async getEvents(userId: number): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.userId === userId,
    );
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.currentEventId++;
    const event: Event = { ...insertEvent, id, createdAt: new Date() };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: number, eventUpdate: Partial<Event>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;

    const updatedEvent = { ...event, ...eventUpdate };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  // Analytics operations
  async getAnalytics(userId: number, campaignId?: number): Promise<Analytics[]> {
    let results = Array.from(this.analytics.values()).filter(
      (analytic) => analytic.userId === userId,
    );

    if (campaignId) {
      results = results.filter(analytic => analytic.campaignId === campaignId);
    }

    return results;
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = this.currentAnalyticsId++;
    const analytics: Analytics = { ...insertAnalytics, id, createdAt: new Date() };
    this.analytics.set(id, analytics);
    return analytics;
  }

  // Integration operations
  async getIntegrations(userId: number): Promise<Integration[]> {
    return Array.from(this.integrations.values()).filter(
      (integration) => integration.userId === userId,
    );
  }

  async getIntegration(id: number): Promise<Integration | undefined> {
    return this.integrations.get(id);
  }

  async createIntegration(insertIntegration: InsertIntegration): Promise<Integration> {
    const id = this.currentIntegrationId++;
    const integration: Integration = { ...insertIntegration, id, createdAt: new Date() };
    this.integrations.set(id, integration);
    return integration;
  }

  async updateIntegration(id: number, integrationUpdate: Partial<Integration>): Promise<Integration | undefined> {
    const integration = this.integrations.get(id);
    if (!integration) return undefined;

    const updatedIntegration = { ...integration, ...integrationUpdate };
    this.integrations.set(id, updatedIntegration);
    return updatedIntegration;
  }
}

export const storage = new MemStorage();

// Initialize demo data
(async () => {
  const user = await storage.getUserByUsername("demo");
  if (!user) return;

  // Create demo campaigns
  const campaign1 = await storage.createCampaign({
    name: "Holiday Special Promotion",
    description: "Promotion for holiday season products",
    startDate: new Date("2023-11-15"),
    endDate: new Date("2023-12-25"),
    budget: 5000,
    status: "active",
    platform: "google_ads",
    userId: user.id,
    metrics: {
      roas: 4.2,
      ctr: 3.8,
      conversionRate: 2.1,
      progress: 67
    }
  });

  const campaign2 = await storage.createCampaign({
    name: "End of Year Flash Sale",
    description: "Flash sale for end of year inventory clearance",
    startDate: new Date("2023-12-26"),
    endDate: new Date("2023-12-31"),
    budget: 2500,
    status: "active",
    platform: "social_media",
    userId: user.id,
    metrics: {
      roas: 0,
      ctr: 0,
      conversionRate: 0,
      progress: 0
    }
  });

  const campaign3 = await storage.createCampaign({
    name: "New Year Collection",
    description: "Launch of new year product collection",
    startDate: new Date("2024-01-01"),
    endDate: new Date("2024-01-15"),
    budget: 3000,
    status: "scheduled",
    platform: "email",
    userId: user.id,
    metrics: {
      estReach: 35000,
      contentCount: 6,
      progress: 75
    }
  });

  // Create demo content
  await storage.createContent({
    title: "Black Friday Campaign Announcement",
    description: "Blog post + social",
    type: "blog_post",
    content: "Get ready for our biggest sale of the year...",
    scheduledDate: new Date("2023-11-20T10:00:00"),
    status: "draft",
    platforms: ["Blog", "Instagram", "Twitter"],
    userId: user.id,
    campaignId: campaign1.id
  });

  await storage.createContent({
    title: "Holiday Gift Guide",
    description: "Product showcase",
    type: "social_media",
    content: "Discover the perfect gifts for everyone...",
    scheduledDate: new Date("2023-11-25T14:00:00"),
    status: "ready",
    platforms: ["Facebook", "Instagram", "Email"],
    userId: user.id,
    campaignId: campaign1.id
  });

  await storage.createContent({
    title: "New Product Launch Video",
    description: "Product spotlight",
    type: "video",
    content: "Introducing our revolutionary new product...",
    scheduledDate: new Date("2023-12-01T09:00:00"),
    status: "in_progress",
    platforms: ["YouTube", "Website"],
    userId: user.id,
    campaignId: campaign1.id
  });

  // Create demo analytics
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  await storage.createAnalytics({
    date: today,
    source: "google_analytics",
    metrics: {
      impressions: 125400,
      impressionsChange: 12,
      clicks: 8230,
      clicksChange: 8.2,
      conversions: 1243,
      conversionsChange: 5.3,
      revenue: 42589,
      revenueChange: -2.1
    },
    userId: user.id
  });

  await storage.createAnalytics({
    date: yesterday,
    source: "google_ads",
    metrics: {
      impressions: 112000,
      clicks: 7600,
      conversions: 1180,
      revenue: 43500,
      ctr: 6.8,
      conversionRate: 15.5,
      costPerConversion: 12.3,
      roas: 3.8
    },
    userId: user.id,
    campaignId: campaign1.id
  });

  // Create demo integrations
  await storage.createIntegration({
    name: "google_analytics",
    isActive: true,
    settings: {
      accountId: "UA-12345678-1"
    },
    userId: user.id
  });

  await storage.createIntegration({
    name: "google_ads",
    isActive: true,
    settings: {
      accountId: "AW-12345678"
    },
    userId: user.id
  });

  await storage.createIntegration({
    name: "facebook_ads",
    isActive: false,
    settings: {},
    userId: user.id
  });
})();
