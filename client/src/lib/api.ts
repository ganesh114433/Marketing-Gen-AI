import { apiRequest } from "./queryClient";

// User API
export async function getCurrentUser() {
  const res = await apiRequest("GET", "/api/user");
  return res.json();
}

// Campaign API
export async function getCampaigns(userId: number) {
  const res = await apiRequest("GET", `/api/campaigns?userId=${userId}`);
  return res.json();
}

export async function getCampaign(id: number) {
  const res = await apiRequest("GET", `/api/campaigns/${id}`);
  return res.json();
}

export async function createCampaign(campaignData: any) {
  const res = await apiRequest("POST", "/api/campaigns", campaignData);
  return res.json();
}

export async function updateCampaign(id: number, campaignData: any) {
  const res = await apiRequest("PUT", `/api/campaigns/${id}`, campaignData);
  return res.json();
}

export async function deleteCampaign(id: number) {
  await apiRequest("DELETE", `/api/campaigns/${id}`);
  return true;
}

// Content API
export async function getContents(userId: number, filters?: any) {
  let url = `/api/contents?userId=${userId}`;
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url += `&${key}=${value}`;
      }
    });
  }
  
  const res = await apiRequest("GET", url);
  return res.json();
}

export async function getContent(id: number) {
  const res = await apiRequest("GET", `/api/contents/${id}`);
  return res.json();
}

export async function createContent(contentData: any) {
  const res = await apiRequest("POST", "/api/contents", contentData);
  return res.json();
}

export async function updateContent(id: number, contentData: any) {
  const res = await apiRequest("PUT", `/api/contents/${id}`, contentData);
  return res.json();
}

export async function deleteContent(id: number) {
  await apiRequest("DELETE", `/api/contents/${id}`);
  return true;
}

export async function generateAiContent(data: { contentType: string; topic: string; tone: string; additionalContext?: string }) {
  const res = await apiRequest("POST", "/api/contents/generate", data);
  return res.json();
}

export async function generateContentFromEvent(data: { eventId: number; contentType: string; tone: string }) {
  const res = await apiRequest("POST", "/api/contents/generate-from-event", data);
  return res.json();
}

// Image Generation API
export async function generateImagePrompt(data: { topic: string; style: string; industry: string }) {
  const res = await apiRequest("POST", "/api/images/prompt", data);
  return res.json();
}

export async function generateImage(data: { prompt: string }) {
  const res = await apiRequest("POST", "/api/images/generate", data);
  return res.json();
}

export async function generateMarketingImage(data: { topic: string; style: string; industry: string }) {
  const res = await apiRequest("POST", "/api/images/marketing", data);
  return res.json();
}

// Analytics API
export async function getDashboardAnalytics(userId: number) {
  const res = await apiRequest("GET", `/api/analytics/dashboard?userId=${userId}`);
  return res.json();
}

export async function getGoogleAnalyticsData(dateRange?: { startDate: string; endDate: string }) {
  let url = "/api/analytics/google";
  
  if (dateRange) {
    url += `?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
  }
  
  const res = await apiRequest("GET", url);
  return res.json();
}

export async function getGoogleAdsData(campaignIds?: string[], dateRange?: { startDate: string; endDate: string }) {
  let url = "/api/analytics/ads";
  const params = [];
  
  if (campaignIds && campaignIds.length > 0) {
    params.push(`campaignIds=${campaignIds.join(',')}`);
  }
  
  if (dateRange) {
    params.push(`startDate=${dateRange.startDate}`);
    params.push(`endDate=${dateRange.endDate}`);
  }
  
  if (params.length > 0) {
    url += `?${params.join('&')}`;
  }
  
  const res = await apiRequest("GET", url);
  return res.json();
}

// Calendar Event API
export async function getEvents(userId: number) {
  const res = await apiRequest("GET", `/api/events?userId=${userId}`);
  return res.json();
}

export async function getEvent(id: number) {
  const res = await apiRequest("GET", `/api/events/${id}`);
  return res.json();
}

export async function createEvent(eventData: any) {
  const res = await apiRequest("POST", "/api/events", eventData);
  return res.json();
}

export async function updateEvent(id: number, eventData: any) {
  const res = await apiRequest("PUT", `/api/events/${id}`, eventData);
  return res.json();
}

export async function deleteEvent(id: number) {
  await apiRequest("DELETE", `/api/events/${id}`);
  return true;
}

export async function getUpcomingEvents(userId: number) {
  const res = await apiRequest("GET", `/api/events/upcoming?userId=${userId}`);
  return res.json();
}
