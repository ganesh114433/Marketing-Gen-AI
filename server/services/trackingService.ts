
import { analytics } from '@google-analytics/data';
import { OAuth2Client } from 'google-auth-library';

export class TrackingService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    });
  }

  async trackEvent(eventData: {
    eventName: string;
    category: string;
    action: string;
    label?: string;
    value?: number;
  }) {
    try {
      const { eventName, category, action, label, value } = eventData;
      
      // Track in Google Analytics
      await analytics.trackEvent({
        name: eventName,
        params: {
          event_category: category,
          event_action: action,
          event_label: label,
          value: value
        }
      });

      // Log event for monitoring
      console.log(`Event tracked: ${eventName}`, {
        category,
        action,
        label,
        value,
        timestamp: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.error('Error tracking event:', error);
      return false;
    }
  }

  async trackPageView(path: string, title: string) {
    try {
      await analytics.trackPageview({
        page_path: path,
        page_title: title
      });
      return true;
    } catch (error) {
      console.error('Error tracking pageview:', error);
      return false;
    }
  }
}

export const trackingService = new TrackingService();
