import { 
  User, InsertUser, 
  ContentEntry, InsertContentEntry,
  ImageEntry, InsertImageEntry,
  CalendarEvent, InsertCalendarEvent,
  CampaignMetric, InsertCampaignMetric,
  Integration, InsertIntegration
} from "@shared/schema";

// Define the full storage interface with all needed methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Content methods
  getContentEntry(id: number): Promise<ContentEntry | undefined>;
  getContentEntriesByUserId(userId: number): Promise<ContentEntry[]>;
  createContentEntry(content: InsertContentEntry): Promise<ContentEntry>;
  updateContentEntry(id: number, content: Partial<ContentEntry>): Promise<ContentEntry>;
  
  // Image methods
  getImageEntry(id: number): Promise<ImageEntry | undefined>;
  getImageEntriesByUserId(userId: number): Promise<ImageEntry[]>;
  createImageEntry(image: InsertImageEntry): Promise<ImageEntry>;
  updateImageEntry(id: number, image: Partial<ImageEntry>): Promise<ImageEntry>;
  
  // Calendar event methods
  getCalendarEvent(id: number): Promise<CalendarEvent | undefined>;
  getCalendarEventsByUserId(userId: number): Promise<CalendarEvent[]>;
  createCalendarEvent(event: InsertCalendarEvent): Promise<CalendarEvent>;
  updateCalendarEvent(id: number, event: Partial<CalendarEvent>): Promise<CalendarEvent>;
  
  // Campaign metrics methods
  getCampaignMetric(id: number): Promise<CampaignMetric | undefined>;
  getCampaignMetricsByUserId(userId: number): Promise<CampaignMetric[]>;
  createCampaignMetric(metric: InsertCampaignMetric): Promise<CampaignMetric>;
  
  // Integration methods
  getIntegration(id: number): Promise<Integration | undefined>;
  getIntegrationsByUserId(userId: number): Promise<Integration[]>;
  getIntegrationsByUserIdAndService(userId: number, service: string): Promise<Integration[]>;
  createIntegration(integration: InsertIntegration): Promise<Integration>;
  updateIntegration(id: number, integration: Partial<Integration>): Promise<Integration>;
}

