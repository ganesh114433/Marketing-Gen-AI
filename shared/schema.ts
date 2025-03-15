import { pgTable, text, serial, integer, boolean, timestamp, json, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  email: text("email"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
});

// Content entry schema
export const contentEntries = pgTable("content_entries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // blog, social, email, etc.
  status: text("status").notNull().default("draft"), // draft, ready, published
  userId: integer("user_id").notNull(),
  wordCount: integer("word_count"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContentEntrySchema = createInsertSchema(contentEntries).pick({
  title: true,
  content: true,
  type: true,
  status: true,
  userId: true,
  wordCount: true,
});

// Image entry schema
export const imageEntries = pgTable("image_entries", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  prompt: text("prompt").notNull(),
  imageUrl: text("image_url"),
  status: text("status").notNull().default("pending"), // pending, generated, failed
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertImageEntrySchema = createInsertSchema(imageEntries).pick({
  title: true,
  prompt: true,
  imageUrl: true,
  status: true,
  userId: true,
});

// Calendar events schema
export const calendarEvents = pgTable("calendar_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  platform: text("platform"), // Facebook, Instagram, Email, etc.
  contentId: integer("content_id"), // Optional reference to content
  imageId: integer("image_id"), // Optional reference to image
  status: text("status").notNull().default("pending"), // pending, ready, published
  userId: integer("user_id").notNull(),
});

export const insertCalendarEventSchema = createInsertSchema(calendarEvents).pick({
  title: true,
  description: true,
  startDate: true,
  endDate: true,
  platform: true,
  contentId: true,
  imageId: true,
  status: true,
  userId: true,
});

// Campaign metrics schema
export const campaignMetrics = pgTable("campaign_metrics", {
  id: serial("id").primaryKey(),
  campaignName: text("campaign_name").notNull(),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  conversions: integer("conversions").default(0),
  adSpend: integer("ad_spend").default(0), // in cents
  date: timestamp("date").notNull(),
  source: text("source").notNull(), // google_ads, facebook, etc.
  userId: integer("user_id").notNull(),
});

export const insertCampaignMetricsSchema = createInsertSchema(campaignMetrics).pick({
  campaignName: true,
  impressions: true,
  clicks: true,
  conversions: true,
  adSpend: true,
  date: true,
  source: true,
  userId: true,
});

// Integration settings schema
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  service: text("service").notNull(), // google_ads, google_analytics, facebook, instagram, salesforce, etc.
  provider: text("provider").notNull(), // google, facebook, salesforce, hubspot, etc.
  integrationType: text("integration_type").notNull(), // analytics, ads, crm, erp, social, etc.
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  tokenExpiry: timestamp("token_expiry"),
  accountId: text("account_id"),
  status: text("status").notNull().default("disconnected"), // connected, disconnected, pending
  lastSynced: timestamp("last_synced"),
  config: json("config"), // Flexible JSON field for service-specific configuration
  credentials: json("credentials"), // Securely stored credentials (encrypted in production)
});

export const insertIntegrationSchema = createInsertSchema(integrations).pick({
  userId: true,
  service: true,
  provider: true,
  integrationType: true,
  accessToken: true,
  refreshToken: true,
  tokenExpiry: true,
  accountId: true,
  status: true,
  lastSynced: true,
  config: true,
  credentials: true,
});

// Export all types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ContentEntry = typeof contentEntries.$inferSelect;
export type InsertContentEntry = z.infer<typeof insertContentEntrySchema>;

export type ImageEntry = typeof imageEntries.$inferSelect;
export type InsertImageEntry = z.infer<typeof insertImageEntrySchema>;

export type CalendarEvent = typeof calendarEvents.$inferSelect;
export type InsertCalendarEvent = z.infer<typeof insertCalendarEventSchema>;

export type CampaignMetric = typeof campaignMetrics.$inferSelect;
export type InsertCampaignMetric = z.infer<typeof insertCampaignMetricsSchema>;

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;

// Custom schema for content generation request
export const contentGenerationSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters long"),
  type: z.enum(["social", "blog", "email", "ad"]),
  platform: z.enum(["facebook", "instagram", "twitter", "linkedin", "email", "website"]).optional(),
  tone: z.enum(["professional", "casual", "friendly", "persuasive", "informative"]).optional(),
  length: z.enum(["short", "medium", "long"]).optional(),
  keywords: z.string().optional(),
});

export type ContentGenerationRequest = z.infer<typeof contentGenerationSchema>;

// Custom schema for image generation request
export const imageGenerationSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters long"),
  style: z.enum(["realistic", "artistic", "cartoon", "3d", "abstract"]).optional(),
  size: z.enum(["small", "medium", "large"]).optional(),
});

export type ImageGenerationRequest = z.infer<typeof imageGenerationSchema>;
