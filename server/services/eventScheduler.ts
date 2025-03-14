import { storage } from '../storage';
import { CalendarEvent, InsertCalendarEvent } from '@shared/schema';
import { log } from '../vite';

/**
 * Service to automatically schedule content based on special calendar dates
 */
export class EventScheduler {
  private static instance: EventScheduler;
  private checkInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  
  // Special dates that might be relevant for marketing
  private specialDates: Record<string, string[]> = {
    // Format: 'MM-DD': ['Event Name', 'Event Description', 'Platform']
    '01-01': ['New Year\'s Day', 'Celebrate the new year with special offers and goals', 'Facebook'],
    '02-14': ['Valentine\'s Day', 'Share the love with special Valentine\'s Day promotions', 'Instagram'],
    '03-17': ['St. Patrick\'s Day', 'Get lucky with our St. Patrick\'s Day specials', 'Twitter'],
    '07-04': ['Independence Day', 'Celebrate freedom with our Independence Day event', 'Facebook'],
    '10-31': ['Halloween', 'Spooky deals for Halloween', 'Instagram'],
    '11-25': ['Black Friday', 'Biggest deals of the year for Black Friday', 'All'],
    '12-24': ['Christmas Eve', 'Special holiday wishes and last-minute gift ideas', 'All'],
    '12-25': ['Christmas', 'Merry Christmas from our team', 'All'],
    '12-31': ['New Year\'s Eve', 'Say goodbye to the year with special promotions', 'All']
  };

  // Make constructor private for singleton pattern
  private constructor() {}

  // Get singleton instance
  public static getInstance(): EventScheduler {
    if (!EventScheduler.instance) {
      EventScheduler.instance = new EventScheduler();
    }
    return EventScheduler.instance;
  }

  /**
   * Initialize the service and start checking for upcoming special dates
   */
  public start(checkIntervalDays = 1): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    log(`Event scheduler started, checking every ${checkIntervalDays} days`, 'scheduler');
    
    // Do an initial check
    this.checkAndScheduleSpecialDates();
    
    // Schedule regular checks
    this.checkInterval = setInterval(() => {
      this.checkAndScheduleSpecialDates();
    }, checkIntervalDays * 24 * 60 * 60 * 1000);
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
    log('Event scheduler stopped', 'scheduler');
  }

  /**
   * Add a custom special date to consider for scheduling
   */
  public addSpecialDate(date: string, name: string, description: string, platform: string): void {
    if (!this.specialDates[date]) {
      this.specialDates[date] = [name, description, platform];
      log(`Added special date: ${date} - ${name}`, 'scheduler');
    }
  }

  /**
   * Add company-specific dates like founding anniversary, product launches, etc.
   */
  public addCompanySpecialDates(companyEvents: Array<{date: string, name: string, description: string, platform: string}>): void {
    for (const event of companyEvents) {
      this.addSpecialDate(event.date, event.name, event.description, event.platform);
    }
    log(`Added ${companyEvents.length} company-specific dates`, 'scheduler');
  }

  /**
   * Check for upcoming special dates and schedule content for them
   */
  private async checkAndScheduleSpecialDates(): Promise<void> {
    try {
      log('Checking for upcoming special dates to schedule content...', 'scheduler');
      
      const now = new Date();
      const lookAheadDays = 14; // Schedule content 2 weeks in advance
      
      // Get all users who should get auto-scheduled content
      const users = await this.getAllUsers();
      
      // For each user, check if they have upcoming special dates already scheduled
      for (const user of users) {
        await this.scheduleSpecialDatesForUser(user.id, now, lookAheadDays);
      }
    } catch (error) {
      log(`Error in event scheduler: ${error}`, 'scheduler');
    }
  }

  /**
   * Schedule special dates for a specific user
   */
  private async scheduleSpecialDatesForUser(userId: number, now: Date, lookAheadDays: number): Promise<void> {
    try {
      // Get the user's existing calendar events
      const existingEvents = await storage.getCalendarEventsByUserId(userId);
      
      // Get dates to check (today + lookAheadDays)
      const datesToCheck: Date[] = [];
      for (let i = 0; i <= lookAheadDays; i++) {
        const checkDate = new Date(now);
        checkDate.setDate(now.getDate() + i);
        datesToCheck.push(checkDate);
      }
      
      // For each date, check if there's a special event
      for (const date of datesToCheck) {
        const monthDay = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        
        // Check if this date has a special event
        if (this.specialDates[monthDay]) {
          const [eventName, eventDesc, platform] = this.specialDates[monthDay];
          
          // Check if this event is already scheduled for this user
          const isAlreadyScheduled = existingEvents.some(event => {
            const eventDate = new Date(event.startDate);
            return (
              event.title.includes(eventName) && 
              eventDate.getMonth() === date.getMonth() && 
              eventDate.getDate() === date.getDate() &&
              eventDate.getFullYear() === date.getFullYear()
            );
          });
          
          // If not already scheduled, create a new calendar event
          if (!isAlreadyScheduled) {
            await this.createSpecialDateEvent(userId, date, eventName, eventDesc, platform);
          }
        }
      }
    } catch (error) {
      log(`Error scheduling special dates for user ${userId}: ${error}`, 'scheduler');
    }
  }

  /**
   * Create a calendar event for a special date
   */
  private async createSpecialDateEvent(
    userId: number, 
    date: Date, 
    eventName: string, 
    description: string,
    platform: string
  ): Promise<CalendarEvent> {
    // Set the event time to 9:00 AM on the given date
    const eventDate = new Date(date);
    eventDate.setHours(9, 0, 0, 0);
    
    // Create a calendar event
    const newEvent: InsertCalendarEvent = {
      title: `[Special] ${eventName}`,
      description: description,
      startDate: eventDate,
      endDate: null,
      platform: platform === 'All' ? 'Facebook' : platform, // Default to Facebook if "All" platforms
      status: 'ready', // Ready to be auto-posted
      userId: userId,
      contentId: null,
      imageId: null
    };
    
    const createdEvent = await storage.createCalendarEvent(newEvent);
    log(`Created special date event: ${eventName} on ${date.toDateString()} for user ${userId}`, 'scheduler');
    
    return createdEvent;
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
}

// Export the singleton instance
export const eventScheduler = EventScheduler.getInstance();