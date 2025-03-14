import { storage } from '../storage';
import { generateContent } from '../api/openai';
import { ContentEntry, CalendarEvent, InsertContentEntry } from '@shared/schema';
import { log } from '../vite';

/**
 * Service to handle automatic content generation and posting based on calendar events
 */
export class AutoPostingService {
  private static instance: AutoPostingService;
  private checkInterval: NodeJS.Timeout | null = null;
  private isRunning = false;

  // Make constructor private for singleton pattern
  private constructor() {}

  // Get singleton instance
  public static getInstance(): AutoPostingService {
    if (!AutoPostingService.instance) {
      AutoPostingService.instance = new AutoPostingService();
    }
    return AutoPostingService.instance;
  }

  /**
   * Initialize the service and start checking for events to post
   */
  public start(checkIntervalMinutes = 10): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    log(`Auto posting service started, checking every ${checkIntervalMinutes} minutes`, 'autopost');
    
    // Do an initial check
    this.checkAndProcessEvents();
    
    // Schedule regular checks
    this.checkInterval = setInterval(() => {
      this.checkAndProcessEvents();
    }, checkIntervalMinutes * 60 * 1000);
  }

  /**
   * Stop the service
   */
  public stop(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isRunning = false;
    log('Auto posting service stopped', 'autopost');
  }

  /**
   * Check for events that are due to be posted and process them
   */
  private async checkAndProcessEvents(): Promise<void> {
    try {
      log('Checking for events to autopost...', 'autopost');
      
      const now = new Date();
      
      // Get all calendar events that are:
      // 1. Due to be posted (current time is past the scheduled start time)
      // 2. Have status 'ready' (approved and ready to post)
      // 3. Don't have content yet, or have content in "ready" status
      
      // Get all calendar events
      const allEvents = await this.getAllEvents();
      const eventsDueToPost = this.filterEventsDueToPost(allEvents, now);
      
      log(`Found ${eventsDueToPost.length} events due for posting`, 'autopost');
      
      // Process each event
      for (const event of eventsDueToPost) {
        await this.processEvent(event);
      }
    } catch (error) {
      log(`Error in auto posting service: ${error}`, 'autopost');
    }
  }

  /**
   * Get all calendar events from storage
   */
  private async getAllEvents(): Promise<CalendarEvent[]> {
    // In a real application, we would filter this query
    // For demo purposes, we get all events and filter in memory
    const allEvents: CalendarEvent[] = [];
    
    // Get all users
    const users = await this.getAllUsers();
    
    // Get events for each user
    for (const user of users) {
      const userEvents = await storage.getCalendarEventsByUserId(user.id);
      allEvents.push(...userEvents);
    }
    
    return allEvents;
  }

  /**
   * Get all users from storage
   */
  private async getAllUsers() {
    // For demo purposes - in real app, we'd have a proper method to get all users
    // This is a workaround for the in-memory storage
    const demoUser = await storage.getUserByUsername('demo');
    return demoUser ? [demoUser] : [];
  }

  /**
   * Filter events that are due to be posted
   */
  private filterEventsDueToPost(events: CalendarEvent[], now: Date): CalendarEvent[] {
    return events.filter(event => {
      // Skip events that are already published
      if (event.status === 'published') {
        return false;
      }
      
      // Check if event is scheduled to start in the past or present
      // We use <= to include events that are exactly at the current time
      return event.status === 'ready' && new Date(event.startDate) <= now;
    });
  }

  /**
   * Process a single event - generate content if needed and post to social media
   */
  private async processEvent(event: CalendarEvent): Promise<void> {
    log(`Processing event ID: ${event.id} - "${event.title}" for platform ${event.platform}`, 'autopost');
    
    try {
      let contentEntry: ContentEntry | undefined;
      
      // If the event has content associated with it, retrieve it
      if (event.contentId) {
        contentEntry = await storage.getContentEntry(event.contentId);
      }
      
      // If we don't have content, generate it
      if (!contentEntry) {
        contentEntry = await this.generateContentForEvent(event);
        
        // Update the event with the new content ID
        await storage.updateCalendarEvent(event.id, { 
          contentId: contentEntry.id,
          status: 'published'
        });
      }
      
      // Post the content to the social media platform
      await this.postToSocialMedia(event, contentEntry);
      
      // Update the event status to published
      await storage.updateCalendarEvent(event.id, { status: 'published' });
      
      log(`Successfully processed and published event ID: ${event.id}`, 'autopost');
    } catch (error) {
      log(`Failed to process event ID: ${event.id} - Error: ${error}`, 'autopost');
    }
  }

  /**
   * Generate content for an event
   */
  private async generateContentForEvent(event: CalendarEvent): Promise<ContentEntry> {
    log(`Generating content for event ID: ${event.id}`, 'autopost');
    
    // Determine the content type based on the platform
    const contentType = this.getPlatformContentType(event.platform);
    
    // Generate AI content using OpenAI
    const prompt = `Create a ${contentType} post for ${event.platform} about "${event.title}" with the following description: ${event.description || 'no description'}. The tone should be professional and engaging.`;
    
    const generatedContent = await generateContent({
      contentType,
      topic: event.title,
      tone: 'professional',
      length: 'medium'
    });
    
    // Create a new content entry
    const contentEntry: InsertContentEntry = {
      title: event.title,
      content: generatedContent,
      type: contentType,
      status: 'ready',
      userId: event.userId,
      wordCount: generatedContent.split(/\s+/).length
    };
    
    return storage.createContentEntry(contentEntry);
  }

  /**
   * Map platform to content type
   */
  private getPlatformContentType(platform: string | null): string {
    if (!platform) return 'social';
    
    const platformMap: Record<string, string> = {
      'Facebook': 'social',
      'Instagram': 'social',
      'Twitter': 'social',
      'LinkedIn': 'social',
      'Email': 'email',
      'Website': 'blog'
    };
    
    return platformMap[platform] || 'social';
  }

  /**
   * Post content to social media platform
   * In a real application, this would use the platform-specific APIs
   */
  private async postToSocialMedia(event: CalendarEvent, content: ContentEntry): Promise<void> {
    log(`Posting to ${event.platform || 'unknown platform'}: "${content.title}"`, 'autopost');
    
    // Simulate posting to different platforms
    if (!event.platform) {
      log('No platform specified, skipping posting', 'autopost');
      return;
    }
    
    // In a real app, we'd use platform-specific SDKs or APIs
    // For demo purposes, we simulate successful posting
    
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    // Simulate network delay
    await delay(500);
    
    log(`Successfully posted to ${event.platform}: "${content.title}"`, 'autopost');
    
    // In a real app, we might return post IDs or other platform-specific information
  }
}

// Export the singleton instance
export const autoPostingService = AutoPostingService.getInstance();