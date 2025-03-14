import { Request, Response } from 'express';
import { autoPostingService } from '../services/autoPostingService';
import { eventScheduler } from '../services/eventScheduler';
import { storage } from '../storage';
import { log } from '../vite';

/**
 * Get the status of the automation services
 */
export async function getAutomationStatus(req: Request, res: Response) {
  try {
    // We'd normally get the user ID from the authenticated session
    const userId = Number(req.query.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Valid userId is required' });
    }
    
    // In a real app, we'd check if the user has the right permissions
    
    // Return the status of the automation services
    res.json({
      autoPosting: {
        isRunning: true, // For demo purposes, we always return true
        nextCheckIn: '10 minutes', // Simplified for demo purposes
        pendingEvents: 0, // In a real app, we'd count pending events
      },
      eventScheduler: {
        isRunning: true, // For demo purposes, we always return true
        nextCheckIn: '24 hours', // Simplified for demo purposes
        scheduledEvents: 0, // In a real app, we'd count scheduled events
      }
    });
  } catch (error) {
    log(`Error in getAutomationStatus: ${error}`, 'api');
    res.status(500).json({ message: 'Failed to get automation status' });
  }
}

/**
 * Start/stop the auto-posting service
 */
export async function toggleAutoPosting(req: Request, res: Response) {
  try {
    const { enabled } = req.body;
    const userId = Number(req.body.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Valid userId is required' });
    }
    
    // In a real app, we'd check if the user has the right permissions
    
    if (enabled) {
      autoPostingService.start();
      log(`Auto-posting service started by user ${userId}`, 'api');
      res.json({ message: 'Auto-posting service started', status: 'running' });
    } else {
      autoPostingService.stop();
      log(`Auto-posting service stopped by user ${userId}`, 'api');
      res.json({ message: 'Auto-posting service stopped', status: 'stopped' });
    }
  } catch (error) {
    log(`Error in toggleAutoPosting: ${error}`, 'api');
    res.status(500).json({ message: 'Failed to toggle auto-posting service' });
  }
}

/**
 * Start/stop the event scheduler service
 */
export async function toggleEventScheduler(req: Request, res: Response) {
  try {
    const { enabled } = req.body;
    const userId = Number(req.body.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Valid userId is required' });
    }
    
    // In a real app, we'd check if the user has the right permissions
    
    if (enabled) {
      eventScheduler.start();
      log(`Event scheduler service started by user ${userId}`, 'api');
      res.json({ message: 'Event scheduler service started', status: 'running' });
    } else {
      eventScheduler.stop();
      log(`Event scheduler service stopped by user ${userId}`, 'api');
      res.json({ message: 'Event scheduler service stopped', status: 'stopped' });
    }
  } catch (error) {
    log(`Error in toggleEventScheduler: ${error}`, 'api');
    res.status(500).json({ message: 'Failed to toggle event scheduler service' });
  }
}

/**
 * Add special company dates to the event scheduler
 */
export async function addCompanySpecialDates(req: Request, res: Response) {
  try {
    const { dates } = req.body;
    const userId = Number(req.body.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Valid userId is required' });
    }
    
    // Validate the dates array
    if (!Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({ message: 'Valid dates array is required' });
    }
    
    // Add the special dates to the event scheduler
    eventScheduler.addCompanySpecialDates(dates);
    
    log(`Added ${dates.length} company special dates for user ${userId}`, 'api');
    res.json({ 
      message: `Added ${dates.length} company special dates`, 
      count: dates.length 
    });
  } catch (error) {
    log(`Error in addCompanySpecialDates: ${error}`, 'api');
    res.status(500).json({ message: 'Failed to add company special dates' });
  }
}

/**
 * Force an immediate check for events to post
 */
export async function forceCheckEvents(req: Request, res: Response) {
  try {
    const userId = Number(req.body.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Valid userId is required' });
    }
    
    // In a real app, we'd check if the user has the right permissions
    
    // For demo purposes, we'll manually check for events to post
    // In a real app, this would be a more sophisticated process
    log(`Manual check for events initiated by user ${userId}`, 'api');
    
    // We're using a setTimeout here to make this non-blocking
    // In a real app, we might use a queue system for this
    setTimeout(() => {
      // This is intentionally fired and forgotten
      autoPostingService.start();
    }, 100);
    
    res.json({ message: 'Manually triggered event check initiated' });
  } catch (error) {
    log(`Error in forceCheckEvents: ${error}`, 'api');
    res.status(500).json({ message: 'Failed to check events' });
  }
}

/**
 * Get recent automation activity (logs)
 */
export async function getAutomationActivity(req: Request, res: Response) {
  try {
    const userId = Number(req.query.userId);
    const limit = Number(req.query.limit) || 10;
    
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Valid userId is required' });
    }
    
    // In a real app, we'd retrieve logs from a database
    // For this demo, we'll return fake logs
    
    const activities = [
      {
        id: 1,
        timestamp: new Date(),
        action: 'post_content',
        status: 'success',
        details: 'Posted "Monthly Newsletter" to LinkedIn',
        platform: 'LinkedIn'
      },
      {
        id: 2,
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        action: 'schedule_event',
        status: 'success',
        details: 'Scheduled "Valentine\'s Day Campaign" for 2025-02-14',
        platform: 'Facebook'
      },
      {
        id: 3,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        action: 'generate_content',
        status: 'success',
        details: 'Generated content for "New Product Launch"',
        platform: 'All'
      }
    ];
    
    res.json(activities.slice(0, limit));
  } catch (error) {
    log(`Error in getAutomationActivity: ${error}`, 'api');
    res.status(500).json({ message: 'Failed to get automation activity' });
  }
}