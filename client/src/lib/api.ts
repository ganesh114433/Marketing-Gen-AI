// API utilities for making requests to backend endpoints
import { ContentGenerationRequest, ImageGenerationRequest } from "@shared/schema";
import { apiRequest } from "./queryClient";

// Dashboard API
export const fetchDashboardSummary = async (userId: number) => {
  const response = await fetch(`/api/dashboard/summary?userId=${userId}`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch dashboard summary data');
  }
  return response.json();
};

// Content API
export const generateContent = async (contentRequest: ContentGenerationRequest) => {
  try {
    const response = await apiRequest('POST', '/api/content/generate', contentRequest);
    return response.json();
  } catch (error) {
    console.error('Content generation failed:', error);
    throw error;
  }
};

export const saveContent = async (content: any) => {
  try {
    const response = await apiRequest('POST', '/api/content', content);
    return response.json();
  } catch (error) {
    console.error('Content saving failed:', error);
    throw error;
  }
};

export const fetchUserContent = async (userId: number) => {
  const response = await fetch(`/api/content?userId=${userId}`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch user content');
  }
  return response.json();
};

// Image API
export const generateImage = async (imageRequest: ImageGenerationRequest) => {
  try {
    const response = await apiRequest('POST', '/api/images/generate', imageRequest);
    return response.json();
  } catch (error) {
    console.error('Image generation failed:', error);
    throw error;
  }
};

export const saveImage = async (image: any) => {
  try {
    const response = await apiRequest('POST', '/api/images', image);
    return response.json();
  } catch (error) {
    console.error('Image saving failed:', error);
    throw error;
  }
};

export const fetchUserImages = async (userId: number) => {
  const response = await fetch(`/api/images?userId=${userId}`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch user images');
  }
  return response.json();
};

// Calendar Events API
export const fetchCalendarEvents = async (userId: number) => {
  const response = await fetch(`/api/events?userId=${userId}`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch calendar events');
  }
  return response.json();
};

export const createCalendarEvent = async (eventData: any) => {
  try {
    const response = await apiRequest('POST', '/api/events', eventData);
    return response.json();
  } catch (error) {
    console.error('Event creation failed:', error);
    throw error;
  }
};

export const updateCalendarEvent = async (eventId: number, eventData: any) => {
  try {
    const response = await apiRequest('PATCH', `/api/events/${eventId}`, eventData);
    return response.json();
  } catch (error) {
    console.error('Event update failed:', error);
    throw error;
  }
};

// Campaign Metrics API
export const fetchCampaignMetrics = async (userId: number) => {
  const response = await fetch(`/api/metrics?userId=${userId}`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch campaign metrics');
  }
  return response.json();
};

// Google Integration APIs
export const fetchGoogleAdsData = async (userId: number) => {
  const response = await fetch(`/api/google/ads?userId=${userId}`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch Google Ads data');
  }
  return response.json();
};

export const fetchGoogleAnalyticsData = async (userId: number) => {
  const response = await fetch(`/api/google/analytics?userId=${userId}`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch Google Analytics data');
  }
  return response.json();
};

export const fetchIntegrations = async (userId: number) => {
  const response = await fetch(`/api/integrations?userId=${userId}`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error('Failed to fetch integrations');
  }
  return response.json();
};

export const getGoogleAuthUrl = async (service: 'google_ads' | 'google_analytics') => {
  const response = await fetch(`/api/auth/google/${service}`, {
    credentials: 'include'
  });
  if (!response.ok) {
    throw new Error(`Failed to get authentication URL for ${service}`);
  }
  return response.json();
};
