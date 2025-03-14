import { Request, Response } from "express";
import { storage } from "../storage";
import { insertEventSchema } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function getEvents(req: Request, res: Response) {
  try {
    const userId = Number(req.query.userId);
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const events = await storage.getEvents(userId);
    return res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return res.status(500).json({ message: "Failed to fetch events" });
  }
}

export async function getEvent(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const event = await storage.getEvent(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return res.status(500).json({ message: "Failed to fetch event" });
  }
}

export async function createEvent(req: Request, res: Response) {
  try {
    const eventData = insertEventSchema.parse(req.body);
    const event = await storage.createEvent(eventData);
    return res.status(201).json(event);
  } catch (error) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ message: validationError.message });
    }
    console.error("Error creating event:", error);
    return res.status(500).json({ message: "Failed to create event" });
  }
}

export async function updateEvent(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const eventData = req.body;
    const updatedEvent = await storage.updateEvent(id, eventData);
    
    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.json(updatedEvent);
  } catch (error) {
    console.error("Error updating event:", error);
    return res.status(500).json({ message: "Failed to update event" });
  }
}

export async function deleteEvent(req: Request, res: Response) {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }

    const result = await storage.deleteEvent(id);
    if (!result) {
      return res.status(404).json({ message: "Event not found" });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Error deleting event:", error);
    return res.status(500).json({ message: "Failed to delete event" });
  }
}

export async function getUpcomingEvents(req: Request, res: Response) {
  try {
    const userId = Number(req.query.userId);
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const allEvents = await storage.getEvents(userId);
    const now = new Date();
    
    // Filter events that haven't ended yet
    const upcomingEvents = allEvents.filter(event => {
      const endDate = new Date(event.endDate);
      return endDate >= now;
    });
    
    // Sort by start date
    upcomingEvents.sort((a, b) => {
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    return res.json(upcomingEvents);
  } catch (error) {
    console.error("Error fetching upcoming events:", error);
    return res.status(500).json({ message: "Failed to fetch upcoming events" });
  }
}