// Implement the in-memory storage class
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contentEntries: Map<number, ContentEntry>;
  private imageEntries: Map<number, ImageEntry>;
  private calendarEvents: Map<number, CalendarEvent>;
  private campaignMetrics: Map<number, CampaignMetric>;
  private integrations: Map<number, Integration>;
  
  private currentUserId: number;
  private currentContentId: number;
  private currentImageId: number;
  private currentEventId: number;
  private currentMetricId: number;
  private currentIntegrationId: number;

  constructor() {
    this.users = new Map();
    this.contentEntries = new Map();
    this.imageEntries = new Map();
    this.calendarEvents = new Map();
    this.campaignMetrics = new Map();
    this.integrations = new Map();
    
    this.currentUserId = 1;
    this.currentContentId = 1;
    this.currentImageId = 1;
    this.currentEventId = 1;
    this.currentMetricId = 1;
    this.currentIntegrationId = 1;
    
    // Add some seed data
    this.seedData();
  }

  // User methods
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Content methods
  async getContentEntry(id: number): Promise<ContentEntry | undefined> {
    return this.contentEntries.get(id);
  }
  
  async getContentEntriesByUserId(userId: number): Promise<ContentEntry[]> {
    return Array.from(this.contentEntries.values()).filter(
      (content) => content.userId === userId
    );
  }
  
  async createContentEntry(insertContent: InsertContentEntry): Promise<ContentEntry> {
    const id = this.currentContentId++;
    const createdAt = new Date();
    const content: ContentEntry = { ...insertContent, id, createdAt };
    this.contentEntries.set(id, content);
    return content;
  }
  
  async updateContentEntry(id: number, contentUpdate: Partial<ContentEntry>): Promise<ContentEntry> {
    const existingContent = this.contentEntries.get(id);
    if (!existingContent) {
      throw new Error(`Content with ID ${id} not found`);
    }
    
    const updatedContent = { ...existingContent, ...contentUpdate };
    this.contentEntries.set(id, updatedContent);
    return updatedContent;
  }
  
  // Image methods
  async getImageEntry(id: number): Promise<ImageEntry | undefined> {
    return this.imageEntries.get(id);
  }
  
  async getImageEntriesByUserId(userId: number): Promise<ImageEntry[]> {
    return Array.from(this.imageEntries.values()).filter(
      (image) => image.userId === userId
    );
  }
  
  async createImageEntry(insertImage: InsertImageEntry): Promise<ImageEntry> {
    const id = this.currentImageId++;
    const createdAt = new Date();
    const image: ImageEntry = { ...insertImage, id, createdAt };
    this.imageEntries.set(id, image);
    return image;
  }
  
  async updateImageEntry(id: number, imageUpdate: Partial<ImageEntry>): Promise<ImageEntry> {
    const existingImage = this.imageEntries.get(id);
    if (!existingImage) {
      throw new Error(`Image with ID ${id} not found`);
    }
    
    const updatedImage = { ...existingImage, ...imageUpdate };
    this.imageEntries.set(id, updatedImage);
    return updatedImage;
  }
  
  // Calendar event methods
  async getCalendarEvent(id: number): Promise<CalendarEvent | undefined> {
    return this.calendarEvents.get(id);
  }
  
  async getCalendarEventsByUserId(userId: number): Promise<CalendarEvent[]> {
    return Array.from(this.calendarEvents.values()).filter(
      (event) => event.userId === userId
    );
  }
  
  async createCalendarEvent(insertEvent: InsertCalendarEvent): Promise<CalendarEvent> {
    const id = this.currentEventId++;
    const event: CalendarEvent = { ...insertEvent, id };
    this.calendarEvents.set(id, event);
    return event;
  }
  
  async updateCalendarEvent(id: number, eventUpdate: Partial<CalendarEvent>): Promise<CalendarEvent> {
    const existingEvent = this.calendarEvents.get(id);
    if (!existingEvent) {
      throw new Error(`Event with ID ${id} not found`);
    }
    
    const updatedEvent = { ...existingEvent, ...eventUpdate };
    this.calendarEvents.set(id, updatedEvent);
    return updatedEvent;
  }
  
  // Campaign metrics methods
  async getCampaignMetric(id: number): Promise<CampaignMetric | undefined> {
    return this.campaignMetrics.get(id);
  }
  
  async getCampaignMetricsByUserId(userId: number): Promise<CampaignMetric[]> {
    return Array.from(this.campaignMetrics.values()).filter(
      (metric) => metric.userId === userId
    );
  }
  
  async createCampaignMetric(insertMetric: InsertCampaignMetric): Promise<CampaignMetric> {
    const id = this.currentMetricId++;
    const metric: CampaignMetric = { ...insertMetric, id };
    this.campaignMetrics.set(id, metric);
    return metric;
  }
  
  // Integration methods
  async getIntegration(id: number): Promise<Integration | undefined> {
    return this.integrations.get(id);
  }
  
  async getIntegrationsByUserId(userId: number): Promise<Integration[]> {
    return Array.from(this.integrations.values()).filter(
      (integration) => integration.userId === userId
    );
  }
  
  async getIntegrationsByUserIdAndService(userId: number, service: string): Promise<Integration[]> {
    return Array.from(this.integrations.values()).filter(
      (integration) => integration.userId === userId && integration.service === service
    );
  }
  
  async createIntegration(insertIntegration: InsertIntegration): Promise<Integration> {
    const id = this.currentIntegrationId++;
    const integration: Integration = { ...insertIntegration, id };
    this.integrations.set(id, integration);
    return integration;
  }
  
  async updateIntegration(id: number, integrationUpdate: Partial<Integration>): Promise<Integration> {
    const existingIntegration = this.integrations.get(id);
    if (!existingIntegration) {
      throw new Error(`Integration with ID ${id} not found`);
    }
    
    const updatedIntegration = { ...existingIntegration, ...integrationUpdate };
    this.integrations.set(id, updatedIntegration);
    return updatedIntegration;
  }
  
  // Seed the database with initial data
  private seedData() {
    // Create demo user
    const demoUser: User = {
      id: this.currentUserId++,
      username: 'demo',
      password: 'password123',
      fullName: 'John Doe' as string | null,
      email: 'john@example.com' as string | null,
    };
    this.users.set(demoUser.id, demoUser);
    
    // Create some content entries
    const contentTypes = ['blog', 'social', 'email'];
    const contentStatuses = ['draft', 'ready', 'published'];
    
    for (let i = 0; i < 10; i++) {
      const contentEntry: ContentEntry = {
        id: this.currentContentId++,
        title: `Sample Content ${i + 1}`,
        content: `This is sample content number ${i + 1}. It contains some placeholder text to demonstrate how content entries work.`,
        type: contentTypes[i % contentTypes.length],
        status: contentStatuses[i % contentStatuses.length],
        userId: demoUser.id,
        wordCount: (50 + i * 10) as number | null,
        createdAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000) as Date | null,
      };
      this.contentEntries.set(contentEntry.id, contentEntry);
    }
    
    // Create some image entries
    for (let i = 0; i < 5; i++) {
      const imageEntry: ImageEntry = {
        id: this.currentImageId++,
        title: `Sample Image ${i + 1}`,
        prompt: `A creative image depicting concept ${i + 1}`,
        imageUrl: `https://via.placeholder.com/500x300?text=Sample+Image+${i + 1}`,
        status: i < 3 ? 'generated' : 'pending',
        userId: demoUser.id,
        createdAt: new Date(Date.now() - i * 12 * 60 * 60 * 1000),
      };
      this.imageEntries.set(imageEntry.id, imageEntry);
    }
    
    // Create some calendar events
    const platforms = ['Facebook', 'Instagram', 'Email', 'Twitter'];
    const now = new Date();
    
    for (let i = 0; i < 5; i++) {
      const eventDate = new Date(now.getTime() + (i + 1) * 24 * 60 * 60 * 1000);
      const calendarEvent: CalendarEvent = {
        id: this.currentEventId++,
        title: `Marketing Event ${i + 1}`,
        description: `This is a scheduled marketing post for ${platforms[i % platforms.length]}`,
        startDate: eventDate,
        endDate: new Date(eventDate.getTime() + 2 * 60 * 60 * 1000),
        platform: platforms[i % platforms.length],
        contentId: i < 3 ? i + 1 : null,
        imageId: i < 2 ? i + 1 : null,
        status: i < 2 ? 'ready' : 'pending',
        userId: demoUser.id,
      };
      this.calendarEvents.set(calendarEvent.id, calendarEvent);
    }
    
    // Create past events
    for (let i = 0; i < 3; i++) {
      const eventDate = new Date(now.getTime() - (i + 1) * 24 * 60 * 60 * 1000);
      const calendarEvent: CalendarEvent = {
        id: this.currentEventId++,
        title: `Past Event ${i + 1}`,
        description: `This is a completed marketing post for ${platforms[i % platforms.length]}`,
        startDate: eventDate,
        endDate: new Date(eventDate.getTime() + 2 * 60 * 60 * 1000),
        platform: platforms[i % platforms.length],
        contentId: i + 4,
        imageId: i + 3,
        status: 'published',
        userId: demoUser.id,
      };
      this.calendarEvents.set(calendarEvent.id, calendarEvent);
    }
    
    // Create campaign metrics
    const campaigns = ['Summer Sale', 'Product Launch', 'Holiday Special'];
    const sources = ['google_ads', 'facebook', 'instagram'];
    
    for (let i = 0; i < 15; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const campaignMetric: CampaignMetric = {
        id: this.currentMetricId++,
        campaignName: campaigns[i % campaigns.length],
        impressions: (1000 + Math.floor(Math.random() * 5000)) as number | null,
        clicks: (50 + Math.floor(Math.random() * 300)) as number | null,
        conversions: (5 + Math.floor(Math.random() * 50)) as number | null,
        adSpend: (2000 + Math.floor(Math.random() * 10000)) as number | null, // in cents
        date: date,
        source: sources[i % sources.length],
        userId: demoUser.id,
      };
      this.campaignMetrics.set(campaignMetric.id, campaignMetric);
    }
    
    // Create integrations
    const services = ['google_ads', 'google_analytics', 'facebook', 'instagram'];
    const integrationStatuses = ['connected', 'disconnected'];
    
    for (let i = 0; i < 2; i++) {
      const now = new Date();
      const expiryDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const integration: Integration = {
        id: this.currentIntegrationId++,
        userId: demoUser.id,
        service: services[i],
        accessToken: `sample_token_${i}`,
        refreshToken: `sample_refresh_${i}`,
        tokenExpiry: expiryDate,
        accountId: `account_${i}`,
        status: 'connected',
        lastSynced: new Date(now.getTime() - i * 60 * 60 * 1000),
      };
      this.integrations.set(integration.id, integration);
    }
    
    for (let i = 2; i < 4; i++) {
      const integration: Integration = {
        id: this.currentIntegrationId++,
        userId: demoUser.id,
        service: services[i],
        accessToken: null,
        refreshToken: null,
        tokenExpiry: null,
        accountId: null,
        status: 'disconnected',
        lastSynced: null,
      };
      this.integrations.set(integration.id, integration);
    }
  }
}

export const storage = new MemStorage();
