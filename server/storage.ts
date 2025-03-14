import { 
  users, type User, type InsertUser,
  campaigns, type Campaign, type InsertCampaign,
  events, type Event, type InsertEvent,
  contents, type Content, type InsertContent,
  images, type Image, type InsertImage,
  analytics, type Analytics, type InsertAnalytics
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Campaign operations
  getCampaign(id: number): Promise<Campaign | undefined>;
  getCampaignsByUserId(userId: number): Promise<Campaign[]>;
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  updateCampaign(id: number, campaign: Partial<InsertCampaign>): Promise<Campaign | undefined>;
  deleteCampaign(id: number): Promise<boolean>;
  
  // Event operations
  getEvent(id: number): Promise<Event | undefined>;
  getEventsByUserId(userId: number): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Content operations
  getContent(id: number): Promise<Content | undefined>;
  getContentsByUserId(userId: number): Promise<Content[]>;
  getContentsByCampaignId(campaignId: number): Promise<Content[]>;
  createContent(content: InsertContent): Promise<Content>;
  updateContent(id: number, content: Partial<InsertContent>): Promise<Content | undefined>;
  deleteContent(id: number): Promise<boolean>;
  
  // Image operations
  getImage(id: number): Promise<Image | undefined>;
  getImagesByUserId(userId: number): Promise<Image[]>;
  getImagesByCampaignId(campaignId: number): Promise<Image[]>;
  createImage(image: InsertImage): Promise<Image>;
  updateImage(id: number, image: Partial<InsertImage>): Promise<Image | undefined>;
  deleteImage(id: number): Promise<boolean>;
  
  // Analytics operations
  getAnalyticsByUserId(userId: number): Promise<Analytics[]>;
  getAnalyticsByCampaignId(campaignId: number): Promise<Analytics[]>;
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  updateAnalytics(id: number, analytics: Partial<InsertAnalytics>): Promise<Analytics | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private campaigns: Map<number, Campaign>;
  private events: Map<number, Event>;
  private contents: Map<number, Content>;
  private images: Map<number, Image>;
  private analytics: Map<number, Analytics>;
  
  private userIdCounter: number;
  private campaignIdCounter: number;
  private eventIdCounter: number;
  private contentIdCounter: number;
  private imageIdCounter: number;
  private analyticsIdCounter: number;

  constructor() {
    this.users = new Map();
    this.campaigns = new Map();
    this.events = new Map();
    this.contents = new Map();
    this.images = new Map();
    this.analytics = new Map();
    
    this.userIdCounter = 1;
    this.campaignIdCounter = 1;
    this.eventIdCounter = 1;
    this.contentIdCounter = 1;
    this.imageIdCounter = 1;
    this.analyticsIdCounter = 1;

    // Create a default user
    this.createUser({
      username: "demo",
      password: "password",
      email: "demo@example.com",
      name: "Sarah Johnson",
      role: "Marketing Manager"
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { ...insertUser, id, createdAt };
    this.users.set(id, user);
    return user;
  }

  // Campaign operations
  async getCampaign(id: number): Promise<Campaign | undefined> {
    return this.campaigns.get(id);
  }

  async getCampaignsByUserId(userId: number): Promise<Campaign[]> {
    return Array.from(this.campaigns.values()).filter(
      (campaign) => campaign.userId === userId
    );
  }

  async createCampaign(insertCampaign: InsertCampaign): Promise<Campaign> {
    const id = this.campaignIdCounter++;
    const createdAt = new Date();
    const campaign: Campaign = { ...insertCampaign, id, createdAt };
    this.campaigns.set(id, campaign);
    return campaign;
  }

  async updateCampaign(id: number, updateData: Partial<InsertCampaign>): Promise<Campaign | undefined> {
    const campaign = this.campaigns.get(id);
    if (!campaign) return undefined;
    
    const updatedCampaign = { ...campaign, ...updateData };
    this.campaigns.set(id, updatedCampaign);
    return updatedCampaign;
  }

  async deleteCampaign(id: number): Promise<boolean> {
    return this.campaigns.delete(id);
  }

  // Event operations
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async getEventsByUserId(userId: number): Promise<Event[]> {
    return Array.from(this.events.values()).filter(
      (event) => event.userId === userId
    );
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    const createdAt = new Date();
    const event: Event = { ...insertEvent, id, createdAt };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: number, updateData: Partial<InsertEvent>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...updateData };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }

  // Content operations
  async getContent(id: number): Promise<Content | undefined> {
    return this.contents.get(id);
  }

  async getContentsByUserId(userId: number): Promise<Content[]> {
    return Array.from(this.contents.values()).filter(
      (content) => content.userId === userId
    );
  }

  async getContentsByCampaignId(campaignId: number): Promise<Content[]> {
    return Array.from(this.contents.values()).filter(
      (content) => content.campaignId === campaignId
    );
  }

  async createContent(insertContent: InsertContent): Promise<Content> {
    const id = this.contentIdCounter++;
    const createdAt = new Date();
    const content: Content = { ...insertContent, id, createdAt };
    this.contents.set(id, content);
    return content;
  }

  async updateContent(id: number, updateData: Partial<InsertContent>): Promise<Content | undefined> {
    const content = this.contents.get(id);
    if (!content) return undefined;
    
    const updatedContent = { ...content, ...updateData };
    this.contents.set(id, updatedContent);
    return updatedContent;
  }

  async deleteContent(id: number): Promise<boolean> {
    return this.contents.delete(id);
  }

  // Image operations
  async getImage(id: number): Promise<Image | undefined> {
    return this.images.get(id);
  }

  async getImagesByUserId(userId: number): Promise<Image[]> {
    return Array.from(this.images.values()).filter(
      (image) => image.userId === userId
    );
  }

  async getImagesByCampaignId(campaignId: number): Promise<Image[]> {
    return Array.from(this.images.values()).filter(
      (image) => image.campaignId === campaignId
    );
  }

  async createImage(insertImage: InsertImage): Promise<Image> {
    const id = this.imageIdCounter++;
    const createdAt = new Date();
    const image: Image = { ...insertImage, id, createdAt };
    this.images.set(id, image);
    return image;
  }

  async updateImage(id: number, updateData: Partial<InsertImage>): Promise<Image | undefined> {
    const image = this.images.get(id);
    if (!image) return undefined;
    
    const updatedImage = { ...image, ...updateData };
    this.images.set(id, updatedImage);
    return updatedImage;
  }

  async deleteImage(id: number): Promise<boolean> {
    return this.images.delete(id);
  }

  // Analytics operations
  async getAnalyticsByUserId(userId: number): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(
      (analytics) => analytics.userId === userId
    );
  }

  async getAnalyticsByCampaignId(campaignId: number): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(
      (analytics) => analytics.campaignId === campaignId
    );
  }

  async createAnalytics(insertAnalytics: InsertAnalytics): Promise<Analytics> {
    const id = this.analyticsIdCounter++;
    const createdAt = new Date();
    const analytics: Analytics = { ...insertAnalytics, id, createdAt };
    this.analytics.set(id, analytics);
    return analytics;
  }

  async updateAnalytics(id: number, updateData: Partial<InsertAnalytics>): Promise<Analytics | undefined> {
    const analytics = this.analytics.get(id);
    if (!analytics) return undefined;
    
    const updatedAnalytics = { ...analytics, ...updateData };
    this.analytics.set(id, updatedAnalytics);
    return updatedAnalytics;
  }
}

export const storage = new MemStorage();
