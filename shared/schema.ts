import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name"),
  email: text("email"),
  role: text("role"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  role: true,
});

// Campaign table
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  budget: integer("budget"),
  status: text("status").notNull().default("draft"), // draft, active, paused, completed
  platform: text("platform"), // google_ads, facebook, email, etc.
  userId: integer("user_id").notNull(),
  metrics: jsonb("metrics"), // Object containing metrics data
  createdAt: timestamp("created_at").defaultNow()
});

export const insertCampaignSchema = createInsertSchema(campaigns).pick({
  name: true,
  description: true,
  startDate: true,
  endDate: true,
  budget: true,
  status: true,
  platform: true,
  userId: true,
  metrics: true,
});

// Content table
export const contents = pgTable("contents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // blog_post, social_media, email, ad_copy, etc.
  content: text("content"),
  scheduledDate: timestamp("scheduled_date"),
  status: text("status").notNull().default("draft"), // draft, scheduled, published
  platforms: text("platforms").array(), // Array of platforms (Instagram, Twitter, etc.)
  campaignId: integer("campaign_id"),
  userId: integer("user_id").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertContentSchema = createInsertSchema(contents).pick({
  title: true,
  description: true,
  type: true,
  content: true,
  scheduledDate: true,
  status: true,
  platforms: true,
  campaignId: true,
  userId: true,
  imageUrl: true,
});

// Calendar Event table
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  allDay: boolean("all_day").default(false),
  type: text("type").default("event"), // event, campaign, content
  relatedId: integer("related_id"), // ID of related campaign or content
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertEventSchema = createInsertSchema(events).pick({
  title: true,
  description: true,
  startDate: true,
  endDate: true,
  allDay: true,
  type: true,
  relatedId: true,
  userId: true,
});

// Analytics data
export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  source: text("source").notNull(), // google_analytics, google_ads, etc.
  metrics: jsonb("metrics").notNull(), // Object containing various metrics
  userId: integer("user_id").notNull(),
  campaignId: integer("campaign_id"),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertAnalyticsSchema = createInsertSchema(analytics).pick({
  date: true,
  source: true,
  metrics: true,
  userId: true,
  campaignId: true,
});

// Integration settings
export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // google_analytics, google_ads, facebook, etc.
  isActive: boolean("is_active").default(false),
  settings: jsonb("settings"), // Object containing integration settings
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

export const insertIntegrationSchema = createInsertSchema(integrations).pick({
  name: true,
  isActive: true,
  settings: true,
  userId: true,
});

// Export types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type Campaign = typeof campaigns.$inferSelect;

export type InsertContent = z.infer<typeof insertContentSchema>;
export type Content = typeof contents.$inferSelect;

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;

export type InsertIntegration = z.infer<typeof insertIntegrationSchema>;
export type Integration = typeof integrations.$inferSelect;
